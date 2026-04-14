import { supabase } from "@/src/lib/supabase";

const TRIPS_TABLE = "Trips";
const DESTINATIONS_TABLE = "Trip_Destinations";
const CACHED_DESTINATIONS_TABLE = "cached_destinations";
const TRIP_MEMBERS_TABLE = "Trip_Members";

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function toTimestampWithoutTimezone(value) {
  const date = normalizeDate(value);
  return date ? `${date}T12:00:00` : null;
}

function parseDestinationInput(destination) {
  const raw = String(destination || "").trim();

  if (!raw) {
    return {
      raw: "",
      city: null,
      country: null,
      label: null,
    };
  }

  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    return {
      raw,
      city: null,
      country: parts[0],
      label: parts[0],
    };
  }

  return {
    raw,
    city: parts.slice(0, -1).join(", "),
    country: parts.at(-1) || parts[0],
    label: raw,
  };
}

function formatDestinationLabel(destinationRow, fallbackValue = null) {
  if (!destinationRow) return fallbackValue;

  const city = String(destinationRow.city || "").trim();
  const country = String(destinationRow.country || "").trim();

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return fallbackValue;
}

function normalizeTripRow(row, destinationLabel = null) {
  if (!row) return null;

  return {
    ...row,
    id: row.trip_id ?? row.id ?? row.tripId,
    user_id: row.creator_id ?? row.user_id ?? row.userId,
    title: row.trip_name ?? row.title ?? row.name ?? "Untitled Trip",
    destination: destinationLabel ?? row.destination ?? row.location ?? row.place ?? "Unknown destination",
    start_date: normalizeDate(row.start_date ?? row.startDate ?? row.checkInDate),
    end_date: normalizeDate(row.end_date ?? row.endDate ?? row.checkOutDate),
    cover_photo_url: row.cover_photo_url ?? row.coverPhotoUrl ?? row.image_url ?? row.imageUrl ?? null,
    budget_estimate: Number(row.target_budget ?? row.budget_estimate ?? row.budget ?? 0),
    vibe: row.vibe ?? "Relaxing",
  };
}

function matchesUpcoming(row, today) {
  const endDate = row?.end_date;
  return !endDate || endDate >= today;
}

function matchesPast(row, today) {
  const endDate = row?.end_date;
  return !!endDate && endDate < today;
}

async function attachDestinationLabels(trips) {
  if (!trips.length) return trips.map((trip) => normalizeTripRow(trip));

  const tripIds = trips.map((trip) => trip.trip_id).filter(Boolean);
  if (!tripIds.length) return trips.map((trip) => normalizeTripRow(trip));

  const { data: links, error: linksError } = await supabase
    .from(DESTINATIONS_TABLE)
    .select("trip_id, destination_id, arrival_date, departure_date")
    .in("trip_id", tripIds);

  if (linksError || !links?.length) {
    if (linksError) {
      console.warn("Could not load trip destinations:", linksError.message);
    }
    return trips.map((trip) => normalizeTripRow(trip));
  }

  const destinationIds = [...new Set(links.map((link) => link.destination_id).filter(Boolean))];

  const { data: destinations, error: destinationsError } = await supabase
    .from(CACHED_DESTINATIONS_TABLE)
    .select("destination_id, city, country, cover_image_url")
    .in("destination_id", destinationIds);

  if (destinationsError) {
    console.warn("Could not load cached destinations:", destinationsError.message);
    return trips.map((trip) => normalizeTripRow(trip));
  }

  const destinationMap = new Map((destinations || []).map((row) => [row.destination_id, row]));
  const linkMap = new Map();

  for (const link of links) {
    if (!linkMap.has(link.trip_id)) {
      linkMap.set(link.trip_id, link);
    }
  }

  return trips.map((trip) => {
    const link = linkMap.get(trip.trip_id);
    const destinationRow = link ? destinationMap.get(link.destination_id) : null;
    const normalized = normalizeTripRow(trip, formatDestinationLabel(destinationRow));

    if (link?.arrival_date && !normalized.start_date) {
      normalized.start_date = normalizeDate(link.arrival_date);
    }
    if (link?.departure_date && !normalized.end_date) {
      normalized.end_date = normalizeDate(link.departure_date);
    }
    if (destinationRow?.cover_image_url && !normalized.cover_photo_url) {
      normalized.cover_photo_url = destinationRow.cover_image_url;
    }

    return normalized;
  });
}

/**
 * A helper function to read all trips for a user, including their associated destinations and normalized fields. 
 * This is used internally by the getUpcomingTrips and getPastTrips functions to fetch the relevant trips before filtering and sorting them.
 * 
 * @param userId - The ID of the user whose trips we want to retrieve.
 * @returns - A promise that resolves to an array of trip objects that the user is a member of, with normalized fields and attached destination labels if available.
 */
export async function getAllTripsForUser(userId) {
  // Step 1: Get the list of trip_ids this user is a part of
  const { data: userMemberships, error: memberError } = await supabase
    .from("Trip_Members")
    .select("trip_id")
    .eq("user_id", userId);

  if (!userMemberships || userMemberships.length === 0) {
    return attachDestinationLabels([]);
  }

  // Get the trip IDs
  const tripIds = userMemberships.map((m) => m.trip_id);

  // Step 2: Fetch those specific trips, grab ALL members, AND their profile data
  const { data: tripsData, error: tripsError } = await supabase
    .from(TRIPS_TABLE)
    .select(`
      *, 
      Trip_Members (
        user_id,
        Users (
          first_name,
          last_name,
          avatar_url
        )
      )
    `) 
    .in("trip_id", tripIds)
    .order("start_date", { ascending: true, nullsFirst: false });
  if (tripsError) throw tripsError;

  return attachDestinationLabels(tripsData ?? []);
}

export async function createTripDestinationLink(tripId, destination, startDate, endDate) {
  console.log(destination.length, '\n')
  for(let i=0; i<destination.length; i++) {
    console.log(destination[i], '\n')

    const city = destination[i].city;
    const country = destination[i].country;
    const countryCode = destination[i].countryCode;
    const lat = parseFloat(destination[i].latitude);
    const lng = parseFloat(destination[i].longitude);

    try {
      const { data: existingDest } = await supabase
        .from(CACHED_DESTINATIONS_TABLE)
        .select("destination_id")
        .eq("city", city)
        .eq("country", country)
        .single();

      let destinationId = existingDest?.destination_id;

      if (!destinationId) {
        const { data: destinationRow, error: destinationError } = await supabase
          .from(CACHED_DESTINATIONS_TABLE)
          .insert({
            city: city,
            country: country,
            country_code: countryCode,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          })
          .select("destination_id, city, country")
          .single();

          console.log("Destinaton Row:", destinationRow)

        if (destinationError) throw destinationError;
        destinationId = destinationRow?.destination_id;
      }

      const { error: linkError } = await supabase
        .from(DESTINATIONS_TABLE)
        .insert({
          trip_id: tripId,
          destination_id: destinationId,
          arrival_date: toTimestampWithoutTimezone(startDate),
          departure_date: toTimestampWithoutTimezone(endDate),
        });

      if (linkError) {
        console.warn("Could not link trip destination:", linkError.message);
      }
    }
    catch (error) {
      console.log("Error in createTripDestinationLink:", error.message);
    }
  }
  
}

async function ensureCreatorMembership(userId, tripId) {
  const { error } = await supabase.from(TRIP_MEMBERS_TABLE).insert([
    {
      user_id: userId,
      trip_id: tripId,
      role: "owner",
      status: "accepted",
    },
  ]);

  if (error) {
    console.warn("Could not add creator to Trip_Members:", error.message);
  }
}

async function addTripMembers(tripId, memberIds = []) {
  const uniqueMemberIds = [...new Set((memberIds || []).filter(Boolean).map(String))];
  if (!tripId || !uniqueMemberIds.length) return;

  const payload = uniqueMemberIds.map((memberId) => ({
    user_id: memberId,
    trip_id: tripId,
    role: "member",
    status: "accepted",
  }));

  const { error } = await supabase.from(TRIP_MEMBERS_TABLE).insert(payload);

  if (error) {
    console.warn("Could not add invited members:", error.message);
  }
}

/**
 * Creates a new trip with the provided values and inserts it into the database. 
 * Also handles creating the associated destination link and ensuring the creator is a member of the trip.
 * 
 * @param values - An object containing the following properties:
 *   - userId: The ID of the user creating the trip (required)
 *   - title: The name of the trip (required)
 *   - destination: The destination of the trip (optional)
 *   - startDate: The start date of the trip (optional, should be in a format recognized by JavaScript's Date)
 *   - endDate: The end date of the trip (optional, should be in a format recognized by JavaScript's Date)
 *   - coverPhotoUrl: A URL for the trip's cover photo (optional)
 *   - budgetEstimate: A numeric estimate for the trip's budget (optional)
 *   - vibe: A string representing the vibe or theme of the trip (optional, defaults to "Relaxing")
 * @returns - An object containing either an `error` property (if the operation failed) or a `trip` property with the newly created trip data (if successful).
 */
export async function createTrip(values) {
  const payload = {
    creator_id: values.userId,
    trip_name: values.title,
    start_date: normalizeDate(values.startDate),
    end_date: normalizeDate(values.endDate),
    cover_photo_url: values.coverPhotoUrl,
    target_budget: Number(values.budgetEstimate || 0),
    vibe: values.vibe || "Relaxing",
  };

  const { data, error } = await supabase
    .from(TRIPS_TABLE)
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    return { error, trip: null };
  }

  const tripId = data?.trip_id;
  if (tripId) {
    const invitedMemberIds = (values.memberIds || []).filter((memberId) => String(memberId) !== String(values.userId));

    await Promise.allSettled([
      createTripDestinationLink(tripId, values.destination, values.startDate, values.endDate),
      ensureCreatorMembership(values.userId, tripId),
      addTripMembers(tripId, invitedMemberIds),
    ]);
  }

  return { error: null, trip: normalizeTripRow(data, values.destination) };
}

/**
 * Fetches upcoming trips for a given user, sorted by start date with the soonest trips first. 
 * Trips without a start date are treated as far in the future.
 * 
 * @param userId - The ID of the user whose trips we want to retrieve.
 * @returns - A promise that resolves to an array of upcoming trips for the specified user, sorted by start date (soonest first). 
 *            Each trip object includes normalized fields and an attached destination label if available.
 */

export async function getUpcomingTrips(userId) {
  const today = new Date().toISOString().split("T")[0];
  const rows = await getAllTripsForUser(userId);
  
  // 1. Your original filtering and sorting
  const upcomingTrips = rows
    .filter((row) => matchesUpcoming(row, today))
    .sort((a, b) => String(a.start_date || "9999-12-31").localeCompare(String(b.start_date || "9999-12-31")));

  if (upcomingTrips.length === 0) return [];

  // 2. Extract just the IDs of the upcoming trips
  // (Using trip.id or trip.trip_id depending on how getAllTripsForUser maps it)
  const tripIds = upcomingTrips.map(trip => trip.id || trip.trip_id);

  // 3. Bulk fetch ONLY the start_timestamps for scheduled events in these specific trips
  const { data: eventsData, error } = await supabase
    .from('Events')
    .select('trip_id, start_timestamp')
    .in('trip_id', tripIds)
    .not('start_timestamp', 'is', null); // Only get events that are actually scheduled

  if (error) {
    console.error("Error fetching events for readiness calculation:", error);
    // Fail gracefully: return the trips anyway, the UI will fall back to 60%
    return upcomingTrips; 
  }

  // 4. Group the unique scheduled dates by trip_id for quick math
  const scheduledDatesByTrip = eventsData.reduce((acc, event) => {
    if (!acc[event.trip_id]) acc[event.trip_id] = new Set();
    // Add just the YYYY-MM-DD to the Set (Sets automatically ignore duplicates)
    acc[event.trip_id].add(event.start_timestamp.split('T')[0]); 
    return acc;
  }, {});

  // 5. Calculate readinessPercent and attach it to each trip
  return upcomingTrips.map(trip => {
    const start = new Date(trip.start_date);
    const totalTripDays = trip.end_date 
      ? Math.max(1, Math.ceil((new Date(trip.end_date) - start) / 86400000) + 1) 
      : 1;

    // Get the number of unique days planned for this specific trip
    const tripIdToMatch = trip.id || trip.trip_id;
    const plannedDays = scheduledDatesByTrip[tripIdToMatch]?.size || 0;
    
    const readinessPercent = Math.min(100, Math.round((plannedDays / totalTripDays) * 100));

    return {
      ...trip,
      readinessPercent
    };
  });
}

/**
 * Fetches past trips for a given user, sorted by end date with the most recent trips first.
 * 
 * @param userId - The ID of the user whose trips we want to retrieve.
 * @returns - A promise that resolves to an array of past trips for the specified user, sorted by end date (most recent first).
 *            Each trip object includes normalized fields and an attached destination label if available.
 */
export async function getPastTrips(userId) {
  const today = new Date().toISOString().split("T")[0];
  const rows = await getAllTripsForUser(userId);
  return rows
    .filter((row) => matchesPast(row, today))
    .sort((a, b) => String(b.end_date || "").localeCompare(String(a.end_date || "")));
}

export async function getTripById(userId, tripId) {
  const rows = await getAllTripsForUser(userId);
  return rows.find((row) => String(row.id) === String(tripId)) ?? null;
}

/**
 * Deletes a trip and all its associated data (destinations, memberships) from the database. Only the trip creator can perform this action.
 * 
 * @param userId - The ID of the user who wants to delete the trip - must be the trip creator.
 * @param tripId - The ID of the trip to delete.
 * @returns - A promise that resolves to the result of the delete operation.
 */
export async function deleteTrip(userId, tripId) {
  const cleanupTasks = [
    supabase.from(DESTINATIONS_TABLE).delete().eq("trip_id", tripId),
    supabase.from(TRIP_MEMBERS_TABLE).delete().eq("trip_id", tripId),
  ];

  await Promise.allSettled(cleanupTasks);

  return supabase.from(TRIPS_TABLE).delete().eq("trip_id", tripId).eq("creator_id", userId);
}

/**
 * Removes a user from a trip by deleting their membership record.
 * * @param userId - The ID of the user who wants to leave the trip.
 * @param tripId - The ID of the trip the user wants to leave.
 * @returns { success: boolean, error: string | null }
 */
export async function leaveTrip(userId, tripId) {
  try {
    // 1. Check if the user is the creator of the trip
    const { data: tripData, error: tripError } = await supabase
      .from('Trips')
      .select('creator_id')
      .eq('trip_id', tripId)
      .single();

    if (tripError) throw new Error("Failed to verify trip details.");

    if (tripData.creator_id === userId) {
      throw new Error("As the trip creator, you cannot leave the trip. You must delete the trip or transfer ownership.");
    }

    // 2. Attempt to delete the membership
    const { error: deleteError } = await supabase
      .from('Trip_Members') // Ensure this matches your actual table name exactly
      .delete()
      .eq("user_id", userId)
      .eq("trip_id", tripId);

    if (deleteError) {
      // This will catch RLS errors or network issues
      throw new Error(deleteError.message);
    }
    console.log("User left trip successfully.");
    return { success: true, error: null };

  } catch (err) {
    console.error("Error leaving trip:", err.message);
    return { success: false, error: err.message };
  }
}
