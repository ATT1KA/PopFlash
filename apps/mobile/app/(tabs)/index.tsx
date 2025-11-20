import type { ComplianceRequirementStatus } from '@popflash/shared';

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@components/ErrorState';
import { LoadingState } from '@components/LoadingState';
import { MetricCard } from '@components/MetricCard';
import { ScreenContainer } from '@components/ScreenContainer';
import { SectionHeader } from '@components/SectionHeader';
import { StatusBadge } from '@components/StatusBadge';
import { useComplianceSummary } from '@hooks/use-compliance-data';
import { formatDateTime, getRequirementStatusToken } from '@lib/formatting';
import { palette } from '@lib/palette';

export default function OverviewScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useComplianceSummary();

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Syncing compliance control room…" />
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

  const totalRequirements = data.frameworks.reduce((acc, item) => acc + item.total, 0);
  const completedRequirements = data.frameworks.reduce(
    (acc, item) => acc + (item.byStatus?.complete ?? 0),
    0,
  );
  const blockedRequirements = data.frameworks.reduce(
    (acc, item) => acc + (item.byStatus?.blocked ?? 0),
    0,
  );
  const inProgressVerifications = data.verificationCounts.in_review ?? 0;
  const passedVerifications = data.verificationCounts.passed ?? 0;
  const lastRefresh = formatDateTime(new Date());

  return (
    <ScreenContainer refreshing={isRefetching} onRefresh={() => void refetch()}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Compliance Command Center</Text>
          <Text style={styles.h2}>Real-time posture across frameworks and controls</Text>
        </View>
        <Text style={styles.timestamp}>Updated {lastRefresh}</Text>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          title="Requirements"
          value={`${completedRequirements}/${totalRequirements}`}
          description="Controls completed across all frameworks"
        />
        <MetricCard
          title="Open Blocks"
          value={blockedRequirements}
          description="Requirements currently blocked"
          accentColor={palette.sunlight}
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          title="Verifications"
          value={`${passedVerifications} passed`}
          description={`${inProgressVerifications} in review workflows`}
          accentColor={palette.success}
        />
        <MetricCard
          title="Financial Platforms"
          value={data.financialStatuses.length}
          description="Monitored providers with posture telemetry"
          accentColor={palette.sky}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Framework Snapshot"
          subtitle="Status distribution across SOC 2, App Stores, payment processors"
        />
        <View style={styles.frameworkGrid}>
          {data.frameworks.map((framework) => (
            <View key={framework.framework} style={styles.frameworkCard}>
              <Text style={styles.frameworkTitle}>
                {framework.framework.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.frameworkTotal}>{framework.total} controls</Text>
              <View style={styles.badgeRow}>
                {Object.entries(framework.byStatus ?? {})
                  .filter(([, count]) => count > 0)
                  .map(([statusKey, count]) => {
                    const typedStatus = statusKey as ComplianceRequirementStatus;
                    const token = getRequirementStatusToken(typedStatus);
                    return (
                      <StatusBadge
                        key={`${framework.framework}-${statusKey}`}
                        label={`${token.label} (${count})`}
                        color={token.color}
                        background={token.background}
                      />
                    );
                  })}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Financial Compliance Overview"
          subtitle="Live telemetry from Apple, Google, processors, regulatory bodies"
        />
        <View style={styles.financialRow}>
          {data.financialStatuses.map((status) => (
            <View key={status.id} style={styles.financialBadge}>
              <Text style={styles.financialTitle}>
                {status.platform.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.financialSubtitle}>{status.status.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  financialBadge: {
    backgroundColor: palette.midnight,
    borderColor: palette.cobaltBorder,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    minWidth: 120,
    padding: 16,
  },
  financialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  financialSubtitle: {
    color: palette.cobalt,
    fontSize: 16,
    fontWeight: '700',
  },
  financialTitle: {
    color: palette.slate400,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  frameworkCard: {
    backgroundColor: palette.midnight,
    borderColor: palette.cobaltBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  frameworkGrid: {
    gap: 14,
  },
  frameworkTitle: {
    color: palette.slate50,
    fontSize: 14,
    fontWeight: '700',
  },
  frameworkTotal: {
    color: palette.cobalt,
    fontSize: 28,
    fontWeight: '800',
  },
  h1: {
    color: palette.slate50,
    fontSize: 26,
    fontWeight: '800',
  },
  h2: {
    color: palette.slate400,
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    gap: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  section: {
    gap: 16,
  },
  timestamp: {
    color: palette.slate600,
    fontSize: 12,
    fontWeight: '600',
  },
});
