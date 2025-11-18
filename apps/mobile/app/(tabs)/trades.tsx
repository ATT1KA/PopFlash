import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Section } from '@/components/Section';
import { TradeCard } from '@/components/TradeCard';
import { tradePipeline } from '@/data/mock';
import { colors, spacing, typography } from '@/theme';

const settlementMetrics = [
  { label: 'Average Settlement', value: '6.8h', detail: 'Trailing 7 days' },
  { label: 'Escrow Utilization', value: '82%', detail: 'Live capacity' },
  { label: 'Counterparty SLA', value: '96%', detail: 'Within threshold' },
];

export default function TradesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
        <View style={{ gap: spacing.xs }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body,
              fontSize: 14,
            }}
          >
            Trade Settlement
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.heading,
              fontSize: 32,
            }}
          >
            Escrow Operations
          </Text>
        </View>

        <Section title="Velocity" subtitle="Throughput metrics across escrow automation">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {settlementMetrics.map((metric) => (
              <View
                key={metric.label}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: spacing.lg,
                  flexBasis: '30%',
                  flexGrow: 1,
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: typography.body,
                    fontSize: 12,
                  }}
                >
                  {metric.label}
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodyBold,
                    fontSize: 20,
                  }}
                >
                  {metric.value}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: typography.body,
                    fontSize: 11,
                  }}
                >
                  {metric.detail}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Active Pipeline" subtitle="Lifecycle status across counterparties">
          <View style={{ gap: spacing.md }}>
            {tradePipeline.map((trade) => (
              <TradeCard
                key={trade.id}
                counterparty={trade.counterparty}
                status={trade.status}
                value={trade.value}
                updatedAt={trade.updatedAt}
              />
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
