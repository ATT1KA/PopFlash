import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@lib/palette';

export const EmptyState = ({ message }: { message: string }) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.cobaltTint,
    borderColor: palette.dashedBorder,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  message: {
    color: palette.slate750,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
