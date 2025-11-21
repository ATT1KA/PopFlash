import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { FinancialComplianceStatus } from '@popflash/shared';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { StatusBadge } from './StatusBadge';

import { formatDateTime, getHealthToken } from '@lib/formatting';
import { palette } from '@lib/palette';

interface FinancialStatusCardProps {
  status: FinancialComplianceStatus & { id: string };
}

const platformIcons: Record<
  FinancialComplianceStatus['platform'],
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  android_play_store: 'android',
  ios_app_store: 'apple-ios',
  payment_processor: 'bank-transfer',
  regulatory: 'scale-balance',
};

export const FinancialStatusCard = ({ status }: FinancialStatusCardProps) => {
  const isDark = useColorScheme() === 'dark';
  const token = getHealthToken(status.status);

  return (
    <View style={[styles.card, { backgroundColor: isDark ? palette.midnight : palette.cardLight }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name={platformIcons[status.platform]}
            size={22}
            color={token.color}
          />
          <Text style={[styles.title, { color: isDark ? palette.slate50 : palette.navy }]}>
            {formatPlatform(status.platform)}
          </Text>
        </View>
        <StatusBadge label={token.label} color={token.color} background={token.background} />
      </View>
      <View style={styles.metaRow}>
        <Meta
          icon="account-group"
          label={status.ownerTeam ? `Owner ${status.ownerTeam}` : 'Owner TBD'}
        />
        <Meta icon="clock" label={`Last sync ${formatDateTime(status.lastSyncedAt)}`} />
        <Meta
          icon="update"
          label={`Next review ${formatDateTime(status.nextReviewAt, {
            month: 'short',
            day: 'numeric',
          })}`}
        />
      </View>
      {status.issues.length > 0 ? (
        <View style={styles.issues}>
          {status.issues.map((issue) => (
            <View key={issue} style={styles.issueChip}>
              <Text style={styles.issueText}>{issue}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.cleanLabel}>No outstanding issues</Text>
      )}
    </View>
  );
};

const formatPlatform = (platform: FinancialComplianceStatus['platform']) => {
  switch (platform) {
    case 'ios_app_store':
      return 'Apple App Store';
    case 'android_play_store':
      return 'Google Play';
    case 'payment_processor':
      return 'Payment Processors';
    case 'regulatory':
      return 'Regulatory Bodies';
    default:
      return platform;
  }
};

const Meta = ({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) => (
  <View style={styles.metaItem}>
    <MaterialCommunityIcons name={icon} size={16} color={palette.slate650} />
    <Text style={styles.metaText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderColor: palette.cobaltBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  cleanLabel: {
    color: palette.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  issueChip: {
    backgroundColor: palette.accentOrange,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  issueText: {
    color: palette.sunlight,
    fontSize: 12,
    fontWeight: '600',
  },
  issues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaText: {
    color: palette.slate650,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
