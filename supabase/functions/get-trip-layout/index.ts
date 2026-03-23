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
    if (!tripId || !userId) throw new Error('Trip ID and User ID are required');

    const { data: trip, error } = await supabaseClient
      .from('Trips')
      .select(`
        trip_id,
        trip_name,
        start_date,
        end_date,
        cover_photo_url,
        target_budget,
        Trip_Destinations ( cached_destinations ( city, country, cover_image_url ) ),
        Trip_Members ( user_id, role, Users ( first_name, last_name, avatar_url ) )
      `)
      .eq('trip_id', tripId)
      .single();

    if (error) throw error;

    const today = new Date();
    const startDate = new Date(trip.start_date);
    const timeDiff = startDate.getTime() - today.getTime();
    const takeoffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const destinationsStr = trip.Trip_Destinations
        ?.map((td: any) => td.cached_destinations)
        .filter(Boolean)
        .map((cd: any) => `${cd.city}, ${cd.country}`)
        .join(' & ') || 'TBD';

    const fallbackImage = trip.Trip_Destinations?.[0]?.cached_destinations?.cover_image_url || null;

    const layoutData = {
        id: trip.trip_id,
        name: trip.trip_name,
        destination: destinationsStr,
        startDate: trip.start_date,
        endDate: trip.end_date,
        image: trip.cover_photo_url || fallbackImage,
        takeoffDays: takeoffDays > 0 ? takeoffDays : 0,
        targetBudget: trip.target_budget,
        readinessPercent: 0, 
        group: trip.Trip_Members?.map((member: any, index: number) => {
            const user = member.Users;
            return {
                id: member.user_id,
                name: `${user?.first_name || 'U'} ${user?.last_name?.charAt(0) || ''}.`,
                initials: `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`,
                profileColor: ['#1E90FF', '#32CD32', '#FFA500', '#FF4500', '#8A2BE2'][index % 5],
                profilePic: user?.avatar_url,
                active: member.user_id === userId,
                role: member.role
            };
        }) || []
    };

    return new Response(JSON.stringify(layoutData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})