import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetricHighlight } from '@/components/MetricHighlight';
import { Section } from '@/components/Section';
import { TimelineCard } from '@/components/TimelineCard';
import { TradeCard } from '@/components/TradeCard';
import { portfolioSummary, topAssets, tradePipeline, complianceTimeline } from '@/data/mock';
import { colors, spacing, typography } from '@/theme';

export default function PulseScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          gap: spacing.xl,
        }}
      >
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body,
              fontSize: 14,
            }}
          >
            PopFlash Command Center
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.heading,
              fontSize: 34,
            }}
          >
            Portfolio Pulse
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <View style={{ flexBasis: '48%', flexGrow: 1 }}>
            <MetricHighlight
              label="Total Value"
              value={`$${portfolioSummary.totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              deltaLabel={`▲ ${portfolioSummary.dailyChange}% today`}
              positive
            />
          </View>
          <View style={{ flexBasis: '48%', flexGrow: 1 }}>
            <MetricHighlight
              label="Weekly Velocity"
              value={`+${portfolioSummary.weeklyChange}%`}
              deltaLabel="Escrow throughput accelerating"
              positive
            />
          </View>
        </View>

        <Section
          title="Top Performing Assets"
          subtitle="Signals across your leading inventory buckets"
        >
          <View style={{ gap: spacing.md }}>
            {topAssets.map((asset) => (
              <View
                key={asset.id}
                style={{
                  backgroundColor: colors.surface,
                  padding: spacing.lg,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View>
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
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 13,
                      marginTop: spacing.xs,
                    }}
                  >
                    24h delta
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontFamily: typography.bodyBold,
                      fontSize: 18,
                    }}
                  >
                    ${asset.value.toLocaleString('en-US')}
                  </Text>
                  <Text
                    style={{
                      color: asset.change >= 0 ? colors.primary : colors.danger,
                      fontFamily: typography.bodyMedium,
                      marginTop: spacing.xs,
                    }}
                  >
                    {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Trade Pipeline" subtitle="Escrow + settlement overview">
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

        <Section title="Regulatory Timeline" subtitle="Upcoming deadlines and reviews">
          <View style={{ gap: spacing.md }}>
            {complianceTimeline.map((item) => (
              <TimelineCard
                key={item.id}
                title={item.title}
                window={item.window}
                severity={item.severity as 'low' | 'moderate' | 'high'}
              />
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
