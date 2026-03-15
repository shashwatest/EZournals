import * as ImagePicker from 'expo-image-picker';

export async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access media library was denied');
  }
  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });
  if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
    return pickerResult.assets[0].uri;
  }
  return null;
}
