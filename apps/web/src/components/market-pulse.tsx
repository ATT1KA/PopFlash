const movers = [
  {
    name: 'AK-47 | Nightwish (Factory New)',
    change: '+8.1%',
    volume: '124 trades',
    reference: '$415.32',
  },
  {
    name: '★ M9 Bayonet | Doppler (Phase 2)',
    change: '+5.6%',
    volume: '41 trades',
    reference: '$1,923.10',
  },
  {
    name: 'AWP | Lightning Strike (Minimal Wear)',
    change: '+4.3%',
    volume: '63 trades',
    reference: '$689.00',
  },
  {
    name: 'USP-S | Printstream (Field-Tested)',
    change: '+3.2%',
    volume: '211 trades',
    reference: '$142.48',
  },
  {
    name: 'Desert Eagle | Ocean Drive (Factory New)',
    change: '+2.9%',
    volume: '178 trades',
    reference: '$96.34',
  },
  {
    name: 'Sticker | FaZe Clan (Holo) | Copenhagen 2024',
    change: '+2.1%',
    volume: '302 trades',
    reference: '$27.18',
  },
];

export const MarketPulse = () => {
  return (
    <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold">Market Pulse</h2>
          <p className="text-sm text-textSecondary">
            Multi-market aggregation across Steam Community, Buff, and PopFlash OTC venues
          </p>
        </div>
        <span className="text-xs uppercase tracking-wide text-textSecondary">
          Updated <span className="text-primary">32s</span> ago
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {movers.map((mover) => (
          <article
            key={mover.name}
            className="rounded-2xl border border-white/5 bg-background/80 p-4 transition hover:border-primary/60 hover:shadow-card"
          >
            <p className="text-xs uppercase tracking-wide text-textSecondary">Top mover</p>
            <h3 className="mt-2 text-sm font-medium leading-snug text-textPrimary">{mover.name}</h3>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{mover.change}</span>
              <span className="text-textSecondary">{mover.volume}</span>
            </div>
            <p className="mt-3 text-xs text-textSecondary/80">VWAP reference {mover.reference}</p>
          </article>
        ))}
      </div>
    </section>
  );
};