import React, { useState, useEffect } from 'react';
import { User } from './types';
import Auth from './components/Auth';
import MainApp from './components/MainApp';
import Admin from './components/Admin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

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

  useEffect(() => {
    // Anti-capture functionality
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerWarning();
        copyEmptyStringToClipboard();
      }
      
      // Mac shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (e.metaKey && e.shiftKey && ['3', '4', '5', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        triggerWarning();
      }

      // Windows/Linux shortcuts: Ctrl+P (Print), Ctrl+S (Save)
      if (e.ctrlKey && ['p', 'P', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        triggerWarning();
      }

      // Mac: Cmd+P (Print), Cmd+S (Save)
      if (e.metaKey && ['p', 'P', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        triggerWarning();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerWarning();
        copyEmptyStringToClipboard();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerWarning();
    };

    const triggerWarning = () => {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    const copyEmptyStringToClipboard = async () => {
      try {
        await navigator.clipboard.writeText('');
      } catch (err) {
        // Silent block
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCopy);
    };
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

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-8 text-center select-none">
          <svg className="w-16 h-16 mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-3xl font-bold mb-4">보안 경고</h2>
          <p className="text-xl">화면 캡쳐, 인쇄 및 복사는 보안 정책에 의해 금지되어 있습니다.</p>
          <p className="text-md text-gray-400 mt-2">지속적인 시도 시 계정이 차단될 수 있습니다.</p>
        </div>
      )}
      <div className={`w-full min-h-screen select-none ${showWarning ? 'blur-xl pointer-events-none' : ''}`}>
        {isAdmin ? (
          <Admin onLogout={handleLogout} />
        ) : currentUser ? (
          <MainApp onLogout={handleLogout} />
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </div>
    </>
  );
}
