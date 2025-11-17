import { Button } from '@popflash/ui';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Market Overview', tag: 'Live' },
  { label: 'Portfolio', tag: '24h +6.3%' },
  { label: 'Trade Blotter', tag: '3 pending' },
  { label: 'Escrow Desk', tag: 'Milestone' },
  { label: 'Analytics Studio', tag: 'Beta' },
  { label: 'Compliance Hub', tag: 'Audit' },
];

export const Sidebar = () => {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-white/5 bg-panel/90 backdrop-blur-xl">
      <div className="px-6 pt-8">
        <div className="text-2xl font-heading font-semibold tracking-tight text-primary">
          PopFlash
        </div>
        <p className="mt-1 text-sm text-textSecondary">Counter-Strike Asset Terminal</p>
      </div>

      <nav className="mt-8 flex-1 space-y-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={clsx(
              'group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors',
              item.label === 'Market Overview'
                ? 'bg-white/5 text-textPrimary shadow-card'
                : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary',
            )}
          >
            <span className="font-medium">{item.label}</span>
            <span className="text-xs text-textSecondary group-hover:text-primary">{item.tag}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 px-6 pb-8">
        <div className="rounded-xl border border-white/5 bg-panel/70 p-4">
          <p className="text-xs uppercase tracking-wide text-textSecondary">Escrow Health</p>
          <p className="mt-1 text-2xl font-semibold text-primary">97.4%</p>
          <p className="text-xs text-textSecondary/80">On-time milestone settlements</p>
        </div>
        <Button className="w-full" size="lg">
          Initiate Trade
        </Button>
      </div>
    </aside>
  );
};
