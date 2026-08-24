import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on startup
    const storedToken = localStorage.getItem('shikshora_token');
    const storedUser = localStorage.getItem('shikshora_user');
    const storedPerms = localStorage.getItem('shikshora_perms');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedPerms) {
        setPermissions(JSON.parse(storedPerms));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
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

      // Save to states
      setToken(data.token);
      setUser(data.user);
      setPermissions(data.permissions || []);

      // Save to localStorage
      localStorage.setItem('shikshora_token', data.token);
      localStorage.setItem('shikshora_user', JSON.stringify(data.user));
      localStorage.setItem('shikshora_perms', JSON.stringify(data.permissions || []));

      return data.user;
    } catch (error) {
      console.error('Auth Context Login Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('shikshora_token');
    localStorage.removeItem('shikshora_user');
    localStorage.removeItem('shikshora_perms');
  };

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
      case 'view': return perm.canView;
      case 'create': return perm.canCreate;
      case 'update': return perm.canUpdate;
      case 'delete': return perm.canDelete;
      case 'export': return perm.canExport;
      default: return false;
    }
  };

  const value = {
    user,
    token,
    permissions,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    hasPermission
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
