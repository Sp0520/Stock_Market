import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trading_user');
    return saved ? JSON.parse(saved) : {
      name: "Rahul Sharma",
      email: "rahul.sharma@investor.in",
      role: "USER",
      pan: "ABCDE1234F",
      kycStatus: "VERIFIED"
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('trading_token') || 'demo_jwt_token_2026');

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('trading_user', JSON.stringify(userData));
    localStorage.setItem('trading_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trading_user');
    localStorage.removeItem('trading_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
