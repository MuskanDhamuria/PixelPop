import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Community from './components/Community';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Profile from './components/Profile';
import Friends from './components/Friends';
import { auth } from './utils/auth';
import { UserProvider } from './context/UserContext';

type Page = 'landing' | 'dashboard' | 'leaderboard' | 'community' | 'chatbot' | 'profile' | 'friends';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const session = await auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleNavigate = (page: string) => {
    // If user is not authenticated and trying to access protected pages, show auth
    if (!isAuthenticated && page !== 'landing') {
      setShowAuth(true);
      return;
    }
    setCurrentPage(page as Page);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await auth.signOut();
    setIsAuthenticated(false);
    setShowAuth(false);
    setCurrentPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth pages when user tries to access protected content
  if (showAuth && !isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === 'landing') {
    return <LandingPage onEnter={handleNavigate} onLogout={handleLogout} isAuthenticated={isAuthenticated} />;
  }

  if (currentPage === 'dashboard') {
    return <UserProvider><Dashboard onNavigate={handleNavigate} onLogout={handleLogout} /></UserProvider>;
  }

  if (currentPage === 'leaderboard') {
    return <UserProvider><Leaderboard onNavigate={handleNavigate} onLogout={handleLogout} /></UserProvider>;
  }

  if (currentPage === 'community') {
    return <UserProvider><Community onNavigate={handleNavigate} onLogout={handleLogout} /></UserProvider>;
  }

  if (currentPage === 'chatbot') {
    return <UserProvider><Chatbot onNavigate={handleNavigate} onLogout={handleLogout} /></UserProvider>;
  }

  if (currentPage === 'profile') {
    return <UserProvider><Profile onNavigate={handleNavigate} onLogout={handleLogout} /></UserProvider>;
  }

  if (currentPage === 'friends') {
    return <UserProvider><Friends onNavigate={handleNavigate} onLogout={handleLogout} /></UserProvider>;
  }

  return <LandingPage onEnter={handleNavigate} onLogout={handleLogout} isAuthenticated={isAuthenticated} />;
}
