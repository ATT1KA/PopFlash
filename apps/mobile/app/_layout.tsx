import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AppState, ColorSchemeName, Platform, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@lib/query-client';
import { darkTheme, lightTheme } from '@lib/theme';

const getTheme = (scheme: ColorSchemeName | undefined) =>
  scheme === 'dark' ? darkTheme : lightTheme;

const registerFocusManager = () => {
  if (Platform.OS === 'web') {
    return () => undefined;
  }

  const listener = AppState.addEventListener('change', (state) => {
    focusManager.setFocused(state === 'active');
  });

  return () => listener.remove();
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => registerFocusManager(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={getTheme(colorScheme)}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
