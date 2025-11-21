import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComplianceVerification } from '@popflash/shared';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { StatusBadge } from './StatusBadge';

import { formatDateTime, getVerificationStatusToken } from '@lib/formatting';
import { palette } from '@lib/palette';

interface VerificationCardProps {
  verification: ComplianceVerification;
}

export const VerificationCard = ({ verification }: VerificationCardProps) => {
  const isDark = useColorScheme() === 'dark';
  const token = getVerificationStatusToken(verification.status);

  return (
    <View style={[styles.card, { backgroundColor: isDark ? palette.midnight : palette.cardLight }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome6 name="shield" size={16} color={token.color} />
          <Text style={[styles.title, { color: isDark ? palette.slate50 : palette.navy }]}>
            Verification #{verification.id}
          </Text>
        </View>
        <StatusBadge label={token.label} color={token.color} background={token.background} />
      </View>
      <View style={styles.badgeRow}>
        <StatusBadge
          label={verification.relatedEntityType.toUpperCase()}
          color={palette.cobalt}
          background={palette.cobaltSoft}
          icon={<MaterialCommunityIcons name="database-lock" size={14} color={palette.cobalt} />}
        />
        <Text style={[styles.entityLabel, { color: isDark ? palette.slate600 : palette.slate800 }]}>
          Entity {verification.relatedEntityId}
        </Text>
      </View>
      <View style={styles.scopeContainer}>
        {verification.scope.map((scope) => (
          <View key={scope} style={styles.scopeBadge}>
            <Text style={styles.scopeText}>{scope.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <MaterialCommunityIcons name="calendar" size={16} color={palette.slate650} />
        <Text style={styles.footerLabel}>
          Started {formatDateTime(verification.initiatedAt)} · Updated{' '}
          {formatDateTime(verification.lastUpdatedAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    borderColor: palette.cobaltBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  entityLabel: {
    color: palette.slate800,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  footerLabel: {
    color: palette.slate650,
    fontSize: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scopeBadge: {
    backgroundColor: palette.slateTranslucent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scopeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scopeText: {
    color: palette.slate650,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
