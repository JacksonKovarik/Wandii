import * as Location from 'expo-location';

/**
 * Converts an address string into { latitude, longitude }
 * @param {string} address - The raw address from the user
 * @param {string} destinationsStr - The "City, Country & City, Country" string from TripContext
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const getCoordinatesForAddress = async (address, destinationsStr) => {
  if (!address) return null;

  // 1. Clean the address of tricky symbols (like the Japanese postal mark 〒)
  const cleanAddress = address.replace(/〒\d{3}-\d{4}\s?/g, '').trim();
  let geocodeResult = [];
  try {
    // Attempt 1: Try the exact cleaned address first
    geocodeResult = await Location.geocodeAsync(cleanAddress);
  } catch (error) {
    console.warn("LocationUtils: Attempt 1 (raw) failed.");
  }

  // Attempt 2: Use destination context if Attempt 1 failed
  if (geocodeResult.length === 0 && destinationsStr && destinationsStr !== 'TBD') {
    // Parse "City, Country & City, Country" -> ["Country", "Country"]
    const parsedCountries = destinationsStr.split('&').map(location => {
      const parts = location.split(',');
      return parts[parts.length - 1].trim();
    });

    const uniqueCountries = [...new Set(parsedCountries)];

    for (const country of uniqueCountries) {
      try {
        const searchAddress = `${cleanAddress}, ${country}`;
        const result = await Location.geocodeAsync(searchAddress);

        if (result.length > 0) {
          geocodeResult = result;
          break; // Stop looking once we find a match
        }
      } catch (err) {
        // Continue to the next country in the loop
      }
    }
  }

  // Return the first match found, or null if everything failed
  if (geocodeResult && geocodeResult.length > 0) {
    return {
      latitude: geocodeResult[0].latitude,
      longitude: geocodeResult[0].longitude,
    };
  }

  return null;
};