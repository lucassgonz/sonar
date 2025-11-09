import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { github_username, user_id } = await req.json();
    
    if (!github_username) {
      return new Response(
        JSON.stringify({ error: 'GitHub username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract username from URL if full URL is provided
    const username = github_username.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
    
    console.log('Fetching GitHub data for:', username);

    // Fetch user profile
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'Lovable-Skills-Extractor' }
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'GitHub user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await userResponse.json();

    // Fetch user repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      headers: { 
        'User-Agent': 'SkillSense-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const reposData = await reposResponse.json();

    // Fetch profile README if available
    let readmeData = null;
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${username}/readme`, {
        headers: { 
          'User-Agent': 'SkillSense-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (readmeResponse.ok) {
        readmeData = await readmeResponse.json();
      }
    } catch (error) {
      console.log('No profile README found');
    }

    // Process repositories - fetch languages for each
    const processedRepos = [];
    
    for (const repo of reposData.slice(0, 10)) {
      try {
        // Fetch languages for each repository
        const langResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
          headers: { 
            'User-Agent': 'SkillSense-App',
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        const languages = langResponse.ok ? await langResponse.json() : {};

        processedRepos.push({
          name: repo.name,
          description: repo.description,
          topics: repo.topics || [],
          languages: languages, // e.g., {"Python": 12040, "JavaScript": 5030}
          stars: repo.stargazers_count,
          forks: repo.forks_count
        });
      } catch (error) {
        console.error(`Failed to fetch languages for ${repo.name}:`, error);
        processedRepos.push({
          name: repo.name,
          description: repo.description,
          topics: repo.topics || [],
          languages: repo.language ? { [repo.language]: 0 } : {},
          stars: repo.stargazers_count,
          forks: repo.forks_count
        });
      }
    }

    // Aggregate all data
    const githubSummary = {
      login: userData.login,
      name: userData.name,
      bio: userData.bio,
      profile_readme_url: readmeData?.html_url || null,
      public_repos: userData.public_repos,
      followers: userData.followers,
      repositories: processedRepos
    };

    console.log('GitHub data fetched, sending to AI for analysis');

    // Use Lovable AI to extract skills
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a skills extraction expert. Analyze GitHub profile data and extract technical skills organized by category. 
            For each skill, assign:
            - confidence (0-100): based on evidence from repos, languages, and activity
            - trend (up/stable/down): estimate based on recent activity
            - evidence: brief description of why this skill was identified
            
            Return ONLY valid JSON in this exact format:
            {
              "categories": [
                {
                  "name": "Category Name",
                  "icon": "icon-name",
                  "skills": [
                    {
                      "name": "Skill Name",
                      "confidence": 85,
                      "trend": "up",
                      "evidence": "Used in 5 repositories with 100+ commits"
                    }
                  ]
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Analyze this GitHub profile and extract skills:\n${JSON.stringify(githubSummary, null, 2)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze GitHub data with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const skillsText = aiData.choices[0].message.content;
    
    // Parse the AI response
    let skillProfile;
    try {
      // Remove markdown code blocks if present
      const jsonText = skillsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      skillProfile = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', skillsText);
      throw new Error('Failed to parse AI-generated skills');
    }

    console.log('Successfully extracted skills');

    // Save skills to database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Delete existing skills for this user from GitHub source
    await supabaseClient
      .from('skills')
      .delete()
      .eq('user_id', user_id)
      .eq('source', 'github');

    // Insert new skills
    if (skillProfile.categories && Array.isArray(skillProfile.categories)) {
      const skillsToInsert = skillProfile.categories.flatMap((category: any) => 
        (category.skills || []).map((skill: any) => ({
          user_id: user_id,
          category: category.name || category.category,
          skill_name: skill.name,
          confidence: skill.confidence?.toString() || '85',
          trend: skill.trend || 'stable',
          source: 'github'
        }))
      );

      if (skillsToInsert.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('skills')
          .insert(skillsToInsert);

        if (insertError) {
          console.error('Error inserting skills:', insertError);
          throw new Error('Failed to save skills to database');
        }
      }
    }

    // Update profile with GitHub username
    await supabaseClient
      .from('profiles')
      .update({ github_username: username })
      .eq('id', user_id);

    return new Response(
      JSON.stringify({ success: true, ...skillProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-github-skills:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
