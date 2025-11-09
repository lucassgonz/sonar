import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cv_text, user_id } = await req.json();

    if (!cv_text || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing cv_text or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[parse-cv] Processing CV for user: ${user_id}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Validate input is not binary data
    if (cv_text.startsWith('%PDF') || cv_text.includes('\x00') || cv_text.includes('�')) {
      return new Response(
        JSON.stringify({ 
          error: 'Binary file detected. Please paste text content or upload a .txt file instead of PDF.',
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to extract skills (replicating Python NER + semantic analysis)
    const aiPrompt = `You are an expert skill extraction system. Analyze the following CV/resume text and extract ALL relevant professional skills.

Extract both:
1. EXPLICIT SKILLS: Technical skills, tools, frameworks, programming languages directly mentioned
2. IMPLICIT SKILLS: Soft skills and competencies inferred from experience descriptions (leadership, communication, problem-solving, etc.)

For each skill provide:
- name: The skill name (normalize to standard terms)
- confidence: Float 0-1 (how confident you are this is a real skill)
- category: One of: "technical", "soft_skill", "domain_knowledge", "tool", "language"
- evidence: Brief quote from CV showing this skill (max 100 chars)

CV Text:
${cv_text.substring(0, 8000)}

CRITICAL: Return ONLY a valid JSON array. No markdown, no explanation, just the array:
[{"name":"Python","confidence":0.95,"category":"language","evidence":"5 years Python development"},{"name":"Leadership","confidence":0.85,"category":"soft_skill","evidence":"Managed team of 5 developers"}]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a skill extraction expert. Always return valid JSON arrays only.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[parse-cv] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let skillsText = aiData.choices?.[0]?.message?.content || '[]';
    
    console.log('[parse-cv] Raw AI response:', skillsText.substring(0, 200));
    
    // Aggressive cleaning of markdown and extra formatting
    skillsText = skillsText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\n\r]+/, '')
      .replace(/[\s\n\r]+$/, '')
      .trim();
    
    // Try to extract JSON array if it's embedded in text
    const jsonMatch = skillsText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      skillsText = jsonMatch[0];
    }
    
    let extractedSkills;
    try {
      extractedSkills = JSON.parse(skillsText);
    } catch (parseError) {
      console.error('[parse-cv] JSON parse error:', parseError);
      console.error('[parse-cv] Cleaned text:', skillsText.substring(0, 500));
      
      // Last resort: try to fix common JSON issues
      try {
        // Remove trailing commas
        const fixedText = skillsText.replace(/,(\s*[}\]])/g, '$1');
        extractedSkills = JSON.parse(fixedText);
        console.log('[parse-cv] Fixed JSON successfully');
      } catch (secondError) {
        console.error('[parse-cv] Could not fix JSON:', secondError);
        throw new Error(`Failed to parse AI response. AI returned: ${skillsText.substring(0, 200)}...`);
      }
    }

    if (!Array.isArray(extractedSkills)) {
      throw new Error('AI response is not an array');
    }

    console.log(`[parse-cv] Extracted ${extractedSkills.length} skills`);

    // Filter hallucinations: min confidence 0.6, deduplicate
    const filtered = extractedSkills.filter(s => 
      s.confidence >= 0.6 && 
      s.name && 
      s.name.length > 1 &&
      s.name.length < 100
    );

    // Deduplicate by lowercase name
    const deduped = Array.from(
      new Map(filtered.map(s => [s.name.toLowerCase(), s])).values()
    );

    // Save to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear ALL existing skills for this user (CV + GitHub + any other sources)
    await supabase
      .from('skills')
      .delete()
      .eq('user_id', user_id);

    // Insert new skills
    const skillsToInsert = deduped.map(skill => ({
      user_id,
      skill_name: skill.name,
      category: skill.category || 'technical',
      confidence: String(Math.round(skill.confidence * 100)) + '%',
      trend: '+0%', // New skill, no trend yet
      source: 'cv',
    }));

    const { error: insertError } = await supabase
      .from('skills')
      .insert(skillsToInsert);

    if (insertError) {
      console.error('[parse-cv] Insert error:', insertError);
      throw new Error(`Failed to save skills: ${insertError.message}`);
    }

    console.log(`[parse-cv] Saved ${skillsToInsert.length} skills to database`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        skills_count: skillsToInsert.length,
        skills: deduped 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[parse-cv] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
