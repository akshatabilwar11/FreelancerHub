import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Safely decode JWT payload without external libraries
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser({
            id: profile.id,
            email: profile.email,
            roles: profile.roles || [],
            name: profile.name || profile.email.split('@')[0],
          });
        } catch (err) {
          console.error('Session expired or invalid');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  // POST /auth/login → receives { token }
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const token = data.token;
    localStorage.setItem('token', token);

    // Fetch full profile to get name and roles accurately from DB
    const profile = await authService.getProfile();

    // 🔒 Clear stale bids if a different user was previously logged in.
    // This prevents a new freelancer from seeing bids belonging to an old
    // account that happened to share the same numeric DB ID.
    const prevEmail = localStorage.getItem('user_email');
    if (prevEmail && prevEmail !== profile.email) {
      // Remove every bids_* key that doesn't belong to this user
      Object.keys(localStorage)
        .filter(k => k.startsWith('bids_'))
        .forEach(k => localStorage.removeItem(k));
    }
    localStorage.setItem('user_email', profile.email);

    setUser({
      id: profile.id,
      email: profile.email,
      roles: profile.roles || [],
      name: profile.name || profile.email.split('@')[0],
    });
  };

  // POST /auth/register → receives { msg }
  const register = async (userData) => {
    await authService.register(userData);
    // Don't auto-login after register — let user sign in
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
