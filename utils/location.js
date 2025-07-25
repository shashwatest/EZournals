import * as Location from 'expo-location';

export async function getCurrentLocation() {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }
  let location = await Location.getCurrentPositionAsync({});
  return location;
}

export function formatLocation(location) {
  if (!location) return '';
  const { latitude, longitude } = location.coords;
  return `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
}
