const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Error handler helper
const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `API request failed with status ${res.status}`);
  }
  return json;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

export const signupUser = async (userPayload) => {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload)
  });
  return handleResponse(res);
};

export const fetchMarketIndices = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/indices`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Fallback indices active.');
    return [
      { symbol: "NIFTY 50", exchange: "NSE", price: 25120.50, change: 185.45, changePercent: 0.74, status: "positive" },
      { symbol: "SENSEX", exchange: "BSE", price: 82145.80, change: 540.20, changePercent: 0.66, status: "positive" },
      { symbol: "BANK NIFTY", exchange: "NSE", price: 51840.15, change: 395.80, changePercent: 0.77, status: "positive" }
    ];
  }
};

export const fetchStocksList = async () => {
  const res = await fetch(`${API_BASE_URL}/stocks`);
  const json = await handleResponse(res);
  return json.data;
};

export const fetchStockDetails = async (symbol) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${symbol}`);
  const json = await handleResponse(res);
  return json.data;
};

export const fetchStockChart = async (symbol, timeframe) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/chart?timeframe=${timeframe}`);
  const json = await handleResponse(res);
  return json.data;
};

export const fetchPortfolio = async () => {
  const res = await fetch(`${API_BASE_URL}/portfolio`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.portfolio;
};

export const placeOrder = async (symbol, type, orderCategory, qty, price) => {
  const res = await fetch(`${API_BASE_URL}/orders/place`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ symbol, type, orderCategory, qty, price })
  });
  return handleResponse(res);
};

export const estimateCharges = async (type, qty, price) => {
  const res = await fetch(`${API_BASE_URL}/orders/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, qty, price })
  });
  const json = await handleResponse(res);
  return json.charges;
};

export const fetchWatchlist = async () => {
  const res = await fetch(`${API_BASE_URL}/watchlist`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.data;
};

export const addToWatchlist = async (symbol) => {
  const res = await fetch(`${API_BASE_URL}/watchlist`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ symbol })
  });
  return handleResponse(res);
};

export const removeFromWatchlist = async (symbol) => {
  const res = await fetch(`${API_BASE_URL}/watchlist/${symbol}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const addFunds = async (amount, method) => {
  const res = await fetch(`${API_BASE_URL}/funds/deposit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ amount, method })
  });
  return handleResponse(res);
};

export const withdrawFunds = async (amount) => {
  const res = await fetch(`${API_BASE_URL}/funds/withdraw`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ amount })
  });
  return handleResponse(res);
};

export const fetchIpos = async () => {
  const res = await fetch(`${API_BASE_URL}/ipos`);
  const json = await handleResponse(res);
  return json.data;
};

export const checkIpoAllotment = async (pan, ipoId) => {
  const res = await fetch(`${API_BASE_URL}/ipos/allotment-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pan, ipoId })
  });
  return handleResponse(res);
};

export const fetchMutualFunds = async () => {
  const res = await fetch(`${API_BASE_URL}/mutual-funds`);
  const json = await handleResponse(res);
  return json.data;
};

export const fetchNews = async () => {
  const res = await fetch(`${API_BASE_URL}/news`);
  return handleResponse(res);
};

export const fetchAiInsights = async () => {
  const res = await fetch(`${API_BASE_URL}/ai/insights`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const fetchTransactions = async () => {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.data;
};
