import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Section } from '@/components/Section';
import { getInsightDetail } from '@/data/mock';
import { colors, radii, spacing, typography } from '@/theme';

const IMPACT_BADGE: Record<'portfolio' | 'operations' | 'risk', string> = {
  portfolio: colors.primary,
  operations: colors.accent,
  risk: colors.warning,
};

export default function InsightDetailScreen() {
  const { insightId } = useLocalSearchParams<{ insightId: string }>();
  const router = useRouter();

  const insight = insightId ? getInsightDetail(insightId) : undefined;

  if (!insight) {
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
          <Ionicons name="bulb-outline" size={48} color={colors.textSecondary} />
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            Insight signal not available.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/insights')}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.primary, fontFamily: typography.bodyBold }}>
              Return to insights
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const impactColor = IMPACT_BADGE[insight.impact];

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
            Back to insights
          </Text>
        </TouchableOpacity>

        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: radii.sm,
                  backgroundColor: impactColor,
                }}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontFamily: typography.bodyMedium,
                    fontSize: 11,
                  }}
                >
                  {insight.impact.toUpperCase()}
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
                    color: colors.textSecondary,
                    fontFamily: typography.bodyMedium,
                    fontSize: 11,
                  }}
                >
                  Confidence {(insight.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.heading,
                fontSize: 28,
                lineHeight: 34,
              }}
            >
              {insight.headline}
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 12 }}
            >
              Triggered {new Date(insight.triggeredAt).toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: spacing.lg,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.bodyMedium,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              {insight.detail}
            </Text>
          </View>
        </View>

        <Section title="Recommended actions" subtitle="Model-driven guidance to capture the signal">
          <View style={{ gap: spacing.sm }}>
            {insight.recommendedActions.map((action, index) => (
              <View
                key={`${insight.id}-action-${index}`}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
                  flexDirection: 'row',
                  gap: spacing.md,
                  alignItems: 'flex-start',
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.bodyMedium,
                      fontSize: 13,
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.body,
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {action}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Supporting metrics" subtitle="Quantitative backing for the signal">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {insight.supportingMetrics.map((metric) => (
              <View
                key={metric.label}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
                  flexBasis: '45%',
                  flexGrow: 1,
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 12 }}
                >
                  {metric.label}
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodyBold,
                    fontSize: 18,
                  }}
                >
                  {metric.value}
                </Text>
                {metric.delta ? (
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.bodyMedium,
                      fontSize: 12,
                    }}
                  >
                    {metric.delta}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </Section>

        <Section title="Desk narrative">
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
              {insight.narrative}
            </Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
