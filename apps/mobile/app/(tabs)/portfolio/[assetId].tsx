import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Section } from '@/components/Section';
import { getAssetDetail } from '@/data/mock';
import { colors, radii, spacing, typography } from '@/theme';

export default function AssetDetailScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>();
  const router = useRouter();

  const asset = assetId ? getAssetDetail(assetId) : undefined;

  if (!asset) {
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
          <Ionicons name="pricetag-outline" size={48} color={colors.textSecondary} />
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            Asset record not found.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/portfolio')}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.primary, fontFamily: typography.bodyBold }}>
              Return to portfolio
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const changeColor = asset.change >= 0 ? colors.primary : colors.danger;

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
            Back to portfolio
          </Text>
        </TouchableOpacity>

        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text
              style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 14 }}
            >
              {asset.collection} · {asset.category}
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.heading,
                fontSize: 30,
              }}
            >
              {asset.name}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
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
                style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 13 }}
              >
                Spot Price
              </Text>
              <Text
                style={{ color: colors.textPrimary, fontFamily: typography.bodyBold, fontSize: 22 }}
              >
                ${asset.priceUsd.toLocaleString()}
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
                24h Change
              </Text>
              <Text style={{ color: changeColor, fontFamily: typography.bodyBold, fontSize: 16 }}>
                {asset.change >= 0 ? '+' : '-'}
                {Math.abs(asset.change).toFixed(2)}%
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
                Float Range
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: typography.bodyMedium,
                  fontSize: 16,
                }}
              >
                {asset.floatRange}
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
                24h Volume
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: typography.bodyMedium,
                  fontSize: 16,
                }}
              >
                {asset.volume24h} lots
              </Text>
            </View>
          </View>
        </View>

        <Section title="Analyst take" subtitle="Desk positioning guidance">
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              padding: spacing.lg,
              gap: spacing.sm,
            }}
          >
            <Text
              style={{ color: colors.textPrimary, fontFamily: typography.bodyMedium, fontSize: 15 }}
            >
              {asset.analystTake}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: typography.body,
                fontSize: 13,
                lineHeight: 19,
              }}
            >
              {asset.description}
            </Text>
          </View>
        </Section>

        <Section title="Inventory mix" subtitle="Where the asset currently sits across PopFlash">
          <View style={{ gap: spacing.sm }}>
            {asset.holdings.map((holding) => (
              <View
                key={holding.location}
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
                    {holding.location}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: typography.body,
                      fontSize: 12,
                    }}
                  >
                    {holding.quantity} units
                  </Text>
                </View>
                <Text
                  style={{ color: colors.primary, fontFamily: typography.bodyMedium, fontSize: 15 }}
                >
                  {(holding.share * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Key metrics" subtitle="Quant signals backing current positioning">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {asset.metrics.map((metric) => (
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
              </View>
            ))}
          </View>
        </Section>

        <Section title="Comparable sales" subtitle="Recent executions across counterparties">
          <View style={{ gap: spacing.sm }}>
            {asset.comparableSales.map((sale) => (
              <View
                key={sale.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  padding: spacing.lg,
                  gap: spacing.xs,
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
                      fontSize: 15,
                    }}
                  >
                    {sale.counterparty}
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.bodyMedium,
                      fontSize: 15,
                    }}
                  >
                    ${sale.priceUsd.toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 12 }}
                >
                  {new Date(sale.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Risk flags">
          <View style={{ gap: spacing.sm }}>
            {asset.riskFlags.map((flag) => (
              <View
                key={flag}
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radii.md,
                  padding: spacing.lg,
                }}
              >
                <Text
                  style={{ color: colors.warning, fontFamily: typography.bodyMedium, fontSize: 13 }}
                >
                  {flag}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
