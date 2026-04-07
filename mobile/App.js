import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import AdminScreen from './src/screens/AdminScreen';
import { Theme } from './src/theme/Theme';

// Try to import Lucide icons, fallback to simple styling if not available
import { LayoutDashboard, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Theme.colors.surfaceCard,
              borderTopColor: Theme.colors.surfaceLight,
              paddingBottom: 4,
              paddingTop: 4,
            },
            tabBarActiveTintColor: Theme.colors.primary,
            tabBarInactiveTintColor: Theme.colors.textMuted,
          }}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <LayoutDashboard color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Settings color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
