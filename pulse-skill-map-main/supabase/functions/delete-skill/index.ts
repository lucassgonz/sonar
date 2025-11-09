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
    const { skill_id, user_id } = await req.json();

    if (!skill_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing skill_id or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[delete-skill] Deleting skill ${skill_id} for user ${user_id}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete with RLS check (user must own the skill)
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skill_id)
      .eq('user_id', user_id);

    if (error) {
      console.error('[delete-skill] Delete error:', error);
      throw new Error(`Failed to delete skill: ${error.message}`);
    }

    console.log(`[delete-skill] Successfully deleted skill ${skill_id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Skill deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[delete-skill] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
