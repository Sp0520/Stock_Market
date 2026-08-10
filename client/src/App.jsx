import { useState, useEffect } from 'react';
import { FinanceHubNavbar } from './components/layout/FinanceHubNavbar.jsx';
import { TradingTerminalView } from './components/dashboard/TradingTerminalView.jsx';
import { TradeFlowView } from './components/dashboard/TradeFlowView.jsx';
import { OrdersView } from './components/orders/OrdersView.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import { LoginView } from './components/auth/LoginView.jsx';
import { PortfolioView } from './components/dashboard/PortfolioView.jsx';
import { WatchlistView } from './components/dashboard/WatchlistView.jsx';
import { NewsView } from './components/dashboard/NewsView.jsx';
import { AiInsightsView } from './components/dashboard/AiInsightsView.jsx';
import { fetchPortfolio } from './services/api.js';
import { formatINR } from './utils/formatters.js';
import { BackgroundLayer } from './components/common/BackgroundLayer.jsx';
import { MarketView } from './components/dashboard/MarketView.jsx';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('FINNEXA_TERMINAL');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStockTicker, setSelectedStockTicker] = useState('RELIANCE');
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [portfolio, setPortfolio] = useState({
    profile: {
      name: "Guest Account",
      email: "guest@investor.in",
      availableBalance: 100000.00,
      totalInvestment: 0.00,
      currentPortfolioValue: 0.00,
      todaysProfit: 0.00,
      todaysProfitPercent: 0.00,
      totalProfit: 0.00,
      totalProfitPercent: 0.00
    },
    holdings: [],
    orders: []
  });

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    if (token && storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
    }
  }, []);

  const loadPortfolio = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const data = await fetchPortfolio();
      setPortfolio(data);
      if (data.profile) {
        // Update user state available balance
        setCurrentUser(prev => prev ? { ...prev, availableBalance: data.profile.availableBalance } : null);
      }
    } catch (err) {
      console.warn("Failed to fetch live portfolio details:", err.message);
    }
  };

  // Reload portfolio when user changes
  useEffect(() => {
    if (currentUser) {
      loadPortfolio();
    } else {
      // reset portfolio mock default
      setPortfolio({
        profile: {
          name: "Guest Account",
          email: "guest@investor.in",
          availableBalance: 100000.00,
          totalInvestment: 0.00,
          currentPortfolioValue: 0.00,
          todaysProfit: 0.00,
          todaysProfitPercent: 0.00,
          totalProfit: 0.00,
          totalProfitPercent: 0.00
        },
        holdings: [],
        orders: []
      });
    }
  }, [currentUser]);

  const handleSelectStock = (symbol) => {
    setSelectedStockTicker(symbol);
    setActiveTab('dashboard');
  };

  const handleOrderExecuted = (orderData) => {
    // Reload portfolio balances and assets from MySQL database
    loadPortfolio();
  };

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    loadPortfolio();
  };

  const handleLogOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('guestPortfolio');
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

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans relative">
      <BackgroundLayer activeTab={activeTab} />
      
      <FinanceHubNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
        availableBalance={currentUser ? currentUser.availableBalance : portfolio.profile.availableBalance}
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
                  ⚡ FinNexa Terminal (Groww & Upstox UI)
                </button>
                <button
                  onClick={() => setViewMode('TRADE_FLOW')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'TRADE_FLOW' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                  }`}
                >
                  📈 TRADEFLOW Dashboard
                </button>
              </div>

              {!currentUser ? (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="gradient-btn py-2 px-5 text-xs font-extrabold shadow-lg shadow-blue-500/10"
                >
                  🔒 Secure Trade Login
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-semibold font-mono">KYC: Verified</span>
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
              <TradingTerminalView onOrderExecuted={handleOrderExecuted} />
            ) : (
              <TradeFlowView onOrderExecuted={handleOrderExecuted} />
            )}

          </div>
        )}

        {activeTab === 'markets' && (
          <MarketView onSelectStock={handleSelectStock} />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView onSelectStock={handleSelectStock} />
        )}

        {activeTab === 'news' && (
          <NewsView />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView onSelectStock={handleSelectStock} />
        )}

        {activeTab === 'orders' && (
          <OrdersView />
        )}

        {activeTab === 'ai' && (
          <AiInsightsView />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto glass-card p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-black text-lg shadow-lg">
                {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : 'GS'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentUser ? currentUser.name : 'Guest Account'}</h2>
                <p className="text-xs text-slate-400 font-mono">KYC Status: VERIFIED</p>
              </div>
            </div>

            {currentUser ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Email Address</span>
                  <span className="text-white font-extrabold">{currentUser.email}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Mobile Number</span>
                  <span className="text-white font-extrabold">{currentUser.mobile}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block">PAN Card Number</span>
                  <span className="text-white font-extrabold uppercase">{currentUser.pan}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Virtual Wallet Balance</span>
                  <span className="text-emerald-400 font-extrabold">{formatINR(currentUser.availableBalance)}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1 col-span-1 md:col-span-2">
                  <span className="text-[10px] text-slate-400 block">Residential Address</span>
                  <span className="text-slate-200 font-sans block pt-0.5 leading-relaxed">{currentUser.address}</span>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4">
                  <button 
                    onClick={handleLogOut}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/10 rounded-xl uppercase tracking-wider transition-all"
                  >
                    Terminate Session & Log Out
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
