import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@lib/palette';
import { surfaceColors } from '@lib/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  message = 'We could not load the latest compliance data.',
  onRetry,
}: ErrorStateProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.subtitle}>{message}</Text>
    {onRetry ? (
      <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.buttonLabel}>Try again</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: surfaceColors.primary,
    borderRadius: 10,
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: palette.cardLight,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  container: {
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  subtitle: {
    color: palette.slate700,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  title: {
    color: palette.danger,
    fontSize: 18,
    fontWeight: '700',
  },
});
