import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    )

    const { tripId } = await req.json()
    if (!tripId) throw new Error('Trip ID is required');

    const { data: journals, error } = await supabaseClient
      .from('Journals')
      .select(`
        entry_id,
        title,
        description,
        entry_timestamp,
        Photos ( photo_url )
      `)
      .eq('trip_id', tripId)
      .order('entry_timestamp', { ascending: false });

    if (error) throw error;

    const memories = journals.map((journal: any) => {
      // FIXED THE BUG: Changed `journal.photo` to `journal.Photos`
      const imageUrls = journal.Photos?.map((p: any) => p.photo_url).filter(Boolean) || [];

      const formattedDate = journal.entry_timestamp 
        ? new Date(journal.entry_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

      return {
        id: journal.entry_id,
        title: journal.title,
        description: journal.description,
        date: formattedDate,
        images: imageUrls
      };
    });

    return new Response(JSON.stringify(memories), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})