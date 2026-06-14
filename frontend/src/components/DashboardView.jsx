import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { FileText, Plus, Car, Zap, Coffee, Trash2 } from 'lucide-react';
import TooltipIcon from './TooltipIcon';
import { useAuth } from '../context/AuthContext';

const DashboardCharts = lazy(() => import('./DashboardCharts'));
const EcoGames = lazy(() => import('./EcoGames'));
const CommunityTab = lazy(() => import('./CommunityTab'));
const GoalsTab = lazy(() => import('./GoalsTab'));
const GlobalMap = lazy(() => import('./GlobalMap'));
const HistoryTab = lazy(() => import('./HistoryTab'));
const RewardsTab = lazy(() => import('./RewardsTab'));

export default function DashboardView({ initialTab, dashboardData, onLogAdded, onLogout, onGoHome }) {
  const { token, currentUser, login } = useAuth();
  const { totalEmissions, recentLogs } = dashboardData;
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [trendFilter, setTrendFilter] = useState('Month');
  const [isTrendDropdownOpen, setIsTrendDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Quick Log form states
  const [category, setCategory] = useState('transportation');
  const [subCategory, setSubCategory] = useState('Petrol Car');
  const [inputValue, setInputValue] = useState('');
  const [unit, setUnit] = useState('km');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Infinite Scroll states for Tips
  const [tips, setTips] = useState([]);
  const [tipsOffset, setTipsOffset] = useState(0);
  const [hasMoreTips, setHasMoreTips] = useState(true);
  const [tipsLoading, setTipsLoading] = useState(false);
  
  const fetchAIInsights = async () => {
    if (!token) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchTips = async (reset = false) => {
    if (tipsLoading) return;
    setTipsLoading(true);
    const currentOffset = reset ? 0 : tipsOffset;
    try {
      const res = await fetch(`/api/tips?limit=10&offset=${currentOffset}`);
      if (res.ok) {
        const data = await res.json();
        if (reset) {
          setTips(data.tips);
          setTipsOffset(data.tips.length);
        } else {
          setTips((prev) => [...prev, ...data.tips]);
          setTipsOffset((prev) => prev + data.tips.length);
        }
        setHasMoreTips(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to load tips:', err);
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
    fetchTips(true);
  }, []);

  useEffect(() => {
    switch (category) {
      case 'transportation': setSubCategory('Petrol Car'); setUnit('km'); break;
      case 'energy': setSubCategory('Electricity'); setUnit('kWh'); break;
      case 'food': setSubCategory('Meat Meals'); setUnit('meals'); break;
      case 'waste': setSubCategory('Non-recycled Landfill'); setUnit('bags'); break;
      default: break;
    }
  }, [category]);

  const handleQuickLog = async (e) => {
    e.preventDefault();
    if (!inputValue || isNaN(parseFloat(inputValue)) || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, subCategory, inputValue: parseFloat(inputValue), unit })
      });
      if (res.ok) {
        const newLog = await res.json();
        setInputValue('');
        onLogAdded(newLog);
        fetchAIInsights();
      }
    } catch (err) {
      console.error('Quick logging failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (url) => {
    setIsUpdatingAvatar(true);
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar_url: url })
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user, token);
        setIsSelectingAvatar(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // Calculate category breakdowns from recent logs
  const calculateCategoryEmissions = (cat) => {
    return recentLogs
      .filter(log => log.category === cat)
      .reduce((sum, log) => sum + parseFloat(log.carbon_emissions), 0);
  };
  const transportEmissions = calculateCategoryEmissions('transportation');
  const energyEmissions = calculateCategoryEmissions('energy');
  const foodEmissions = calculateCategoryEmissions('food');
  const wasteEmissions = calculateCategoryEmissions('waste');
  const recentTotalEmissions = useMemo(() => {
    const now = new Date();
    const filteredLogs = recentLogs.filter(log => {
      const logDate = new Date(log.logged_at);
      if (trendFilter === 'Today') {
        return logDate.toDateString() === now.toDateString();
      } else if (trendFilter === 'Week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return logDate >= weekAgo;
      } else if (trendFilter === 'Month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return logDate >= monthAgo;
      } else if (trendFilter === 'Year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return logDate >= yearAgo;
      }
      return true;
    });
    return filteredLogs.reduce((sum, log) => sum + parseFloat(log.carbon_emissions), 0);
  }, [recentLogs, trendFilter]);

  // Prepare data for Line Chart (emissions over time)
  const emissionsOverTime = useMemo(() => {
    const now = new Date();
    
    // Filter logs based on selected timeframe
    let filteredLogs = recentLogs.filter(log => {
      const logDate = new Date(log.logged_at);
      if (trendFilter === 'Today') {
        return logDate.toDateString() === now.toDateString();
      } else if (trendFilter === 'Week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return logDate >= weekAgo;
      } else if (trendFilter === 'Month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return logDate >= monthAgo;
      } else if (trendFilter === 'Year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return logDate >= yearAgo;
      }
      return true;
    });

    const grouped = filteredLogs.reduce((acc, log) => {
      const logDate = new Date(log.logged_at);
      let key;
      if (trendFilter === 'Today') {
        // Group by hour
        key = logDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      } else if (trendFilter === 'Year') {
        // Group by month
        key = logDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      } else {
        // Group by day (for Week and Month)
        key = logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
      
      if (!acc[key]) acc[key] = { date: key, emissions: 0, timestamp: logDate.getTime() };
      acc[key].emissions += parseFloat(log.carbon_emissions);
      return acc;
    }, {});
    
    // Convert to array and sort by actual timestamp so the chart goes from oldest (left) to newest (right)
    const chartData = Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove the temporary timestamp property
    const finalData = chartData.map(d => ({ date: d.date, emissions: Math.round(d.emissions) }));
    
    // If there's only 1 data point (e.g. brand new user) and filter is Week/Month/Year, mock a history point
    if (finalData.length === 1 && trendFilter !== 'Today') {
      const currentEmissions = finalData[0].emissions;
      
      if (trendFilter === 'Year') {
        const lastPeriod = new Date(now);
        lastPeriod.setMonth(now.getMonth() - 1);
        finalData.unshift({ date: lastPeriod.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), emissions: Math.round(currentEmissions * 1.15) });
      } else {
        const lastPeriod = new Date(now);
        lastPeriod.setDate(now.getDate() - 2);
        finalData.unshift({ date: lastPeriod.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), emissions: Math.round(currentEmissions * 1.05) });
      }
    }

    return finalData;
  }, [recentLogs, trendFilter]);

  // Prepare data for Bar Chart (emissions by category)
  const categoryData = useMemo(() => {
    return [
      { name: 'Transport', emissions: Math.round(transportEmissions), fill: '#60a5fa' },
      { name: 'Energy', emissions: Math.round(energyEmissions), fill: '#fbbf24' },
      { name: 'Food', emissions: Math.round(foodEmissions), fill: '#f87171' },
      { name: 'Waste', emissions: Math.round(wasteEmissions), fill: '#a78bfa' }
    ];
  }, [transportEmissions, energyEmissions, foodEmissions, wasteEmissions]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      
      <header 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100, 
          padding: '10px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '40px',
          borderRadius: '50px',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          width: '95%',
          maxWidth: '1600px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 20px 6px 6px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          <div className="pulse-glow" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.1)', padding: '2px' }}>
            <img src="/leaf_footprint.webp" alt="Logo" width="32" height="32" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.8)) drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))', aspectRatio: '1/1' }} />
          </div>
          <h1 className="pulse-glow" style={{ fontSize: '20px', margin: 0, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#4ade80', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>EcoSense</h1>
        </div>

        <nav style={{ display: 'flex', gap: '48px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <span
            onClick={onGoHome}
            style={{ 
              cursor: 'pointer', 
              color: '#e2e8f0', 
              fontSize: '15px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease-in-out',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#4ade80'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <TooltipIcon name="Home" size={18} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }} />
            Home
          </span>
          {[
            { id: 'overview', label: 'Overview', icon: 'BarChart2' },
            { id: 'history', label: 'Recent Analysis', icon: 'History' },
            { id: 'community', label: 'Community', icon: 'Users' },
            { id: 'games', label: 'Eco Games', icon: 'Gamepad2' },
            { id: 'rewards', label: 'Rewards', icon: 'Gift' },
            { id: 'goals', label: 'Goals', icon: 'Target' }
          ].map(tab => (
            <span
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                cursor: 'pointer',
                color: activeTab === tab.id ? '#4ade80' : '#e2e8f0',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease-in-out',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.color = '#4ade80'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              <TooltipIcon name={tab.icon} size={18} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }} />
              {tab.label}
            </span>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{ 
              padding: '8px 20px', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              background: isProfileOpen ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '30px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              transition: 'background 0.2s'
            }}
          >
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
            ) : (
              <TooltipIcon name="User" size={18} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }} />
            )}
            Hi, {currentUser?.username || 'you'}
          </div>

          {isProfileOpen && (
            <div className="animate-slide-up" style={{
              position: 'absolute',
              top: '100%',
              right: '48px',
              marginTop: '12px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              width: '260px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {isSelectingAvatar ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 16px 0' }}>Choose Avatar</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {['/avatars/avatar1.png', '/avatars/avatar2.png', '/avatars/avatar3.png', '/avatars/avatar4.png'].map(url => (
                      <img 
                        key={url}
                        src={url} 
                        alt="avatar option" 
                        onClick={() => !isUpdatingAvatar && handleAvatarChange(url)}
                        style={{ 
                          width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover', background: '#fff',
                          border: currentUser?.avatar_url === url ? '3px solid var(--accent-emerald)' : '3px solid transparent',
                          opacity: isUpdatingAvatar ? 0.5 : 1,
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ))}
                  </div>
                  <button onClick={() => setIsSelectingAvatar(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', border: '3px solid var(--accent-emerald)', objectFit: 'cover', background: '#fff' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '3px solid var(--accent-emerald)' }}>
                        <TooltipIcon name="User" size={40} style={{ color: '#fff' }} />
                      </div>
                    )}
                    <button 
                      onClick={() => setIsSelectingAvatar(true)}
                      style={{ position: 'absolute', bottom: '16px', right: '-8px', background: 'var(--accent-emerald)', color: '#000', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      title="Change Avatar"
                    >
                      <TooltipIcon name="Edit2" size={14} />
                    </button>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#fff' }}>{currentUser?.username || 'Eco Warrior'}</h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{currentUser?.email || 'user@example.com'}</p>
                  
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Emissions</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{Math.round(totalEmissions)} kg</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Pending Pts</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>{currentUser?.pending_points || 0}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Logs</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#60a5fa' }}>{recentLogs?.length || 0}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button 
            onClick={onLogout}
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '8px', 
              borderRadius: '50%', 
              color: 'var(--accent-emerald)',
              transition: 'background 0.3s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
            }}
            title="Logout"
          >
            <TooltipIcon name="LogOut" size={18} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', margin: '100px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Top Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
              
              {/* Circular Trackers */}
              <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>Emissions Dashboard</h3>
                
                {/* Main Tracker */}
                <div 
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '50%', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    border: '6px solid rgba(74, 222, 128, 0.5)',
                    boxShadow: '0 0 30px rgba(74, 222, 128, 0.2)',
                    color: '#ffffff',
                    marginBottom: '32px'
                  }}
                >
                  <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Total Emissions</span>
                  <span style={{ fontSize: '64px', fontWeight: 800, margin: '4px 0', lineHeight: 1, color: '#4ade80' }}>
                    {aiInsights ? Math.round(aiInsights.totalEstimatedCO2 || totalEmissions) : Math.round(totalEmissions)}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Kgs CO₂</span>
                </div>

                {/* Sub Trackers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', width: '100%' }}>
                  {[
                    { label: 'Transport', value: transportEmissions, color: '#60a5fa' },
                    { label: 'Energy', value: energyEmissions, color: '#fbbf24' },
                    { label: 'Food', value: foodEmissions, color: '#f87171' },
                    { label: 'Waste', value: wasteEmissions, color: '#a78bfa' }
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 8px',
                        border: `3px solid ${stat.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ffffff', fontSize: '14px', fontWeight: 700, background: 'rgba(0,0,0,0.3)'
                      }}>
                        {Math.round(stat.value)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Averages Comparison */}
              <div className="glass-panel" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '32px', fontFamily: "'Playfair Display', serif", textAlign: 'center' }}>Global & Regional Comparison</h3>
                {aiInsights?.comparison ? (
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '60px', height: `${Math.min(100, (recentTotalEmissions / 500) * 100)}%`, background: 'var(--accent-emerald)', borderRadius: '8px 8px 0 0', minHeight: '20px' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>{Math.round(recentTotalEmissions)} kg</div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8, color: 'var(--text-muted)' }}>You ({trendFilter})</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '60px', height: `${Math.min(100, (aiInsights.comparison.indianAverage / 500) * 100)}%`, background: '#fbbf24', borderRadius: '8px 8px 0 0', minHeight: '20px' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>{aiInsights.comparison.indianAverage} kg</div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8, color: 'var(--text-muted)' }}>India Avg</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '60px', height: `${Math.min(100, (aiInsights.comparison.globalAverage / 500) * 100)}%`, background: '#f87171', borderRadius: '8px 8px 0 0', minHeight: '20px' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>{aiInsights.comparison.globalAverage} kg</div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8, color: 'var(--text-muted)' }}>Global Avg</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: '20px' }}>😏 Loading comparison data...</p>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <Suspense fallback={<div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading charts...</div>}>
                <DashboardCharts emissionsOverTime={emissionsOverTime} categoryData={categoryData} />
              </Suspense>
            </div>

            {/* Global Map Section */}
            <Suspense fallback={<div style={{ height: '750px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Map...</div>}>
              <GlobalMap />
            </Suspense>

            {/* Bottom Section: Reports and Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
              
              {/* Your Report (Recent Activities) */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Your Recent Activities</h3>
                  <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontWeight: 600 }}>
                    Report
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentLogs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        borderRadius: '16px', 
                        padding: '16px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{log.sub_category}</h3>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', maxWidth: '200px', lineHeight: 1.4 }}>
                          Logged {log.input_value} {log.unit} on {new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ 
                        backgroundColor: 'rgba(74, 222, 128, 0.2)', 
                        color: '#4ade80',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        minWidth: '60px'
                      }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, display: 'block' }}>
                          {parseFloat(log.carbon_emissions).toFixed(0)}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>Kgs</span>
                      </div>
                    </div>
                  ))}
                  {recentLogs.length === 0 && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px' }}>No logs yet. Add one below!</p>
                  )}
                </div>
              </div>

              {/* Actionable Steps & Quick Log */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Advices to reduce footprint */}
                <div className="glass-panel pulse-glow" style={{ padding: '30px', borderColor: 'var(--accent-emerald)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <TooltipIcon name="Lightbulb" size={24} style={{ color: 'var(--accent-emerald)' }} />
                    <h3 style={{ fontSize: '22px', color: '#ffffff', fontFamily: "'Playfair Display', serif" }}>Advices to reduce footprint</h3>
                  </div>

                  {aiLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '20px' }}>
                      <span style={{ fontSize: '40px', animation: 'wobbleCalc 1s linear infinite' }}>😏</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Loading insights...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {aiInsights?.suggestions?.slice(0,3).map((s, idx) => (
                        <div key={idx} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <h3 style={{ fontSize: '15px', color: '#ffffff', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{s.text}</p>
                        </div>
                      ))}
                      {(!aiInsights || !aiInsights.suggestions) && (
                         <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Keep logging activities to get personalized steps!</p>
                      )}
                    </div>
                  )}
                </div>

                {/* QUICK LOG ACTIVITY */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <h3 style={{ fontSize: '22px', color: '#ffffff', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>Quick Log</h3>
                  <form onSubmit={handleQuickLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {[
                        { id: 'transportation', label: 'Transit', icon: <Car size={16} /> },
                        { id: 'energy', label: 'Energy', icon: <Zap size={16} /> },
                        { id: 'food', label: 'Food', icon: <Coffee size={16} /> },
                        { id: 'waste', label: 'Waste', icon: <Trash2 size={16} /> }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={category === cat.id ? 'skeuo-button' : 'skeuo-raised'}
                          style={{ 
                            padding: '10px 4px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            color: category === cat.id ? '#fff' : 'var(--text-dark)',
                            border: category === cat.id ? 'none' : '1px solid var(--card-border)'
                          }}
                          onClick={() => setCategory(cat.id)}
                        >
                          {cat.icon}
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <select 
                      value={subCategory} 
                      onChange={(e) => setSubCategory(e.target.value)} 
                      style={{ width: '100%', fontSize: '14px', backgroundColor: '#f1f5f9', color: '#000000', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {category === 'transportation' && (
                        <>
                          <option value="Petrol Car">Petrol Car Commute</option>
                          <option value="Diesel Car">Diesel Car Commute</option>
                          <option value="EV Car">Electric Vehicle Commute</option>
                          <option value="Public Bus">Public Bus Trip</option>
                          <option value="Train">Train Journey</option>
                        </>
                      )}
                      {category === 'energy' && (
                        <>
                          <option value="Electricity">Electricity Usage</option>
                          <option value="LPG Gas">LPG Cooking Gas</option>
                        </>
                      )}
                      {category === 'food' && (
                        <>
                          <option value="Meat Meals">Non-Veg Meat Meal</option>
                          <option value="Vegetarian">Vegetarian Meal</option>
                          <option value="Vegan">Vegan Plant Meal</option>
                        </>
                      )}
                      {category === 'waste' && (
                        <>
                          <option value="Non-recycled Landfill">Landfill Waste</option>
                          <option value="Recyclable Separated">Recycled Materials</option>
                        </>
                      )}
                    </select>

                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="Amount"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px', paddingRight: '60px', backgroundColor: '#f1f5f9', color: '#000000', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#4ade80', fontWeight: 700 }}>
                        {unit}
                      </span>
                    </div>

                    <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '14px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Plus size={18} /> {isSubmitting ? 'Logging...' : 'Add Log'}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading History...</div>}>
            <HistoryTab recentLogs={recentLogs} />
          </Suspense>
        )}

        {activeTab === 'community' && (
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Community...</div>}>
            <CommunityTab 
              tips={tips} 
              fetchMore={() => fetchTips(false)}
              hasMore={hasMoreTips}
              isLoading={tipsLoading}
            />
          </Suspense>
        )}

        {activeTab === 'games' && (
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Eco Games...</div>}>
            <EcoGames />
          </Suspense>
        )}

        {activeTab === 'rewards' && (
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Rewards...</div>}>
            <RewardsTab />
          </Suspense>
        )}

        {activeTab === 'goals' && (
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Goals...</div>}>
            <GoalsTab />
          </Suspense>
        )}

      </main>
    </div>
  );
}
