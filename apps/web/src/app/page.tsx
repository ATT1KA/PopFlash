import { ComplianceDashboard } from '@components/compliance-timeline';
import { InsightsFeed } from '@components/insights-feed';
import { MarketPulse } from '@components/market-pulse';
import { PortfolioPerformance } from '@components/portfolio-performance';
import { RiskIndicators } from '@components/risk-indicators';
import { Sidebar } from '@components/sidebar';
import { TopBar } from '@components/top-bar';
import { TradeActivity } from '@components/trade-activity';

export default function Home() {
  return (
    <div className="grid min-h-screen grid-cols-[18rem_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <MarketPulse />
              <TradeActivity />
              <InsightsFeed />
            </div>
            <aside className="space-y-6">
              <PortfolioPerformance />
              <RiskIndicators />
              <ComplianceDashboard />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
