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

    const { userId } = await req.json()
    if (!userId) throw new Error('User ID is required');

    const today = new Date().toISOString().split('T')[0];
    
    const { data: userTrips, error: memberError } = await supabaseClient
      .from('Trip_Members')
      .select('trip_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;

    const tripIds = userTrips.map(t => t.trip_id);
    if (tripIds.length === 0) return new Response(JSON.stringify([]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

    const { data, error } = await supabaseClient
      .from('Trips')
      .select(`
        trip_id,
        trip_name,
        start_date,
        end_date,
        cover_photo_url,
        Trip_Members ( Users ( user_id, first_name, last_name, avatar_url ) ),
        Trip_Destinations ( cached_destinations ( city, country, cover_image_url ) ) 
      `) // ^^^ FIXED: Changed 'name' to 'city' here!
      .in('trip_id', tripIds)
      .gte('end_date', today);

    if (error) throw error;

    const formattedTrips = data.map((trip: any) => {
      const primaryDestination = trip.Trip_Destinations?.[0]?.cached_destinations;
      
      return {
        id: trip.trip_id,
        name: trip.trip_name,
        // FIXED: Using .city instead of .name
        destinations: primaryDestination ? `${primaryDestination.city}, ${primaryDestination.country}` : 'TBD',
        startDate: trip.start_date,
        endDate: trip.end_date,
        image: trip.cover_photo_url || primaryDestination?.cover_image_url || null,
        readinessPercent: 60,
        group: trip.Trip_Members?.map((member: any, index: number) => {
          const user = member.Users; 
          return {
            id: user?.user_id,
            name: `${user?.first_name || 'U'} ${user?.last_name?.charAt(0) || ''}.`,
            initials: `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`,
            profileColor: ['#1E90FF', '#32CD32', '#FFA500'][index % 3], 
            profilePic: user?.avatar_url,
            active: user?.user_id === userId
          };
        }) || []
      };
    });

    return new Response(JSON.stringify(formattedTrips), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})

  } catch (error: any) {
    // Better logging so we can see exact errors in the Supabase Dashboard!
    console.error("💥 Function Error:", error); 
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})