import type { ComplianceRequirementStatus } from '@popflash/shared';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { LoadingState } from '@components/LoadingState';
import { RequirementCard } from '@components/RequirementCard';
import { ScreenContainer } from '@components/ScreenContainer';
import { SectionHeader } from '@components/SectionHeader';
import { useComplianceRequirements } from '@hooks/use-compliance-data';
import { palette } from '@lib/palette';

const STATUS_FILTERS: Array<ComplianceRequirementStatus | 'all'> = [
  'all',
  'in_progress',
  'blocked',
  'complete',
];

export default function RequirementsScreen() {
  const [statusFilter, setStatusFilter] = useState<ComplianceRequirementStatus | 'all'>('all');

  const filters = useMemo(
    () => (statusFilter === 'all' ? {} : { status: statusFilter }),
    [statusFilter],
  );

  const { data, isLoading, isError, refetch, isRefetching } = useComplianceRequirements(filters);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading compliance requirements…" />
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
        title="Compliance Requirements"
        subtitle="Track every control across frameworks and processors"
      />

      <View style={styles.filters}>
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter === statusFilter;
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

      {data.requirements.length === 0 ? (
        <EmptyState message="No requirements match this filter. Adjust filters to see other controls." />
      ) : (
        <View style={styles.list}>
          {data.requirements.map((requirement) => (
            <RequirementCard key={requirement.id} requirement={requirement} />
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
