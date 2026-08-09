// AI Financial Analytics & Portfolio Diagnosis Engine
function generateAiInsights(portfolioData, stocksDatabase) {
  const recommendations = [
    {
      symbol: "HAL",
      name: "Hindustan Aeronautics Ltd",
      action: "STRONG BUY",
      targetPrice: "₹5,250.00",
      timeframe: "6 - 12 Months",
      confidence: "94%",
      rationale: "Strong defense order book pipeline of ₹94,000 Cr, increasing indigenization, and export deals signed with Southeast Asian defense partners."
    },
    {
      symbol: "ZOMATO",
      name: "Eternal Ltd (Zomato)",
      action: "BUY",
      targetPrice: "₹320.00",
      timeframe: "3 - 6 Months",
      confidence: "88%",
      rationale: "Blinkit quick commerce EBITDA expansion outperforming expectations; high monthly active transacting user retention across metro cities."
    },
    {
      symbol: "INFY",
      name: "Infosys Limited",
      action: "ACCUMULATE",
      targetPrice: "₹2,100.00",
      timeframe: "6 Months",
      confidence: "85%",
      rationale: "GenAI contract wins expanding, attractive dividend yield of 2.05%, and recovering US BFSI tech expenditure."
    }
  ];

  const portfolioHealth = {
    score: 84,
    status: "EXCELLENT HEALTH",
    diversificationScore: "8.5 / 10",
    riskRating: "MODERATE RISK",
    insights: [
      "Conglomerate & IT exposure provides strong cashflow stability.",
      "Consider adding 5-8% allocation in Renewable Energy (e.g. NTPC Green / Tata Power) for ESG momentum.",
      "Zomato position has expanded to 12.9% of portfolio due to 67.7% gains. Consider rebalancing or locking in partial profits."
    ],
    sectorBreakdown: [
      { sector: "Oil & Gas / Energy", percentage: 36.3, color: "#00f2fe" },
      { sector: "Information Technology", percentage: 27.5, color: "#4facfe" },
      { sector: "Financial Services", percentage: 15.8, color: "#00e676" },
      { sector: "Consumer Services (Q-Commerce)", percentage: 12.9, color: "#ffb300" },
      { sector: "Defense & Aerospace", percentage: 7.5, color: "#e040fb" }
    ]
  };

  const marketSentiment = {
    overallSentiment: "BULLISH",
    fearGreedIndex: 68, // Greed
    niftyOutlook: "NIFTY 50 holding strong above 25,000 support level. FII net buyers over last 5 sessions.",
    keyCatalysts: [
      "RBI Repo Rate status quo boosting Banking & Realty stocks",
      "Robust Q1 FY27 Corporate Earnings Growth",
      "FII capital inflows into Indian Equity markets"
    ]
  };

  return {
    recommendations,
    portfolioHealth,
    marketSentiment
  };
}

module.exports = {
  generateAiInsights
};
