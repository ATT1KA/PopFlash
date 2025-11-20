import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  label: string;
  color: string;
  background: string;
  icon?: ReactNode;
}

export const StatusBadge = ({ label, color, background, icon }: StatusBadgeProps) => (
  <View style={[styles.container, { backgroundColor: background }]}>
    {icon ? <View style={styles.icon}>{icon}</View> : null}
    <Text style={[styles.label, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
