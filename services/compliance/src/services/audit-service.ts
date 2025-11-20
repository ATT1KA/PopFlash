import { randomUUID } from 'crypto';

import type { AuditEvent, AuditEventActorType, AuditEventSeverity } from '@popflash/shared';

import {
  createAuditEvent as persistAuditEvent,
  listAuditEvents as fetchAuditEvents,
  type AuditEventFilters,
} from '../repositories/audit-event-repository.js';

export interface CreateAuditEventInput {
  eventType: string;
  description: string;
  severity: AuditEventSeverity;
  actorType: AuditEventActorType;
  actorId?: string | null;
  actorLabel?: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export const recordAuditEvent = async (input: CreateAuditEventInput): Promise<AuditEvent> => {
  const now = new Date();
  const event: AuditEvent = {
    id: randomUUID(),
    eventType: input.eventType,
    description: input.description,
    severity: input.severity,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    actorLabel: input.actorLabel,
    source: input.source,
    occurredAt: now,
    createdAt: now,
    metadata: input.metadata ?? {},
  };

  await persistAuditEvent(event);
  return event;
};

export const listAuditEvents = (filters: AuditEventFilters) => fetchAuditEvents(filters);
