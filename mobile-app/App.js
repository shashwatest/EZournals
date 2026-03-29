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
import AppAlertHost from './components/AppAlertHost';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../backend/firebase/config';
import { getMoodTags } from '../backend/utils/moodTags';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Silence Reanimated strict mode warnings (harmless warnings from color picker library)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, currentTheme } = useTheme();
  const [user, setUser] = React.useState(undefined);
  const [authError, setAuthError] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setAuthError(null);
      },
      (error) => {
        console.error('[AppNavigator] Auth state error:', error);
        setAuthError(error.message);
        setUser(null);
      }
    );

    return unsubscribe;
  }, []);
  
  if (!theme) {
    return null;
  }

  if (user === undefined) {
    return (
      <View style={[styles.centeredState, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.stateText, { color: theme.textSecondary }]}>Restoring session...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View style={[styles.centeredState, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorTitle, { color: theme.danger }]}>Authentication Error</Text>
        <Text style={[styles.stateText, { color: theme.textSecondary }]}>{authError}</Text>
      </View>
    );
  }

  const isLoggedIn = !!user;
  
  return (
    <View style={styles.appShell}>
      <AppGlassBackground />
      <NavigationContainer>
        <Stack.Navigator 
          key={isLoggedIn ? 'authenticated' : 'guest'}
          initialRouteName={isLoggedIn ? 'Home' : 'Login'}
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
          {isLoggedIn ? (
            <>
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
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <AppAlertHost />
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

    getMoodTags().catch((error) => {
      console.error('Error hydrating mood tags:', error);
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
