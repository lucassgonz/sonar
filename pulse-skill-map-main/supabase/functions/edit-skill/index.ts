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
    const { skill_id, updates, user_id } = await req.json();

    if (!skill_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing skill_id or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[edit-skill] Updating skill ${skill_id} for user ${user_id}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build update object (only allow safe fields)
    const allowedFields = ['skill_name', 'confidence', 'category', 'trend'];
    const updateData: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update with RLS check (user must own the skill)
    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', skill_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('[edit-skill] Update error:', error);
      throw new Error(`Failed to update skill: ${error.message}`);
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Skill not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[edit-skill] Successfully updated skill ${skill_id}`);

    return new Response(
      JSON.stringify({ success: true, skill: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[edit-skill] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
