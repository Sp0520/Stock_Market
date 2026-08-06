import { useState } from 'react';
import { FinanceHubNavbar } from './components/layout/FinanceHubNavbar';
import { TradingTerminalView } from './components/dashboard/TradingTerminalView';
import { TradeFlowView } from './components/dashboard/TradeFlowView';
import { HoldingsView } from './components/portfolio/HoldingsView';
import { PortfolioAnalytics } from './components/portfolio/PortfolioAnalytics';
import { WatchlistView } from './components/watchlist/WatchlistView';
import { OrdersView } from './components/orders/OrdersView';
import { FundsView } from './components/funds/FundsView';
import { IpoView } from './components/ipo/IpoView';
import { MutualFundsView } from './components/mutualfunds/MutualFundsView';
import { NewsView } from './components/news/NewsView';
import { AiInsightsView } from './components/ai/AiInsightsView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminView } from './components/admin/AdminView';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'FINANCE_HUB' | 'TRADE_FLOW'>('FINANCE_HUB');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [portfolio, setPortfolio] = useState<any>({
    profile: {
      name: "Rahul Sharma",
      email: "rahul.sharma@investor.in",
      availableBalance: 60123.30,
      totalInvestment: 756940.00,
      currentPortfolioValue: 756940.00,
      todaysProfit: 18250.00,
      todaysProfitPercent: 1.56,
      totalProfit: 195680.50,
      totalProfitPercent: 18.64
    },
    holdings: [
      { symbol: "TCS", name: "Tata Consultancy Services Ltd", qty: 120, avgPrice: 3550.00, currentPrice: 3745.20, investmentValue: 426000.00, currentValue: 449424.00, pnl: 23424.00, pnlPercent: 5.5, dayChange: 68.10, exchange: "NSE" },
      { symbol: "RELIANCE", name: "Reliance Industries Ltd", qty: 85, avgPrice: 2820.00, currentPrice: 2910.50, investmentValue: 239700.00, currentValue: 247392.50, pnl: 7692.50, pnlPercent: 3.2, dayChange: 20.75, exchange: "NSE" }
    ],
    orders: []
  });

  const handleSelectStock = () => {
    setActiveTab('dashboard');
  };

  const handleOrderExecuted = (orderData: any) => {
    alert(`Order EXECUTED: ${orderData.type} ${orderData.qty} ${orderData.symbol} @ ₹${orderData.price}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      
      {/* Top FINANCE.hub Navbar matching Image 1 & 3 */}
      <FinanceHubNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
        availableBalance={portfolio.profile.availableBalance}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* View Switcher Toggle */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('FINANCE_HUB')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'FINANCE_HUB' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  ⚡ FINANCE.hub Terminal (Image 1 UI)
                </button>
                <button
                  onClick={() => setViewMode('TRADE_FLOW')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'TRADE_FLOW' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  📈 TRADEFLOW Dashboard (Image 3 UI)
                </button>
              </div>

              <button 
                onClick={() => setShowAuthModal(true)}
                className="gradient-btn py-2 px-4 text-xs font-bold"
              >
                🔒 Open Secure Login Screen (Image 4 UI)
              </button>
            </div>

            {viewMode === 'FINANCE_HUB' ? (
              <TradingTerminalView onOrderExecuted={handleOrderExecuted} />
            ) : (
              <TradeFlowView onOrderExecuted={handleOrderExecuted} />
            )}

          </div>
        )}

        {(activeTab === 'portfolio' || activeTab === 'holdings') && (
          <HoldingsView
            holdings={portfolio.holdings}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'analytics' && <PortfolioAnalytics />}

        {activeTab === 'watchlist' && (
          <WatchlistView onSelectStock={handleSelectStock} />
        )}

        {activeTab === 'markets' && (
          <TradingTerminalView onOrderExecuted={handleOrderExecuted} />
        )}

        {activeTab === 'orders' && <OrdersView orders={portfolio.orders} />}

        {activeTab === 'funds' && (
          <FundsView
            availableBalance={portfolio.profile.availableBalance}
            buyingPower={120000.00}
            marginUsed={45000.00}
            onUpdateBalance={(newBal) => {
              setPortfolio((prev: any) => ({
                ...prev,
                profile: { ...prev.profile, availableBalance: newBal }
              }));
            }}
          />
        )}

        {activeTab === 'ipo' && <IpoView />}

        {activeTab === 'mutualfunds' && <MutualFundsView />}

        {activeTab === 'news' && <NewsView />}

        {activeTab === 'ai' && <AiInsightsView onSelectStock={handleSelectStock} />}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'admin' && <AdminView />}

      </main>

      {/* Image 4 Secure Glassmorphic Login Screen Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          alert(`Logged in securely as ${user.email}`);
        }}
      />

    </div>
  );
}

export default App;
