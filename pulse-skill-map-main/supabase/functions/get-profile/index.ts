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
    // Get user_id from Authorization header (JWT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user ID from JWT using Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user_id = user.id;
    console.log(`[get-profile] Fetching profile for user: ${user_id}`);

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.error('[get-profile] Profile fetch error:', profileError);
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    // Fetch all skills
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user_id)
      .order('confidence', { ascending: false });

    if (skillsError) {
      console.error('[get-profile] Skills fetch error:', skillsError);
      throw new Error(`Failed to fetch skills: ${skillsError.message}`);
    }

    // Group skills by source and category
    const skillsBySource = skills?.reduce((acc, skill) => {
      const source = skill.source || 'unknown';
      if (!acc[source]) acc[source] = [];
      acc[source].push(skill);
      return acc;
    }, {} as Record<string, any[]>) || {};

    const skillsByCategory = skills?.reduce((acc, skill) => {
      const category = skill.category || 'technical';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, any[]>) || {};

    console.log(`[get-profile] Found ${skills?.length || 0} skills`);

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        skills: skills || [],
        skills_by_source: skillsBySource,
        skills_by_category: skillsByCategory,
        stats: {
          total_skills: skills?.length || 0,
          cv_skills: skillsBySource['cv']?.length || 0,
          github_skills: skillsBySource['github']?.length || 0,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-profile] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
