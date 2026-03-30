import { Linking, Platform } from 'react-native';

/**
 * Opens the given address in the device's native maps application.
 * @param {string} address - The address to display on the map.
 */
export const openAddressInMaps = (address) => {
  if (!address) {
    console.warn("No address provided to openAddressInMaps");
    return;
  }

  const encodedAddress = encodeURIComponent(address);
  const url = Platform.select({
    ios: `maps://?q=${encodedAddress}`,
    android: `geo:0,0?q=${encodedAddress}`,
  });

  Linking.openURL(url).catch(err => 
    console.error("An error occurred trying to open maps", err)
  );
};
