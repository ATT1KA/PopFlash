import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Section } from '@/components/Section';
import { portfolioSummary, topAssets } from '@/data/mock';
import { colors, spacing, typography } from '@/theme';

const allocation = [
  { label: 'Knives', weight: 0.32 },
  { label: 'Rifles', weight: 0.28 },
  { label: 'Gloves', weight: 0.18 },
  { label: 'Pistols', weight: 0.12 },
  { label: 'Collectibles', weight: 0.1 },
];

export default function PortfolioScreen() {
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
            Portfolio Intelligence
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.heading,
              fontSize: 32,
            }}
          >
            Holdings Breakdown
          </Text>
        </View>

        <Section title="Exposure" subtitle="Normalized by live Steam market marks">
          <View style={{ gap: spacing.md }}>
            {allocation.map((item) => (
              <View
                key={item.label}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: spacing.lg,
                  gap: spacing.sm,
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
                    style={{
                      color: colors.textPrimary,
                      fontFamily: typography.bodyBold,
                      fontSize: 16,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.bodyMedium,
                    }}
                  >
                    {(item.weight * 100).toFixed(0)}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: colors.surfaceAlt,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${item.weight * 100}%`,
                      backgroundColor: colors.primary,
                      borderRadius: 999,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Flagged Movers" subtitle="Outliers vs. historical 30-day drifts">
          <View style={{ gap: spacing.md }}>
            {topAssets.slice(0, 3).map((asset) => (
              <View
                key={asset.id}
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: 16,
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
                    {asset.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 12,
                    }}
                  >
                    Share of book · {((asset.value / portfolioSummary.totalValue) * 100).toFixed(1)}
                    %
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      color: asset.change >= 0 ? colors.primary : colors.danger,
                      fontFamily: typography.bodyBold,
                    }}
                  >
                    {asset.change >= 0 ? '+' : '-'}
                    {Math.abs(asset.change).toFixed(2)}%
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 12,
                    }}
                  >
                    24h delta
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
