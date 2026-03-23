import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(`[${new Date().toISOString()}] 🚀 NEW REQUEST: get-trip-album`);

    // ⚡️ GOD MODE ENABLED: Bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    )

    const { tripId, limit = 20, offset=0 } = await req.json()

    if (!tripId) {
        return new Response(JSON.stringify({ error: 'Trip ID is required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    // Fetch ONLY photos that are NOT attached to a journal entry
    // Build the query
    let query = supabaseClient
      .from('Photos')
      .select('photo_id, photo_url, uploaded_at')
      .eq('trip_id', tripId)
      .order('uploaded_at', { ascending: false })
      .range(offset, offset + limit - 1); 

    // Apply the limit ONLY if it exists and is a number
    if (limit && typeof limit === 'number') {
      query = query.limit(limit);
    }

    const { data: albumPhotos, error } = await query;

    if (error) throw error;

    // Map to the format the React Native UI expects
    const formattedAlbum = albumPhotos.map((photo: any) => ({
      id: photo.photo_id,
      uri: photo.photo_url,
      mock: false 
    }));

    return new Response(JSON.stringify(formattedAlbum), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("💥 ERROR IN get-trip-album:", error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})