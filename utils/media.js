import * as ImagePicker from 'expo-image-picker';

export async function pickImage() {
  let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (result.status !== 'granted') {
    throw new Error('Permission to access media library was denied');
  }
  let pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images,
    allowsEditing: true,
    quality: 0.7,
  });
  if (!pickerResult.cancelled) {
    return pickerResult.uri;
  }
  return null;
}
