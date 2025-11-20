import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { palette } from '@lib/palette';
import { surfaceColors } from '@lib/theme';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState = ({ label = 'Loading compliance data…' }: LoadingStateProps) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={surfaceColors.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  label: {
    color: palette.slate700,
    fontSize: 16,
    fontWeight: '500',
  },
});
