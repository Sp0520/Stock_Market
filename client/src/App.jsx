import { useState, useEffect } from 'react';
import { FinanceHubNavbar } from './components/layout/FinanceHubNavbar.jsx';
import { HomeDashboardView } from './components/dashboard/HomeDashboardView.jsx';
import { TradingTerminalView } from './components/dashboard/TradingTerminalView.jsx';
import { TradeFlowView } from './components/dashboard/TradeFlowView.jsx';
import { MarketView } from './components/dashboard/MarketView.jsx';
import { IpoView } from './components/ipo/IpoView.jsx';
import { MutualFundsView } from './components/mutualfunds/MutualFundsView.jsx';
import { SipView } from './components/sip/SipView.jsx';
import { PortfolioView } from './components/dashboard/PortfolioView.jsx';
import { OrdersView } from './components/orders/OrdersView.jsx';
import { CalculatorsView } from './components/calculators/CalculatorsView.jsx';
import { WatchlistView } from './components/dashboard/WatchlistView.jsx';
import { NewsView } from './components/dashboard/NewsView.jsx';
import { AiInsightsView } from './components/dashboard/AiInsightsView.jsx';
import { AdminView } from './components/admin/AdminView.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import { LoginView } from './components/auth/LoginView.jsx';
import { BackgroundLayer } from './components/common/BackgroundLayer.jsx';
import { fetchUnifiedPortfolio } from './services/api.js';
import { formatINR } from './utils/formatters.js';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('FINNEXA_TERMINAL');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStockTicker, setSelectedStockTicker] = useState('RELIANCE');
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [portfolio, setPortfolio] = useState({
    profile: {
      name: "Rahul Sharma",
      email: "rahul.sharma@investor.in",
      availableBalance: 125000.00,
      totalInvested: 132000.00,
      currentAssetsValue: 154205.13,
      totalNetWorth: 279205.13,
      todaysProfit: 1250.40,
      todaysProfitPercent: 0.81,
      overallProfit: 22205.13,
      overallProfitPercent: 16.82,
      xirr: 18.42
    },
    stockMetrics: { invested: 87000, current: 95800, pnl: 8800, holdings: [] },
    mfMetrics: { invested: 45000, current: 52405, pnl: 7405, holdings: [] },
    sipMetrics: { invested: 42000, current: 44543, plans: [] },
    ipoMetrics: { invested: 14820, current: 17042, applications: [] },
    allocation: []
  });

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (e) {}
    }
  }, []);

  const loadPortfolio = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const data = await fetchUnifiedPortfolio();
      if (data) {
        setPortfolio(data);
        if (data.profile) {
          setCurrentUser(prev => prev ? { ...prev, availableBalance: data.profile.availableBalance } : null);
        }
      }
    } catch (err) {
      console.warn("Portfolio sync fallback:", err.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPortfolio();
    }
  }, [currentUser]);

  const handleSelectStock = (symbol) => {
    setSelectedStockTicker(symbol);
    setActiveTab('stocks');
  };

  const handleOrderExecuted = () => {
    loadPortfolio();
  };

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    loadPortfolio();
  };

  const handleLogOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsGuestMode(false);
    setActiveTab('dashboard');
    alert('Logged out successfully.');
  };

  if (!currentUser && !isGuestMode) {
    return (
      <LoginView
        onLoginSuccess={(userObj) => {
          setCurrentUser(userObj);
          setIsGuestMode(false);
        }}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
        }}
      />
    );
  }

  const currentAvailableBalance = currentUser ? currentUser.availableBalance : portfolio.profile.availableBalance;

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans relative">
      <BackgroundLayer activeTab={activeTab} />
      
      <FinanceHubNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
        availableBalance={currentAvailableBalance}
        currentUser={currentUser}
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        
        {/* TAB 1: GROWW/UPSTOX STYLE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <HomeDashboardView
            onSelectStock={handleSelectStock}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
          />
        )}

        {/* TAB 2: MARKETS OVERVIEW */}
        {activeTab === 'markets' && (
          <MarketView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 3: STOCKS TRADING TERMINAL */}
        {activeTab === 'stocks' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('FINNEXA_TERMINAL')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                    viewMode === 'FINNEXA_TERMINAL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  ⚡ FinNexa Terminal
                </button>
                <button
                  onClick={() => setViewMode('TRADE_FLOW')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                    viewMode === 'TRADE_FLOW' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  📈 TRADEFLOW
                </button>
              </div>

              {!currentUser ? (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="gradient-btn py-2 px-5 text-xs font-extrabold shadow-lg shadow-blue-500/10 w-full sm:w-auto text-center"
                >
                  🔒 Secure Trade Login
                </button>
              ) : (
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-xs text-emerald-400 font-semibold font-mono">KYC: Verified</span>
                  <button 
                    onClick={handleLogOut}
                    className="py-1.5 px-3.5 text-xs font-bold rounded-xl border border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {viewMode === 'FINNEXA_TERMINAL' ? (
              <TradingTerminalView 
                selectedSymbol={selectedStockTicker} 
                onOrderExecuted={handleOrderExecuted} 
              />
            ) : (
              <TradeFlowView onOrderExecuted={handleOrderExecuted} />
            )}
          </div>
        )}

        {/* TAB 4: INDIAN IPO HUB */}
        {activeTab === 'ipo' && (
          <IpoView />
        )}

        {/* TAB 5: MUTUAL FUNDS HUB */}
        {activeTab === 'mutual-funds' && (
          <MutualFundsView onStartSipWithFund={(fund) => setActiveTab('sip')} />
        )}

        {/* TAB 6: SIP WEALTH DASHBOARD */}
        {activeTab === 'sip' && (
          <SipView />
        )}

        {/* TAB 7: UNIFIED PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <PortfolioView 
            onSelectStock={handleSelectStock} 
            setActiveTab={setActiveTab} 
          />
        )}

        {/* TAB 8: ORDERS & TRANSACTIONS */}
        {activeTab === 'orders' && (
          <OrdersView />
        )}

        {/* TAB 9: FINANCIAL CALCULATORS */}
        {activeTab === 'calculators' && (
          <CalculatorsView />
        )}

        {/* TAB 10: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <WatchlistView onSelectStock={handleSelectStock} />
        )}

        {/* TAB 11: MARKET NEWS */}
        {activeTab === 'news' && (
          <NewsView />
        )}

        {/* TAB 12: AI INSIGHTS */}
        {activeTab === 'ai' && (
          <AiInsightsView />
        )}

        {/* TAB 13: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <AdminView />
        )}

        {/* TAB 14: USER PROFILE & KYC */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto glass-card p-8 space-y-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-black text-lg shadow-lg">
                {currentUser ? (currentUser.firstname?.[0] || 'U') : 'IN'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {currentUser ? `${currentUser.firstname || currentUser.name} ${currentUser.lastname || ''}` : 'Guest Account'}
                </h2>
                <p className="text-xs text-emerald-400 font-mono">SEBI KYC Status: VERIFIED</p>
              </div>
            </div>

            {currentUser ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-sans">Email Address</span>
                  <span className="text-white font-extrabold">{currentUser.email}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-sans">Mobile Number</span>
                  <span className="text-white font-extrabold">{currentUser.mobile_number || currentUser.mobile || '9876543210'}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-sans">PAN Card Number</span>
                  <span className="text-cyan-400 font-extrabold uppercase">{currentUser.PANCARD_number || currentUser.pan || 'ABCDE1234F'}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-sans">Available Wallet Balance</span>
                  <span className="text-emerald-400 font-extrabold">{formatINR(currentUser.availableBalance)}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1 col-span-1 md:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-sans">Permanent Residential Address</span>
                  <span className="text-slate-200 font-sans block pt-0.5 leading-relaxed">{currentUser.address || 'Mumbai, Maharashtra, India'}</span>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 flex gap-3">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl"
                  >
                    Open Admin Control Center
                  </button>
                  <button 
                    onClick={handleLogOut}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/10 rounded-xl uppercase tracking-wider transition-all"
                  >
                    Log Out Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-xs text-slate-400">You are currently trading under a Guest session.</p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all"
                >
                  Log In to Access Profile
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default App;
