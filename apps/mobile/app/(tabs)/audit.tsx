import type { AuditEventSeverity } from '@popflash/shared';

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuditEventCard } from '@components/AuditEventCard';
import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { LoadingState } from '@components/LoadingState';
import { ScreenContainer } from '@components/ScreenContainer';
import { SectionHeader } from '@components/SectionHeader';
import { useComplianceAuditEvents } from '@hooks/use-compliance-data';
import { palette } from '@lib/palette';

const SEVERITY_FILTERS: Array<AuditEventSeverity | 'all'> = [
  'all',
  'info',
  'notice',
  'warning',
  'critical',
];

export default function AuditScreen() {
  const [severity, setSeverity] = useState<AuditEventSeverity | 'all'>('all');

  const filters = useMemo(
    () => (severity === 'all' ? { limit: 25 } : { severity, limit: 25 }),
    [severity],
  );

  const { data, isLoading, isError, refetch, isRefetching } = useComplianceAuditEvents(filters);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading real-time audit trail…" />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={() => void refetch()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={isRefetching} onRefresh={() => void refetch()}>
      <SectionHeader title="Audit Trail" subtitle="Immutable compliance telemetry across systems" />

      <View style={styles.filters}>
        {SEVERITY_FILTERS.map((filter) => {
          const isActive = filter === severity;
          return (
            <Pressable
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSeverity(filter)}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {filter === 'all' ? 'All' : filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {data.events.length === 0 ? (
        <EmptyState message="No audit events for this filter window." />
      ) : (
        <View style={styles.list}>
          {data.events.map((event) => (
            <AuditEventCard key={event.id} event={event} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    backgroundColor: palette.slate900,
    borderColor: palette.cobaltBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: palette.cobalt,
    borderColor: palette.cobalt,
  },
  filterLabel: {
    color: palette.slate500,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filterLabelActive: {
    color: palette.cardLight,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  list: {
    gap: 16,
  },
});

