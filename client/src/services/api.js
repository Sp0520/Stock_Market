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
  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(`Server returned invalid response (Status ${res.status}). The API server might be offline or restarting.`);
  }
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

export const fetchIpos = async (status = 'ALL', search = '') => {
  let url = `${API_BASE_URL}/ipos?status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  const json = await handleResponse(res);
  return json.data;
};

export const fetchIpoDetails = async (id) => {
  const res = await fetch(`${API_BASE_URL}/ipos/${id}`);
  const json = await handleResponse(res);
  return json.data;
};

export const applyIpo = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/ipos/apply`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const fetchMyIpoApplications = async () => {
  const res = await fetch(`${API_BASE_URL}/ipos/my-applications`, {
    headers: getHeaders()
  });
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

export const fetchMutualFunds = async (category = 'ALL', search = '', sortBy = '') => {
  let url = `${API_BASE_URL}/mutual-funds?category=${encodeURIComponent(category)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
  const res = await fetch(url);
  const json = await handleResponse(res);
  return json.data;
};

export const fetchMutualFundDetails = async (id) => {
  const res = await fetch(`${API_BASE_URL}/mutual-funds/${id}`);
  const json = await handleResponse(res);
  return json.data;
};

export const investMutualFund = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/mutual-funds/invest`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const fetchSipPlans = async () => {
  const res = await fetch(`${API_BASE_URL}/sip`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.data;
};

export const createSipPlan = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/sip/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateSipStatus = async (id, status) => {
  const res = await fetch(`${API_BASE_URL}/sip/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
};

export const modifySipPlan = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/sip/${id}/modify`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const fetchSipTransactions = async (id) => {
  const res = await fetch(`${API_BASE_URL}/sip/${id}/transactions`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.data;
};

export const fetchUnifiedPortfolio = async () => {
  const res = await fetch(`${API_BASE_URL}/portfolio/unified`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.portfolio;
};

export const fetchNews = async () => {
  const res = await fetch(`${API_BASE_URL}/news`);
  return handleResponse(res);
};

export const fetchLiveNews = async () => {
  const res = await fetch(`${API_BASE_URL}/news/live`);
  const json = await handleResponse(res);
  return json.data;
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

// Admin endpoints
export const fetchAdminStats = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.stats;
};

export const fetchAdminUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.data;
};

export const updateUserBalance = async (userId, amount) => {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/balance`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ amount })
  });
  return handleResponse(res);
};

export const createAdminIpo = async (ipoData) => {
  const res = await fetch(`${API_BASE_URL}/admin/ipos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(ipoData)
  });
  return handleResponse(res);
};

export const updateAdminIpo = async (ipoId, ipoData) => {
  const res = await fetch(`${API_BASE_URL}/admin/ipos/${ipoId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(ipoData)
  });
  return handleResponse(res);
};

export const fetchAdminOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: getHeaders()
  });
  const json = await handleResponse(res);
  return json.data;
};

export const fetchAnnouncements = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/announcements`);
  const json = await handleResponse(res);
  return json.data;
};

export const createAnnouncement = async (annData) => {
  const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(annData)
  });
  return handleResponse(res);
};
