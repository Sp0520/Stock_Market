import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Bookmark, 
  CandlestickChart, 
  Globe, 
  ShoppingBag, 
  PieChart, 
  Wallet, 
  Rocket, 
  TrendingUp, 
  Newspaper, 
  BarChart3, 
  Bot, 
  ShieldAlert, 
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'chart', label: 'Trading Chart', icon: CandlestickChart },
    { id: 'markets', label: 'Indian Markets', icon: Globe },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'holdings', label: 'Holdings', icon: PieChart },
    { id: 'funds', label: 'Funds & UPI', icon: Wallet },
    { id: 'ipo', label: 'IPO Section', icon: Rocket },
    { id: 'mutualfunds', label: 'Mutual Funds / SIP', icon: TrendingUp },
    { id: 'news', label: 'News & Corporate Actions', icon: Newspaper },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'ai', label: 'AI Insights', icon: Bot, highlight: true },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert },
    { id: 'profile', label: 'Profile & KYC', icon: UserCheck },
  ];

  return (
    <aside 
      className={`glass-panel border-r border-white/10 min-h-[calc(100vh-65px)] transition-all duration-300 flex flex-col justify-between p-3 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-1">
        
        {/* Toggle Button */}
        <div className="flex items-center justify-end px-2 py-1 mb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-300 font-bold shadow-lg shadow-cyan-500/10'
                  : item.highlight
                  ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-purple-400' : ''}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left flex items-center justify-between">
                  {item.label}
                  {item.highlight && (
                    <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-bold uppercase">AI</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 glass-card bg-slate-950/40 border border-white/5 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>NSE / BSE Status</span>
            <span className="text-emerald-400 font-mono">LIVE</span>
          </div>
          <p className="text-[10px] text-slate-500">SEBI Registered Broker</p>
        </div>
      )}
    </aside>
  );
};
