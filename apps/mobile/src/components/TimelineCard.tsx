import { View, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

type Severity = 'low' | 'moderate' | 'high';

const SEVERITY_TONE: Record<Severity, string> = {
  low: colors.success,
  moderate: colors.warning,
  high: colors.danger,
};

interface TimelineCardProps {
  title: string;
  window: string;
  severity: Severity;
}

export function TimelineCard({ title, window, severity }: TimelineCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.lg,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: typography.bodyBold,
          fontSize: 15,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: SEVERITY_TONE[severity],
          }}
        />
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.body,
            fontSize: 13,
          }}
        >
          {window}
        </Text>
      </View>
    </View>
  );
}
