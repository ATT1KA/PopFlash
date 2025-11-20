import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { palette } from '@lib/palette';

interface MetricCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  accentColor?: string;
}

export const MetricCard = ({
  title,
  value,
  description,
  accentColor = palette.cobalt,
}: MetricCardProps) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? palette.midnight : palette.cardLight,
          borderColor: `${accentColor}33`,
          shadowColor: isDark ? palette.black : palette.cobaltFocus,
        },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? palette.slate600 : palette.slate750 }]}>
        {title.toUpperCase()}
      </Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {description ? (
        <Text style={[styles.description, { color: isDark ? palette.slate500 : palette.slate800 }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
