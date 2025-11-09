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
    const { job_description, user_id } = await req.json();

    if (!job_description || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing job_description or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[match-job] Matching job for user: ${user_id}`);

    // Fetch user's skills from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userSkills, error: fetchError } = await supabase
      .from('skills')
      .select('skill_name, confidence, category, source')
      .eq('user_id', user_id);

    if (fetchError) {
      throw new Error(`Failed to fetch user skills: ${fetchError.message}`);
    }

    if (!userSkills || userSkills.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No skills found for user. Please extract skills from CV or GitHub first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[match-job] User has ${userSkills.length} skills`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use Lovable AI to match skills and generate analysis
    const userSkillsList = userSkills.map(s => s.skill_name).join(', ');
    
    const aiPrompt = `You are an expert job matching system. Compare the candidate's skills with the job requirements.

USER'S SKILLS:
${userSkillsList}

JOB DESCRIPTION:
${job_description}

Analyze and return a JSON object with:
{
  "match_score": <number 0-100>,
  "matching_skills": [{"skill": "name", "confidence": <0-1>}],
  "missing_skills": [{"skill": "name", "priority": "high|medium|low", "learning_time": "X weeks"}],
  "recommendations": ["actionable advice 1", "actionable advice 2", "actionable advice 3"]
}

Be realistic about match_score (0-100). Identify 3-8 missing skills max. Provide 3-5 specific recommendations.
Return ONLY valid JSON with NO markdown formatting.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a job matching expert. Always return valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[match-job] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let matchText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Clean markdown formatting
    matchText = matchText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let matchResult;
    try {
      matchResult = JSON.parse(matchText);
    } catch (parseError) {
      console.error('[match-job] JSON parse error:', parseError, 'Raw:', matchText);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`[match-job] Match score: ${matchResult.match_score}%`);

    return new Response(
      JSON.stringify({ 
        success: true,
        ...matchResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[match-job] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
