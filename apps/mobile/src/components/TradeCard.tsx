import type { TradeStatus } from '@popflash/shared';
import { View, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

interface TradeCardProps {
  counterparty: string;
  status: TradeStatus;
  value: number;
  updatedAt: string;
}

const STATUS_COLOR: Record<TradeStatus, string> = {
  draft: colors.textSecondary,
  awaiting_payment: colors.warning,
  under_review: colors.accent,
  settlement_pending: colors.primary,
  settled: colors.success,
  cancelled: colors.danger,
};

const STATUS_LABEL: Record<TradeStatus, string> = {
  draft: 'Draft',
  awaiting_payment: 'Awaiting Payment',
  under_review: 'Under Review',
  settlement_pending: 'Settlement Pending',
  settled: 'Settled',
  cancelled: 'Cancelled',
};

export function TradeCard({ counterparty, status, value, updatedAt }: TradeCardProps) {
  const date = new Date(updatedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: radii.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.bodyBold,
            fontSize: 15,
          }}
        >
          {counterparty}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.body,
            fontSize: 12,
          }}
        >
          Updated {date}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.bodyBold,
            fontSize: 16,
          }}
        >
          ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </Text>
        <View
          style={{
            backgroundColor: STATUS_COLOR[status],
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            borderRadius: radii.sm,
          }}
        >
          <Text
            style={{
              fontFamily: typography.bodyMedium,
              fontSize: 11,
              color: status === 'awaiting_payment' ? colors.surface : colors.background,
            }}
          >
            {STATUS_LABEL[status]}
          </Text>
        </View>
      </View>
    </View>
  );
}
