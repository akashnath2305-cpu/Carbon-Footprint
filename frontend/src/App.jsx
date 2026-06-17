import React, { useState, useEffect, Suspense, lazy } from 'react';
import WelcomeView from './components/WelcomeView';
const LoginView = lazy(() => import('./components/LoginView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
import { AuthProvider, useAuth } from './context/AuthContext';

const CalculatorWizard = lazy(() => import('./components/CalculatorWizard'));

function AppContent() {
  const { currentUser, token, logout, loading: authLoading } = useAuth();
  const [view, setView] = useState('welcome'); // 'welcome' | 'wizard' | 'dashboard' | 'login'
  const [isRegistering, setIsRegistering] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalEmissions: 0,
    breakdown: [],
    recentLogs: []
  });
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch dashboard summary stats from backend
  const fetchDashboardData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        setView('welcome');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Handler for wizard submission
  const handleWizardSubmit = async () => {
    try {
      if (!token) return;
      
      // Fetch fresh stats to display updated totals on dashboard
      await fetchDashboardData();
      setDashboardTab('history');
      setView('dashboard');
    } catch (err) {
      console.error('Failed to handle wizard completion:', err);
      // Fallback transition
      setDashboardTab('history');
      setView('dashboard');
    }
  };

  // Handler for logs logged in quick logger on dashboard
  const handleLogAdded = () => {
    fetchDashboardData();
  };

  if (authLoading || dataLoading) {
    return (
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--bg-primary)',
          zIndex: 9999,
          gap: '24px' 
        }}
      >
        <div 
          style={{ 
            color: 'var(--accent-emerald)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} 
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '16px' }}>
          Loading your eco-environment...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="canvas-background" />
      <div className="canvas-texture" />
      {view === 'welcome' && (
        <WelcomeView 
          currentUser={currentUser}
          dashboardData={dashboardData}
          onLoginClick={() => { setIsRegistering(false); setView('login'); }} 
          onCreateAccountClick={() => { setIsRegistering(true); setView('login'); }}
          onProceed={() => setView('wizard')}
          onLogout={() => {
            logout();
            setView('welcome');
          }}
          onNavigate={(tab) => {
            setDashboardTab(tab);
            setView('dashboard');
          }}
        />
      )}
      {view === 'login' && (
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Login...</div>}>
          <LoginView 
            initialIsSignUp={isRegistering}
            onLogin={(user) => {
              setView('welcome');
            }} 
          />
        </Suspense>
      )}
      {view === 'wizard' && (
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Setup...</div>}>
          <CalculatorWizard 
            onSubmit={handleWizardSubmit} 
            onCancel={() => setView('welcome')}
          />
        </Suspense>
      )}
      {view === 'dashboard' && currentUser && (
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Dashboard...</div>}>
          <DashboardView 
            initialTab={dashboardTab}
            dashboardData={dashboardData} 
            onLogAdded={handleLogAdded}
            onLogout={() => {
              logout();
              setView('welcome');
            }}
            onGoHome={() => setView('welcome')}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
