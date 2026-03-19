import { launchImageLibrary } from 'react-native-image-picker';

export async function pickImage() {
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false, quality: 0.7 },
      (response) => {
        if (response.didCancel) { resolve(null); return; }
        if (response.errorCode) { reject(new Error(response.errorMessage)); return; }
        const uri = response.assets?.[0]?.uri ?? null;
        resolve(uri);
      }
    );
  });
}
