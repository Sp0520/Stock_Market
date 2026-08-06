import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('growth_app_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Stock {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  vwap: number;
  marketCap: string;
  peRatio: number;
  pbRatio: number;
  eps: string;
  divYield: string;
  fiftyTwoHigh: number;
  fiftyTwoLow: number;
  bookValue: string;
  roe: string;
  roce: string;
  faceValue: string;
  circuitUpper: number;
  circuitLower: number;
  deliveryPercent: string;
  orderBook?: {
    bids: { price: number; qty: number }[];
    asks: { price: number; qty: number }[];
  };
}

export interface MarketIndex {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  status: "positive" | "negative";
}

export interface Holding {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  investmentValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  exchange: string;
}

export interface UserPortfolio {
  profile: {
    name: string;
    email: string;
    pan: string;
    aadhaar: string;
    kycStatus: string;
    availableBalance: number;
    totalInvestment: number;
    currentPortfolioValue: number;
    todaysProfit: number;
    todaysProfitPercent: number;
    totalProfit: number;
    totalProfitPercent: number;
    buyingPower: number;
    marginUsed: number;
    riskScore: string;
  };
  holdings: Holding[];
  orders: any[];
  watchlists: any[];
}
