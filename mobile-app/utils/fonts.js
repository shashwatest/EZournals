// Font loading utility - fonts are optional and will fallback to system fonts
export const loadFonts = async () => {
  try {
    // Uncomment and add font files to assets/fonts/ directory to enable custom fonts
    // const * as Font from 'expo-font';
    // await Font.loadAsync({
    //   'Roboto': require('../assets/fonts/Roboto-Regular.ttf'),
    //   'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    //   'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
    // });
    console.log('Font loading skipped - using system fonts');
  } catch (error) {
    console.warn('Error loading fonts:', error);
  }
};