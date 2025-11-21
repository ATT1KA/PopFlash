import React, { type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useColorScheme } from 'react-native';

import { palette } from '@lib/palette';
import { surfaceColors } from '@lib/theme';

interface ScreenContainerProps {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ScreenContainer = ({
  children,
  refreshing = false,
  onRefresh,
}: ScreenContainerProps) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? surfaceColors.backgroundDark : palette.slate50,
        },
      ]}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            progressViewOffset={24}
            tintColor={surfaceColors.primary}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
});
