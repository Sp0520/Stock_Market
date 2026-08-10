import React, { useEffect, useState } from 'react';
import dashboardBg from '../../assets/dashboard_bg.jpg';
import marketBg from '../../assets/market_bg.jpg';
import portfolioBg from '../../assets/portfolio_bg.jpg';

export const BackgroundLayer = ({ activeTab = 'dashboard' }) => {
  const [bgImage, setBgImage] = useState(dashboardBg);

  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        setBgImage(dashboardBg);
        break;
      case 'markets':
      case 'watchlist':
        setBgImage(marketBg);
        break;
      case 'portfolio':
      case 'orders':
      case 'ai':
      case 'profile':
        setBgImage(portfolioBg);
        break;
      default:
        setBgImage(dashboardBg);
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden bg-[#05070d]">
      <img
        src={bgImage}
        alt="Background Pattern"
        loading="lazy"
        className="w-full h-full object-cover opacity-15 transition-all duration-750 ease-in-out"
      />
      {/* Glow overlays for premium contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,7,13,0.1)_0%,rgba(5,7,13,0.88)_85%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/40 via-transparent to-[#05070d]/95" />
    </div>
  );
};

export default BackgroundLayer;
