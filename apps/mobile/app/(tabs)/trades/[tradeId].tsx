import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Section } from '@/components/Section';
import { getTradeDetail } from '@/data/mock';
import { colors, radii, spacing, typography } from '@/theme';

const STATUS_COLOR = {
  draft: colors.textSecondary,
  awaiting_payment: colors.warning,
  under_review: colors.accent,
  settlement_pending: colors.primary,
  settled: colors.success,
  cancelled: colors.danger,
} as const;

const STATUS_LABEL = {
  draft: 'Draft',
  awaiting_payment: 'Awaiting Payment',
  under_review: 'Under Review',
  settlement_pending: 'Settlement Pending',
  settled: 'Settled',
  cancelled: 'Cancelled',
} as const;

export default function TradeDetailScreen() {
  const { tradeId } = useLocalSearchParams<{ tradeId: string }>();
  const router = useRouter();

  const trade = tradeId ? getTradeDetail(tradeId) : undefined;

  if (!trade) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
        }}
      >
        <View style={{ gap: spacing.md, alignItems: 'center' }}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            Unable to locate that trade record.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/trades')}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.primary, fontFamily: typography.bodyBold }}>
              Return to trades
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontFamily: typography.body }}>
            Back to trades
          </Text>
        </TouchableOpacity>

        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text
              style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 14 }}
            >
              {trade.direction === 'buy' ? 'PopFlash Desk Buying' : 'PopFlash Desk Selling'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: typography.heading,
                  fontSize: 30,
                }}
              >
                {trade.counterparty}
              </Text>
              <View
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: radii.sm,
                  backgroundColor: STATUS_COLOR[trade.status],
                }}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontFamily: typography.bodyMedium,
                    fontSize: 11,
                  }}
                >
                  {STATUS_LABEL[trade.status]}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: spacing.lg,
              gap: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 13 }}
              >
                Trade Value
              </Text>
              <Text
                style={{ color: colors.textPrimary, fontFamily: typography.bodyBold, fontSize: 22 }}
              >
                ${trade.value.toLocaleString()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 13 }}
              >
                Settlement ETA
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: typography.bodyMedium,
                  fontSize: 16,
                }}
              >
                {trade.settlementEta}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 13 }}
              >
                Updated
              </Text>
              <Text
                style={{ color: colors.textPrimary, fontFamily: typography.body, fontSize: 16 }}
              >
                {new Date(trade.updatedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <Section title="Counterparties" subtitle="Escrow contract participants and risk posture">
          <View style={{ gap: spacing.sm }}>
            {trade.counterparties.map((counterparty) => (
              <View
                key={`${trade.id}-${counterparty.name}`}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
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
                      fontSize: 16,
                    }}
                  >
                    {counterparty.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 12,
                    }}
                  >
                    Role · {counterparty.role.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: radii.sm,
                    backgroundColor: colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.bodyMedium,
                      fontSize: 12,
                    }}
                  >
                    Risk · {counterparty.riskRating.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Assets in trade" subtitle="Inventory blocks cycling through escrow">
          <View style={{ gap: spacing.sm }}>
            {trade.assets.map((asset) => (
              <View
                key={asset.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodyBold,
                    fontSize: 16,
                  }}
                >
                  {asset.name}
                </Text>
                <Text
                  style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 12 }}
                >
                  {asset.category} · Float {asset.wear}
                </Text>
                <Text
                  style={{ color: colors.primary, fontFamily: typography.bodyMedium, fontSize: 14 }}
                >
                  ${asset.priceUsd.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Milestones" subtitle="Escrow progression markers">
          <View style={{ gap: spacing.sm }}>
            {trade.milestones.map((milestone) => (
              <View
                key={milestone.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
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
                    {milestone.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 12,
                    }}
                  >
                    {milestone.timestamp
                      ? new Date(milestone.timestamp).toLocaleString()
                      : 'Pending'}
                  </Text>
                </View>
                <Ionicons
                  name={milestone.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={milestone.completed ? colors.primary : colors.textSecondary}
                />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Audit trail" subtitle="System log across the escrow contract">
          <View style={{ gap: spacing.sm }}>
            {trade.auditTrail.map((entry) => (
              <View
                key={`${entry.timestamp}-${entry.actor}`}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodyBold,
                    fontSize: 14,
                  }}
                >
                  {entry.actor}
                </Text>
                <Text
                  style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 12 }}
                >
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                <Text
                  style={{ color: colors.textPrimary, fontFamily: typography.body, fontSize: 13 }}
                >
                  {entry.note}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Desk notes">
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              padding: spacing.lg,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: typography.body,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {trade.notes}
            </Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
