import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { UISettingsProvider } from './contexts/UISettingsContext';
import HomeScreen from './screens/HomeScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import EditEntryScreen from './screens/EditEntryScreen';
import ViewEntryScreen from './screens/ViewEntryScreen';
import SettingsScreen from './screens/SettingsScreen';
import NavigateScreen from './screens/NavigateScreen';
import OverviewScreen from './screens/OverviewScreen';
import CustomThemeScreen from './screens/CustomThemeScreen';
import RecycleBinScreen from './screens/RecycleBinScreen';
import UISettingsScreen from './screens/UISettingsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme } = useTheme();
  
  if (!theme) {
    return null;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.background },
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UISettingsProvider>
        <AppNavigator />
      </UISettingsProvider>
    </ThemeProvider>
  );
}