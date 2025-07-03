import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import ViewEntryScreen from './screens/ViewEntryScreen';
import SettingsScreen from './screens/SettingsScreen';
import NavigateScreen from './screens/NavigateScreen';
import OverviewScreen from './screens/OverviewScreen';
import { theme } from './styles/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddEntry" component={AddEntryScreen} />
        <Stack.Screen name="ViewEntry" component={ViewEntryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Navigate" component={NavigateScreen} />
        <Stack.Screen name="Overview" component={OverviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}