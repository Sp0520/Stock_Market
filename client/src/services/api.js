const API_BASE_URL = 'http://localhost:5000/api';

export const fetchMarketIndices = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/indices`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend server not connected, using client fallback indices.');
    return [
      { symbol: "NIFTY 50", exchange: "NSE", price: 25120.50, change: 185.45, changePercent: 0.74, status: "positive" },
      { symbol: "SENSEX", exchange: "BSE", price: 82145.80, change: 540.20, changePercent: 0.66, status: "positive" },
      { symbol: "BANK NIFTY", exchange: "NSE", price: 51840.15, change: 395.80, changePercent: 0.77, status: "positive" }
    ];
  }
};

export const fetchStocksList = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/stocks`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    return [];
  }
};

export const fetchStockDetails = async (symbol) => {
  try {
    const res = await fetch(`${API_BASE_URL}/stocks/${symbol}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};
