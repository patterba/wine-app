import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import {
  LoginScreen,
  SignUpScreen,
  EventsScreen,
  FavoritesScreen,
  ProfileScreen,
  EventDetailScreen,
} from '../screens';
import {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  const theme = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1E3A5F',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#1E3A5F',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <MainTab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <MainTab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="star" color={color} size={size} />
          ),
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account" color={color} size={size} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

// Simple icon component using text (we can replace with vector icons later)
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    calendar: '📅',
    star: '⭐',
    account: '👤',
  };

  return (
    <span style={{ fontSize: size - 4 }}>
      {icons[name] || '•'}
    </span>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E3A5F',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {user ? (
          <>
            <RootStack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="EventDetail"
              component={EventDetailScreen}
              options={{
                title: 'Event Details',
                presentation: 'card',
              }}
            />
          </>
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
