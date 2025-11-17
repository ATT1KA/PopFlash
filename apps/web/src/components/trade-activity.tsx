import { CheckCircle, Clock4, Shield } from 'lucide-react';

const tradeQueue = [
  {
    id: 'TRD-48211',
    counterparty: 'snappi',
    asset: 'AK-47 | Gold Arabesque (Factory New)',
    status: 'Settlement',
    milestone: 'Escrow release',
    icon: CheckCircle,
  },
  {
    id: 'TRD-48207',
    counterparty: 'gla1ve',
    asset: '★ Talon Knife | Crimson Web (Minimal Wear)',
    status: 'Awaiting KYC',
    milestone: 'ID verification',
    icon: Shield,
  },
  {
    id: 'TRD-48188',
    counterparty: 'mONESY',
    asset: 'AWP | Medusa (Minimal Wear)',
    status: 'Payment Pending',
    milestone: 'ACH settlement',
    icon: Clock4,
  },
];

export const TradeActivity = () => {
  return (
    <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold">Trade Blotter</h2>
          <p className="text-sm text-textSecondary">Real-time lifecycle status for strategic positions</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-textSecondary">
          12 workflows in-flight
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {tradeQueue.map((trade) => {
          const Icon = trade.icon;
          return (
            <article
              key={trade.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/70 p-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-textPrimary">{trade.asset}</p>
                </div>
                <p className="mt-1 text-xs text-textSecondary">
                  {trade.id} • Counterparty {trade.counterparty.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary">{trade.status}</p>
                <p className="text-xs text-textSecondary">Milestone: {trade.milestone}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};