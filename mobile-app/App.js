import ViewEntryScreen from './screens/ViewEntryScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import AccountInfoScreen from './screens/AccountInfoScreen';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ProfilePicProvider } from './contexts/ProfilePicContext';
import { UISettingsProvider } from './contexts/UISettingsContext';
import HomeScreen from './screens/HomeScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import EditEntryScreen from './screens/EditEntryScreen';
import SettingsScreen from './screens/SettingsScreen';
import UISettingsScreen from './screens/UISettingsScreen';
import RecycleBinScreen from './screens/RecycleBinScreen';
import CustomThemeScreen from './screens/CustomThemeScreen';
import NavigateScreen from './screens/NavigateScreen';
import OverviewScreen from './screens/OverviewScreen';
import CloudSettingsScreen from './screens/CloudSettingsScreen';
import AISettingsScreen from './screens/AISettingsScreen';
import InsightsScreen from './screens/InsightsScreen';
import AppGlassBackground from './components/AppGlassBackground';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, currentTheme } = useTheme();
  
  if (!theme) {
    return null;
  }
  
  return (
    <View style={styles.appShell}>
      <AppGlassBackground />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: currentTheme === 'glassmorphism' ? 'transparent' : theme.background },
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                  opacity: current.progress.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                },
              };
            },
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 300,
                },
              },
              close: {
                animation: 'timing',
                config: {
                  duration: 250,
                },
              },
            },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddEntry" component={AddEntryScreen} />
          <Stack.Screen name="EditEntry" component={EditEntryScreen} />
          <Stack.Screen name="ViewEntry" component={ViewEntryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Navigate" component={NavigateScreen} />
          <Stack.Screen name="Overview" component={OverviewScreen} />
          <Stack.Screen name="CustomTheme" component={CustomThemeScreen} />
          <Stack.Screen name="RecycleBin" component={RecycleBinScreen} />
          <Stack.Screen name="UISettings" component={UISettingsScreen} />
          <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
          <Stack.Screen name="CloudSettings" component={CloudSettingsScreen} />
          <Stack.Screen name="AISettings" component={AISettingsScreen} />
          <Stack.Screen name="Insights" component={InsightsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  React.useEffect(() => {
    const webId = Constants.expoConfig?.extra?.googleClientId;
    const androidId = Constants.expoConfig?.extra?.androidGoogleClientId;
    console.log('Google Sign-In Config:', { webId, androidId });
    
    GoogleSignin.configure({
      webClientId: webId,
    });
  }, []);

  return (
    <ThemeProvider>
      <ProfilePicProvider initialPic={null}>
        <UISettingsProvider>
          <AppNavigator />
        </UISettingsProvider>
      </ProfilePicProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
