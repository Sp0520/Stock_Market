import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PortfolioSummary } from './components/dashboard/PortfolioSummary';
import { MarketIndices } from './components/dashboard/MarketIndices';
import { Donut3DChart } from './components/dashboard/Donut3DChart';
import { MarketHeatmap3D } from './components/dashboard/MarketHeatmap3D';
import { Card3D } from './components/common/Card3D';
import { TradingViewChart } from './components/trading/TradingViewChart';
import { BuySellPanel } from './components/trading/BuySellPanel';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Active Selected Stock Data
  const [selectedStock, setSelectedStock] = useState<any>({
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    price: 3012.45,
    change: 45.80,
    changePercent: 1.54,
    sector: "Oil & Gas / Conglomerate",
    peRatio: 28.45,
    pbRatio: 2.65,
    marketCap: "₹20.38 Lakh Cr",
    fiftyTwoHigh: 3217.90,
    fiftyTwoLow: 2220.30,
    eps: "₹105.88",
    divYield: "0.33%",
    vwap: 2998.50,
    roe: "9.85%",
    roce: "10.42%",
    volume: "1.25 Cr"
  });

  // Benchmark Indices
  const [indices] = useState<any[]>([
    { symbol: "NIFTY 50", exchange: "NSE", price: 25120.50, change: 185.45, changePercent: 0.74, status: "positive" },
    { symbol: "SENSEX", exchange: "BSE", price: 82145.80, change: 540.20, changePercent: 0.66, status: "positive" },
    { symbol: "BANK NIFTY", exchange: "NSE", price: 51840.15, change: 395.80, changePercent: 0.77, status: "positive" },
    { symbol: "FINNIFTY", exchange: "NSE", price: 23410.60, change: 145.20, changePercent: 0.62, status: "positive" },
    { symbol: "NIFTY MIDCAP", exchange: "NSE", price: 58920.30, change: -110.40, changePercent: -0.19, status: "negative" },
    { symbol: "NIFTY SMALLCAP", exchange: "NSE", price: 19280.90, change: 142.10, changePercent: 0.74, status: "positive" }
  ]);

  // User Portfolio State
  const [portfolio, setPortfolio] = useState<any>({
    profile: {
      name: "Rahul Sharma",
      email: "rahul.sharma@investor.in",
      availableBalance: 125000.00,
      totalInvestment: 1050000.00,
      currentPortfolioValue: 1245680.50,
      todaysProfit: 18250.00,
      todaysProfitPercent: 1.56,
      totalProfit: 195680.50,
      totalProfitPercent: 18.64,
      buyingPower: 250000.00,
      marginUsed: 45000.00
    },
    holdings: [
      { symbol: "RELIANCE", name: "Reliance Industries Ltd", qty: 150, avgPrice: 2650.00, currentPrice: 3012.45, investmentValue: 397500.00, currentValue: 451867.50, pnl: 54367.50, pnlPercent: 13.68, dayChange: 45.80, exchange: "NSE" },
      { symbol: "TCS", name: "Tata Consultancy Services Ltd", qty: 80, avgPrice: 3820.00, currentPrice: 4285.30, investmentValue: 305600.00, currentValue: 342824.00, pnl: 37224.00, pnlPercent: 12.18, dayChange: -28.40, exchange: "NSE" },
      { symbol: "HDFCBANK", name: "HDFC Bank Limited", qty: 120, avgPrice: 1510.00, currentPrice: 1642.15, investmentValue: 181200.00, currentValue: 197058.00, pnl: 15858.00, pnlPercent: 8.75, dayChange: 14.85, exchange: "NSE" },
      { symbol: "ZOMATO", name: "Eternal Ltd (Zomato)", qty: 600, avgPrice: 160.00, currentPrice: 268.40, investmentValue: 96000.00, currentValue: 161040.00, pnl: 65040.00, pnlPercent: 67.75, dayChange: 8.90, exchange: "NSE" },
      { symbol: "HAL", name: "Hindustan Aeronautics Ltd", qty: 20, avgPrice: 3480.00, currentPrice: 4620.00, investmentValue: 69600.00, currentValue: 92400.00, pnl: 22800.00, pnlPercent: 32.76, dayChange: 112.50, exchange: "NSE" }
    ],
    orders: [
      { id: "ORD-98421", symbol: "RELIANCE", exchange: "NSE", type: "BUY", orderCategory: "LIMIT", qty: 10, price: 3010.00, status: "EXECUTED", time: "2026-08-06 10:15:22", charges: 28.50 },
      { id: "ORD-98422", symbol: "INFY", exchange: "NSE", type: "BUY", orderCategory: "LIMIT", qty: 25, price: 1870.00, status: "OPEN", time: "2026-08-06 11:30:10", charges: 24.20 }
    ]
  });

  // Real-time stock tick simulator interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedStock((prev: any) => {
        const delta = (Math.random() - 0.49) * (prev.price * 0.002);
        const newPrice = parseFloat(Math.max(1, prev.price + delta).toFixed(2));
        const newChange = parseFloat((newPrice - (prev.price - prev.change)).toFixed(2));
        const newPct = parseFloat(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        return {
          ...prev,
          price: newPrice,
          change: newChange,
          changePercent: newPct
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSelectStock = (symbol: string) => {
    const stockMap: any = {
      "RELIANCE": { symbol: "RELIANCE", name: "Reliance Industries Ltd", price: 3012.45, change: 45.80, changePercent: 1.54, sector: "Oil & Gas", peRatio: 28.45, marketCap: "₹20.38 Lakh Cr", fiftyTwoHigh: 3217.90, fiftyTwoLow: 2220.30 },
      "TCS": { symbol: "TCS", name: "Tata Consultancy Services Ltd", price: 4285.30, change: -28.40, changePercent: -0.66, sector: "IT Services", peRatio: 33.12, marketCap: "₹15.50 Lakh Cr", fiftyTwoHigh: 4585.90, fiftyTwoLow: 3313.00 },
      "INFY": { symbol: "INFY", name: "Infosys Limited", price: 1874.50, change: 32.10, changePercent: 1.74, sector: "IT Services", peRatio: 29.80, marketCap: "₹7.78 Lakh Cr", fiftyTwoHigh: 1993.40, fiftyTwoLow: 1355.00 },
      "HDFCBANK": { symbol: "HDFCBANK", name: "HDFC Bank Limited", price: 1642.15, change: 14.85, changePercent: 0.91, sector: "Banking", peRatio: 19.50, marketCap: "₹12.48 Lakh Cr", fiftyTwoHigh: 1794.00, fiftyTwoLow: 1363.45 },
      "ZOMATO": { symbol: "ZOMATO", name: "Eternal Ltd (Zomato)", price: 268.40, change: 8.90, changePercent: 3.43, sector: "Consumer Tech", peRatio: 115.40, marketCap: "₹2.36 Lakh Cr", fiftyTwoHigh: 298.20, fiftyTwoLow: 88.20 },
      "HAL": { symbol: "HAL", name: "Hindustan Aeronautics Ltd", price: 4620.00, change: 112.50, changePercent: 2.50, sector: "Defense", peRatio: 41.20, marketCap: "₹3.09 Lakh Cr", fiftyTwoHigh: 5675.00, fiftyTwoLow: 1767.80 },
      "TATAMOTORS": { symbol: "TATAMOTORS", name: "Tata Motors Ltd", price: 1048.50, change: 22.10, changePercent: 2.15, sector: "Automobile", peRatio: 11.50, marketCap: "₹3.88 Lakh Cr", fiftyTwoHigh: 1179.00, fiftyTwoLow: 593.50 }
    };

    const target = stockMap[symbol] || {
      symbol: symbol,
      name: `${symbol} India Ltd`,
      price: 1500.00,
      change: 15.20,
      changePercent: 1.02,
      sector: "Equity",
      peRatio: 24.50,
      marketCap: "₹1.50 Lakh Cr",
      fiftyTwoHigh: 1800.00,
      fiftyTwoLow: 1200.00
    };

    setSelectedStock(target);
    setActiveTab('chart');
  };

  const handleOrderExecuted = (orderData: any) => {
    setPortfolio((prev: any) => {
      const newOrder = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        symbol: orderData.symbol,
        exchange: orderData.exchange,
        type: orderData.type,
        orderCategory: orderData.orderCategory,
        qty: orderData.qty,
        price: orderData.price,
        status: "EXECUTED",
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        charges: orderData.charges
      };

      const updatedOrders = [newOrder, ...prev.orders];
      let newBalance = prev.profile.availableBalance;

      if (orderData.type === 'BUY') {
        newBalance -= orderData.estimatedTotalAmount;
      } else {
        newBalance += orderData.estimatedTotalAmount;
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          availableBalance: parseFloat(newBalance.toFixed(2))
        },
        orders: updatedOrders
      };
    });

    alert(`Order EXECUTED: ${orderData.type} ${orderData.qty} ${orderData.symbol} @ ₹${orderData.price}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      
      {/* Top Glass Sticky Navbar */}
      <Navbar
        indices={indices}
        onSelectStock={handleSelectStock}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableBalance={portfolio.profile.availableBalance}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Glass Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Command Center Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Portfolio Metrics Cards */}
              <PortfolioSummary
                portfolio={portfolio}
                onDepositClick={() => setActiveTab('funds')}
              />

              {/* 3D Asset Donut & Market Indices Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MarketIndices indices={indices} />
                </div>
                <Card3D className="p-5">
                  <Donut3DChart />
                </Card3D>
              </div>

              {/* Trading View Chart & Floating Order Ticket */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TradingViewChart
                    symbol={selectedStock.symbol}
                    stockName={selectedStock.name}
                    currentPrice={selectedStock.price}
                    priceChange={selectedStock.change}
                    priceChangePercent={selectedStock.changePercent}
                  />
                </div>
                <div>
                  <BuySellPanel
                    symbol={selectedStock.symbol}
                    exchange={selectedStock.exchange || "NSE"}
                    currentPrice={selectedStock.price}
                    availableBalance={portfolio.profile.availableBalance}
                    onOrderExecuted={handleOrderExecuted}
                  />
                </div>
              </div>

              {/* 3D Sector Market Heatmap */}
              <MarketHeatmap3D />

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

          {activeTab === 'chart' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TradingViewChart
                  symbol={selectedStock.symbol}
                  stockName={selectedStock.name}
                  currentPrice={selectedStock.price}
                  priceChange={selectedStock.change}
                  priceChangePercent={selectedStock.changePercent}
                />
              </div>
              <div>
                <BuySellPanel
                  symbol={selectedStock.symbol}
                  exchange={selectedStock.exchange || "NSE"}
                  currentPrice={selectedStock.price}
                  availableBalance={portfolio.profile.availableBalance}
                  onOrderExecuted={handleOrderExecuted}
                />
              </div>
            </div>
          )}

          {activeTab === 'markets' && (
            <div className="space-y-6">
              <MarketIndices indices={indices} />
              <MarketHeatmap3D />
              <WatchlistView onSelectStock={handleSelectStock} />
            </div>
          )}

          {activeTab === 'orders' && <OrdersView orders={portfolio.orders} />}

          {activeTab === 'funds' && (
            <FundsView
              availableBalance={portfolio.profile.availableBalance}
              buyingPower={portfolio.profile.buyingPower}
              marginUsed={portfolio.profile.marginUsed}
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

      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          alert(`Welcome back, ${user.name}! Connected to NSE/BSE.`);
        }}
      />

    </div>
  );
}

export default App;
