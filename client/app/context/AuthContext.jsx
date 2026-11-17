import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket, joinTeamRoom } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved =
      sessionStorage.getItem('mailpilot_user') ||
      localStorage.getItem('mailpilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [team, setTeam] = useState(() => {
    const saved =
      sessionStorage.getItem('mailpilot_team') ||
      localStorage.getItem('mailpilot_team');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(
    () =>
      sessionStorage.getItem('mailpilot_token') ||
      localStorage.getItem('mailpilot_token')
  );
  const [loading, setLoading] = useState(true);

  // Connect socket and join team room whenever user & team are set
  useEffect(() => {
    if (user && team) {
      joinTeamRoom(team.id || team._id, user.id || user._id, user.role);
    }
  }, [user, team]);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken =
        sessionStorage.getItem('mailpilot_token') ||
        localStorage.getItem('mailpilot_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setTeam(res.data.team);
            sessionStorage.setItem('mailpilot_user', JSON.stringify(res.data.user));
            localStorage.setItem('mailpilot_user', JSON.stringify(res.data.user));
            if (res.data.team) {
              sessionStorage.setItem('mailpilot_team', JSON.stringify(res.data.team));
              localStorage.setItem('mailpilot_team', JSON.stringify(res.data.team));
            }
          }
        } catch (err) {
          console.error('[Session Error]', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setTeam(res.data.team);
      // Save to both tab sessionStorage (isolated) and localStorage (persistence)
      sessionStorage.setItem('mailpilot_token', res.data.token);
      sessionStorage.setItem('mailpilot_user', JSON.stringify(res.data.user));
      localStorage.setItem('mailpilot_token', res.data.token);
      localStorage.setItem('mailpilot_user', JSON.stringify(res.data.user));
      if (res.data.team) {
        sessionStorage.setItem('mailpilot_team', JSON.stringify(res.data.team));
        localStorage.setItem('mailpilot_team', JSON.stringify(res.data.team));
      }
      joinTeamRoom(res.data.team?.id || res.data.team?._id, res.data.user?.id || res.data.user?._id, res.data.user?.role);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setTeam(res.data.team);
      sessionStorage.setItem('mailpilot_token', res.data.token);
      sessionStorage.setItem('mailpilot_user', JSON.stringify(res.data.user));
      localStorage.setItem('mailpilot_token', res.data.token);
      localStorage.setItem('mailpilot_user', JSON.stringify(res.data.user));
      if (res.data.team) {
        sessionStorage.setItem('mailpilot_team', JSON.stringify(res.data.team));
        localStorage.setItem('mailpilot_team', JSON.stringify(res.data.team));
      }
      joinTeamRoom(res.data.team?.id || res.data.team?._id, res.data.user?.id || res.data.user?._id, res.data.user?.role);
      return res.data;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('mailpilot_token');
    sessionStorage.removeItem('mailpilot_user');
    sessionStorage.removeItem('mailpilot_team');
    localStorage.removeItem('mailpilot_token');
    localStorage.removeItem('mailpilot_user');
    localStorage.removeItem('mailpilot_team');
    setUser(null);
    setTeam(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        team,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        isAssistant: user?.role === 'assistant',
        isClient: user?.role === 'client',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

