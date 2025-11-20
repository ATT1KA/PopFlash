import type { VerificationStatus } from '@popflash/shared';

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { LoadingState } from '@components/LoadingState';
import { ScreenContainer } from '@components/ScreenContainer';
import { SectionHeader } from '@components/SectionHeader';
import { VerificationCard } from '@components/VerificationCard';
import { useComplianceVerifications } from '@hooks/use-compliance-data';
import { palette } from '@lib/palette';

const STATUS_FILTERS: Array<VerificationStatus | 'all'> = [
  'all',
  'pending',
  'in_review',
  'passed',
  'failed',
];

export default function VerificationsScreen() {
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');

  const filters = useMemo(
    () => (statusFilter === 'all' ? { limit: 25 } : { status: statusFilter, limit: 25 }),
    [statusFilter],
  );

  const { data, isLoading, isError, refetch, isRefetching } = useComplianceVerifications(filters);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Fetching verification workflows…" />
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
      <SectionHeader
        title="Verification Workflows"
        subtitle="Persona, payment processor, and regulator checks"
      />

      <View style={styles.filters}>
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <Pressable
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {filter === 'all' ? 'All' : filter.replace(/_/g, ' ')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {data.verifications.length === 0 ? (
        <EmptyState message="No verifications match this filter." />
      ) : (
        <View style={styles.list}>
          {data.verifications.map((verification) => (
            <VerificationCard key={verification.id} verification={verification} />
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
