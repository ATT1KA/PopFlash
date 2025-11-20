import { MaterialCommunityIcons, Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { palette } from '@lib/palette';
import { surfaceColors } from '@lib/theme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: surfaceColors.primary,
        tabBarInactiveTintColor: isDark ? palette.slate600 : palette.slate750,
        tabBarStyle: {
          backgroundColor: isDark ? palette.night : palette.cardLight,
          borderTopColor: isDark ? palette.slate850 : palette.slate200,
        },
        headerStyle: {
          backgroundColor: isDark ? palette.night : palette.slate50,
        },
        headerTintColor: isDark ? palette.slate50 : palette.navy,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requirements"
        options={{
          title: 'Requirements',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-text-search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="verifications"
        options={{
          title: 'Verifications',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="shield" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="audit"
        options={{
          title: 'Audit Trail',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="financial"
        options={{
          title: 'Financial',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bank" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
