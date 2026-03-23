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

    const { tripId, userId } = await req.json()
    if (!tripId) throw new Error('Trip ID is required');

    const { data: docs, error } = await supabaseClient
      .from('documents') // Correct lowercase table
      .select(`
        doc_id,
        file_name,
        file_url,
        file_size_bytes,
        file_type,
        upload_timestamp,
        Users ( first_name, last_name )
      `)
      .eq('trip_id', tripId)
      .eq('uploader_id', userId)
      .order('upload_timestamp', { ascending: false });

    if (error) throw error;

    const formattedDocs = docs.map((doc: any) => ({
      id: doc.doc_id,
      title: doc.file_name,
      url: doc.file_url,
      size: doc.file_size_bytes ? doc.file_size_bytes : 'Unknown Size',
      date: new Date(doc.upload_timestamp).toLocaleDateString(),
      // FIXED THE JOIN: Changed `doc.users` to `doc.Users`
      uploader: doc.Users ? `${doc.Users.first_name} ${doc.Users.last_name}` : 'Unknown'
    }));

    return new Response(JSON.stringify(formattedDocs), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})