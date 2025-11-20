import { AuditEventModel } from '@popflash/database';
import type { AuditEvent, AuditEventSeverity } from '@popflash/shared';
import type { FilterQuery } from 'mongoose';

export interface AuditEventFilters {
  after?: Date;
  limit?: number;
  severity?: AuditEventSeverity;
  eventType?: string;
  actorId?: string;
}

export const listAuditEvents = (filters: AuditEventFilters = {}) => {
  const query: FilterQuery<AuditEvent> = {};

  if (filters.after) {
    query.occurredAt = { $gt: filters.after };
  }

  if (filters.severity) {
    query.severity = filters.severity;
  }

  if (filters.eventType) {
    query.eventType = filters.eventType;
  }

  if (filters.actorId) {
    query.actorId = filters.actorId;
  }

  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);

  return AuditEventModel.find(query).sort({ occurredAt: -1 }).limit(limit).lean().exec();
};

export const createAuditEvent = async (event: AuditEvent) =>
  AuditEventModel.create({
    _id: event.id,
    eventType: event.eventType,
    description: event.description,
    severity: event.severity,
    actorType: event.actorType,
    actorId: event.actorId ?? null,
    actorLabel: event.actorLabel,
    source: event.source,
    occurredAt: event.occurredAt,
    metadata: event.metadata ?? {},
    createdAt: event.createdAt,
  });
