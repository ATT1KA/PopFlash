import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComplianceRequirement } from '@popflash/shared';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { StatusBadge } from './StatusBadge';

import { formatDateTime, getRequirementStatusToken } from '@lib/formatting';
import { palette } from '@lib/palette';

interface RequirementCardProps {
  requirement: ComplianceRequirement;
}

export const RequirementCard = ({ requirement }: RequirementCardProps) => {
  const isDark = useColorScheme() === 'dark';
  const token = getRequirementStatusToken(requirement.status);
  const evidenceLabel = `${requirement.evidence.length} ${
    requirement.evidence.length === 1 ? 'artifact' : 'artifacts'
  }`;
  const ownerLabel = requirement.ownerUserId ? `Owner ${requirement.ownerUserId}` : 'Unassigned';
  const dueLabel = requirement.dueDate
    ? `Due ${formatDateTime(requirement.dueDate, { month: 'short', day: 'numeric' })}`
    : 'No due date';

  return (
    <View style={[styles.card, { backgroundColor: isDark ? palette.midnight : palette.cardLight }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? palette.slate50 : palette.navy }]}>
          {requirement.title}
        </Text>
        <StatusBadge
          label={token.label}
          color={token.color}
          background={token.background}
          icon={<MaterialCommunityIcons name="progress-check" size={14} color={token.color} />}
        />
      </View>
      <Text
        style={[styles.description, { color: isDark ? palette.slate600 : palette.slate800 }]}
        numberOfLines={3}
      >
        {requirement.description}
      </Text>
      <View style={styles.metaRow}>
        <MetaItem icon="account-tie" label={ownerLabel} />
        <MetaItem icon="calendar" label={dueLabel} />
        <MetaItem icon="file-document" label={evidenceLabel} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.timestamp}>Updated {formatDateTime(requirement.updatedAt)}</Text>
      </View>
    </View>
  );
};

const MetaItem = ({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) => (
  <View style={styles.metaItem}>
    <MaterialCommunityIcons name={icon} size={16} color={palette.slate650} />
    <Text style={styles.metaLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderColor: palette.cobaltBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaLabel: {
    color: palette.slate650,
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timestamp: {
    color: palette.slate700,
    fontSize: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
});
