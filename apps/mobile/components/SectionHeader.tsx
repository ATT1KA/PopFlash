import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { palette } from '@lib/palette';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: isDark ? palette.slate50 : palette.navy }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: isDark ? palette.slate600 : palette.slate800 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  action: {
    flexShrink: 0,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
