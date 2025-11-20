import express, { json } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerRoutes } from '../../routes/index.js';

const {
  mockRequirement,
  mockSummary,
  mockAuditEvent,
  mockVerificationStart,
  mockVerificationUpdate,
} = vi.hoisted(() => ({
  mockRequirement: {
    _id: 'req-1',
    framework: 'soc2',
    key: 'CC1.1',
    title: 'Control Environment Established',
    description: 'Document control environment policies',
    status: 'in_progress',
    ownerUserId: 'user-1',
    dueDate: null,
    lastReviewedAt: null,
    evidence: [],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  mockSummary: {
    frameworks: [
      {
        framework: 'soc2',
        total: 1,
        byStatus: {
          not_started: 0,
          in_progress: 1,
          blocked: 0,
          complete: 0,
          deferred: 0,
        },
      },
    ],
    verificationCounts: { pending: 2, in_review: 1 },
    financialStatuses: [
      {
        _id: 'fin-1',
        platform: 'ios_app_store',
        status: 'attention',
        issues: ['Renew DUNS validation'],
        lastSyncedAt: null,
        nextReviewAt: null,
        ownerTeam: 'mobile',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ],
  },
  mockAuditEvent: {
    id: 'audit-1',
    eventType: 'compliance.test',
    description: 'Test audit event',
    severity: 'info',
    actorType: 'system',
    actorId: null,
    actorLabel: undefined,
    source: 'test-suite',
    metadata: {},
    occurredAt: new Date('2024-01-01T00:00:00.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  mockVerificationStart: {
    id: 'ver-1',
    relatedEntityType: 'escrow',
    relatedEntityId: 'escrow-1',
    scope: ['kyc'],
    status: 'pending',
    notes: null,
    reviewerUserId: null,
    evidenceIds: [],
    initiatedAt: new Date('2024-01-01T00:00:00.000Z'),
    completedAt: null,
    expiresAt: new Date('2024-01-02T00:00:00.000Z'),
    lastUpdatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  mockVerificationUpdate: {
    id: 'ver-1',
    relatedEntityType: 'escrow',
    relatedEntityId: 'escrow-1',
    scope: ['kyc'],
    status: 'in_review',
    notes: 'Review started',
    reviewerUserId: 'user-2',
    evidenceIds: [],
    initiatedAt: new Date('2024-01-01T00:00:00.000Z'),
    completedAt: null,
    expiresAt: new Date('2024-01-02T00:00:00.000Z'),
    lastUpdatedAt: new Date('2024-01-01T12:00:00.000Z'),
  },
}));

vi.mock('../../services/compliance-service.js', () => ({
  listComplianceRequirements: vi.fn().mockResolvedValue([mockRequirement]),
  updateRequirementStatus: vi.fn().mockResolvedValue(mockRequirement),
  addRequirementEvidence: vi.fn().mockResolvedValue(mockRequirement),
  getComplianceSummary: vi.fn().mockResolvedValue(mockSummary),
}));

vi.mock('../../services/audit-service.js', () => ({
  listAuditEvents: vi.fn().mockResolvedValue([mockAuditEvent]),
  recordAuditEvent: vi.fn().mockResolvedValue(mockAuditEvent),
}));

vi.mock('../../services/verification-service.js', () => ({
  listComplianceVerifications: vi.fn().mockResolvedValue([]),
  startVerification: vi.fn().mockResolvedValue(mockVerificationStart),
  updateVerification: vi.fn().mockResolvedValue(mockVerificationUpdate),
}));

vi.mock('../../services/financial-service.js', () => ({
  listComplianceFinancialStatuses: vi.fn().mockResolvedValue(mockSummary.financialStatuses),
  updateFinancialStatus: vi.fn().mockResolvedValue(mockSummary.financialStatuses[0]),
}));

const getServiceMocks = async () => ({
  compliance: vi.mocked(await import('../../services/compliance-service.js')),
  audit: vi.mocked(await import('../../services/audit-service.js')),
  verification: vi.mocked(await import('../../services/verification-service.js')),
  financial: vi.mocked(await import('../../services/financial-service.js')),
});

const createApp = () => {
  const app = express();
  app.use(json());
  registerRoutes(app);
  return app;
};

describe('Compliance service routes', () => {
  beforeEach(async () => {
    const services = await getServiceMocks();
    services.compliance.listComplianceRequirements.mockClear();
    services.compliance.updateRequirementStatus.mockClear();
    services.audit.recordAuditEvent.mockClear();
  });

  it('returns compliance summary', async () => {
    const app = createApp();
    const response = await request(app).get('/v1/compliance/summary');

    expect(response.status).toBe(200);
    expect(response.body.frameworks[0].framework).toBe('soc2');
  });

  it('lists compliance requirements with default filters', async () => {
    const app = createApp();
    const response = await request(app).get('/v1/compliance/requirements');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('req-1');

    const services = await getServiceMocks();
    expect(services.compliance.listComplianceRequirements).toHaveBeenCalledWith({
      framework: undefined,
      status: undefined,
      ownerUserId: undefined,
      includeEvidence: false,
    });
  });

  it('creates an audit event', async () => {
    const app = createApp();
    const payload = {
      eventType: 'compliance.manual_entry',
      description: 'Manual audit log entry',
      severity: 'notice',
      actorType: 'user',
      actorId: '11111111-1111-1111-1111-111111111111',
      actorLabel: 'Compliance Officer',
      metadata: { context: 'test' },
    };

    const response = await request(app).post('/v1/compliance/audit-events').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.eventType).toBe('compliance.test');
  });
});
