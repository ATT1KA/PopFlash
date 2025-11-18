import { View, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

interface InsightCardProps {
  headline: string;
  detail: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
}

const SENTIMENT_COLOR: Record<InsightCardProps['sentiment'], string> = {
  bullish: colors.success,
  neutral: colors.textSecondary,
  bearish: colors.danger,
};

export function InsightCard({ headline, detail, sentiment }: InsightCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceAlt,
        padding: spacing.lg,
        borderRadius: radii.md,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.bodyBold,
            fontSize: 16,
            flex: 1,
          }}
        >
          {headline}
        </Text>
        <View
          style={{
            marginLeft: spacing.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radii.sm,
            backgroundColor: SENTIMENT_COLOR[sentiment],
          }}
        >
          <Text
            style={{
              color: sentiment === 'neutral' ? colors.surface : colors.background,
              fontFamily: typography.bodyMedium,
              fontSize: 11,
            }}
          >
            {sentiment.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.body,
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        {detail}
      </Text>
    </View>
  );
}
