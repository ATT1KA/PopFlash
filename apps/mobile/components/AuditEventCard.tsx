import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AuditEvent } from '@popflash/shared';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { StatusBadge } from './StatusBadge';

import { formatDateTime, getSeverityToken } from '@lib/formatting';
import { palette } from '@lib/palette';

interface AuditEventCardProps {
  event: AuditEvent;
}

export const AuditEventCard = ({ event }: AuditEventCardProps) => {
  const isDark = useColorScheme() === 'dark';
  const token = getSeverityToken(event.severity);

  return (
    <View style={[styles.card, { backgroundColor: isDark ? palette.midnight : palette.cardLight }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="radar" size={20} color={token.color} />
          <Text style={[styles.title, { color: isDark ? palette.slate50 : palette.navy }]}>
            {event.eventType}
          </Text>
        </View>
        <StatusBadge label={token.label} color={token.color} background={token.background} />
      </View>
      <Text style={[styles.description, { color: isDark ? palette.slate600 : palette.slate800 }]}>
        {event.description}
      </Text>
      <View style={styles.metaRow}>
        <MetaLabel
          icon="account-badge"
          label={`${event.actorType.toUpperCase()} ${
            event.actorLabel ?? event.actorId ?? 'System'
          }`}
        />
        <MetaLabel icon="source-branch" label={`Source ${event.source}`} />
      </View>
      <Text style={styles.timestamp}>Occurred {formatDateTime(event.occurredAt)}</Text>
    </View>
  );
};

const MetaLabel = ({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) => (
  <View style={styles.metaLabel}>
    <MaterialCommunityIcons name={icon} size={16} color={palette.slate650} />
    <Text style={styles.metaText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderColor: palette.cobaltBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  metaLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metaText: {
    color: palette.slate650,
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    color: palette.slate650,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
