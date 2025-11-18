import { View, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

interface MetricHighlightProps {
  label: string;
  value: string;
  deltaLabel: string;
  positive?: boolean;
}

export function MetricHighlight({
  label,
  value,
  deltaLabel,
  positive = true,
}: MetricHighlightProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: radii.lg,
        gap: spacing.sm,
      }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.bodyMedium,
          fontSize: 14,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: typography.heading,
          fontSize: 32,
          letterSpacing: 0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: positive ? colors.primary : colors.danger,
          fontFamily: typography.bodyMedium,
          fontSize: 13,
        }}
      >
        {deltaLabel}
      </Text>
    </View>
  );
}
