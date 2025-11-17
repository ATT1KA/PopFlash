import { Button } from '@popflash/ui';
import { Search, Sparkles } from 'lucide-react';

const quickActions = [
  { label: 'Create Escrow', variant: 'primary' as const },
  { label: 'AI Trade Brief', variant: 'ghost' as const },
];

export const TopBar = () => {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-panel/70 px-10 py-5 backdrop-blur-xl">
      <div className="relative w-[32rem]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
        <input
          className="w-full rounded-xl border border-white/5 bg-background/80 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none"
          placeholder="Search collections, players, escrow IDs, or compliance filings"
          type="search"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 rounded-xl border border-white/5 bg-background/60 px-4 py-2 text-xs uppercase tracking-wide text-textSecondary">
          <Sparkles className="h-4 w-4 text-primary" />
          Market AI sentiment: <strong className="text-primary">Bullish</strong>
        </span>
        {quickActions.map((action) => (
          <Button key={action.label} size="md" variant={action.variant}>
            {action.label}
          </Button>
        ))}
      </div>
    </header>
  );
};