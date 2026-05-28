import React, { useState, useEffect } from 'react';
import { User } from './types';
import Auth from './components/Auth';
import MainApp from './components/MainApp';
import Admin from './components/Admin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Simple session restore from sessionStorage for prototype
    const storedUser = sessionStorage.getItem('safe_ed_session_user');
    const storedAdmin = sessionStorage.getItem('safe_ed_session_admin');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else if (storedAdmin === 'true') {
      setIsAdmin(true);
    }
    setInitialized(true);
  }, []);

  const handleLogin = (user: User | null, adminMode: boolean) => {
    if (adminMode) {
      setIsAdmin(true);
      setCurrentUser(null);
      sessionStorage.setItem('safe_ed_session_admin', 'true');
      sessionStorage.removeItem('safe_ed_session_user');
    } else if (user) {
      setCurrentUser(user);
      setIsAdmin(false);
      sessionStorage.setItem('safe_ed_session_user', JSON.stringify(user));
      sessionStorage.removeItem('safe_ed_session_admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('safe_ed_session_user');
    sessionStorage.removeItem('safe_ed_session_admin');
  };

  if (!initialized) return null;

  if (isAdmin) {
    return <Admin onLogout={handleLogout} />;
  }

  if (currentUser) {
    return <MainApp onLogout={handleLogout} />;
  }

  return <Auth onLogin={handleLogin} />;
}
