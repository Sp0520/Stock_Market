import { useState } from 'react';
import { FinanceHubNavbar } from './components/layout/FinanceHubNavbar.jsx';
import { TradingTerminalView } from './components/dashboard/TradingTerminalView.jsx';
import { TradeFlowView } from './components/dashboard/TradeFlowView.jsx';
import { OrdersView } from './components/orders/OrdersView.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('FINNEXA_TERMINAL');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [portfolio, setPortfolio] = useState({
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

  const handleOrderExecuted = (orderData) => {
    alert(`Order EXECUTED: ${orderData.type} ${orderData.qty} ${orderData.symbol} @ ₹${orderData.price}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      
      <FinanceHubNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
        availableBalance={portfolio.profile.availableBalance}
      />

      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('FINNEXA_TERMINAL')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'FINNEXA_TERMINAL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  ⚡ FinNexa Terminal (Image 1 UI)
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

            {viewMode === 'FINNEXA_TERMINAL' ? (
              <TradingTerminalView onOrderExecuted={handleOrderExecuted} />
            ) : (
              <TradeFlowView onOrderExecuted={handleOrderExecuted} />
            )}

          </div>
        )}

        {activeTab === 'markets' && (
          <TradingTerminalView onOrderExecuted={handleOrderExecuted} />
        )}

        {activeTab === 'orders' && <OrdersView orders={portfolio.orders} />}

      </main>

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
