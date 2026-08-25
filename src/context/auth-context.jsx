import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState(null); // 'session_expired' | 'manual' | null

  // Core logout — clears state + storage
  const clearSession = useCallback((reason = 'manual') => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    setLogoutReason(reason);
    localStorage.removeItem('shikshora_token');
    localStorage.removeItem('shikshora_user');
    localStorage.removeItem('shikshora_perms');
    localStorage.removeItem('shikshora_login_time');
    // Clear persisted active tab for all users
    Object.keys(localStorage)
      .filter(k => k.startsWith('shikshora_active_tab_'))
      .forEach(k => localStorage.removeItem(k));
  }, []);

  useEffect(() => {
    // On app start: restore session from localStorage and validate 24hr window
    const storedToken = localStorage.getItem('shikshora_token');
    const storedUser  = localStorage.getItem('shikshora_user');
    const storedPerms = localStorage.getItem('shikshora_perms');
    const loginTime   = localStorage.getItem('shikshora_login_time');

    if (storedToken && storedUser) {
      const elapsed = Date.now() - parseInt(loginTime || '0', 10);
      if (elapsed > SESSION_DURATION_MS) {
        // Session has expired — auto-logout
        clearSession('session_expired');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedPerms) setPermissions(JSON.parse(storedPerms));
      }
    }
    setLoading(false);
  }, [clearSession]);

  // Auto-expire timer: fires when the remaining session window elapses
  useEffect(() => {
    if (!token) return;

    const loginTime = parseInt(localStorage.getItem('shikshora_login_time') || '0', 10);
    const remaining = SESSION_DURATION_MS - (Date.now() - loginTime);

    if (remaining <= 0) {
      clearSession('session_expired');
      return;
    }

    const timer = setTimeout(() => {
      clearSession('session_expired');
    }, remaining);

    return () => clearTimeout(timer);
  }, [token, clearSession]);

  const login = async (email, password) => {
    setLoading(true);
    setLogoutReason(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      const loginTimestamp = Date.now().toString();

      setToken(data.token);
      setUser(data.user);
      setPermissions(data.permissions || []);

      localStorage.setItem('shikshora_token', data.token);
      localStorage.setItem('shikshora_user', JSON.stringify(data.user));
      localStorage.setItem('shikshora_perms', JSON.stringify(data.permissions || []));
      localStorage.setItem('shikshora_login_time', loginTimestamp);

      return data.user;
    } catch (error) {
      console.error('Auth Context Login Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => clearSession('manual');

  // Check if current user has module permission
  const hasPermission = (moduleName, action = 'view') => {
    if (!user) return false;

    // Super Admin and School Admin bypass local role permissions checks
    if (user.role === 'Super Admin' || user.role === 'School Admin') {
      return true;
    }

    const perm = permissions.find(p => p.moduleName === moduleName);
    if (!perm) return false;

    switch (action.toLowerCase()) {
      case 'view':   return perm.canView;
      case 'create': return perm.canCreate;
      case 'update': return perm.canUpdate;
      case 'delete': return perm.canDelete;
      case 'export': return perm.canExport;
      default:       return false;
    }
  };

  const value = {
    user,
    token,
    permissions,
    loading,
    logoutReason,
    isAuthenticated: !!token,
    login,
    logout,
    hasPermission,
    clearLogoutReason: () => setLogoutReason(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
