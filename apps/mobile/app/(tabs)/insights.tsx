import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InsightCard } from '@/components/InsightCard';
import { Section } from '@/components/Section';
import { insightsFeed } from '@/data/mock';
import { colors, spacing, typography } from '@/theme';

const automationScripts = [
  {
    id: 'script-1',
    name: 'Escrow Stress Test',
    cadence: 'Daily 07:00 UTC',
  },
  {
    id: 'script-2',
    name: 'Counterparty Risk Sweep',
    cadence: 'Hourly',
  },
];

export default function InsightsScreen() {
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
            Intelligence Layer
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.heading,
              fontSize: 32,
            }}
          >
            AI Insights Feed
          </Text>
        </View>

        <Section title="Market Signals" subtitle="Real-time intelligence from PopFlash models">
          <View style={{ gap: spacing.md }}>
            {insightsFeed.map((insight) => (
              <InsightCard
                key={insight.id}
                headline={insight.headline}
                detail={insight.detail}
                sentiment={insight.sentiment as 'bullish' | 'neutral' | 'bearish'}
              />
            ))}
          </View>
        </Section>

        <Section
          title="Automation Scripts"
          subtitle="Operational routines running against the PopFlash graph"
        >
          <View style={{ gap: spacing.md }}>
            {automationScripts.map((script) => (
              <View
                key={script.id}
                style={{
                  backgroundColor: colors.surface,
                  padding: spacing.lg,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
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
                    {script.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 12,
                      marginTop: spacing.xs,
                    }}
                  >
                    {script.cadence}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: typography.bodyMedium,
                    fontSize: 12,
                  }}
                >
                  Automated
                </Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
