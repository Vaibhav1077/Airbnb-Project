import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, login as apiLogin, signup as apiSignup, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    setUser(res.data);
    return res.data;
  };

  const signup = async (data) => {
    const res = await apiSignup(data);
    setUser(res.data);
    return res.data;
  };

  const logoutUser = async () => {
    await apiLogout();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout: logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
