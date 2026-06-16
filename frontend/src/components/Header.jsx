import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Play, UserPlus, Menu, X } from 'lucide-react';
import TooltipIcon from './TooltipIcon';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentUser, dashboardData, onLoginClick, onCreateAccountClick, onLogout, onNavigate, onGoHome, activeTab }) {
  const { token, login } = useAuth();
  const totalEmissions = dashboardData?.totalEmissions || 0;
  const recentLogs = dashboardData?.recentLogs || [];
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setIsSelectingAvatar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  return (
    <>
      <header 
        className="glass-panel app-header" 
        style={{ 
          margin: 'var(--space-md) auto', 
          width: '95%',
          maxWidth: '1600px', 
          padding: '10px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          zIndex: 9999,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsSidebarOpen(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
          >
            <Menu size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '4px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src="/leaf_footprint.webp" alt="Logo" width="32" height="32" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%', aspectRatio: '1/1', background: '#fff' }} className="pulse-glow" />
            <span className="pulse-glow logo-text" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '20px', color: '#4ade80', letterSpacing: '1px' }}>
              EcoSense
            </span>
          </div>
        </div>

        {/* Central Navigation Links */}
        {currentUser && (
          <nav className="nav-scrollable desktop-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <span 
              style={{ cursor: 'pointer', color: (!activeTab || activeTab === 'home') ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease-in-out', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { if (activeTab !== 'home' && activeTab) e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { if (activeTab !== 'home' && activeTab) e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onClick={onGoHome}
            >
              <TooltipIcon name="Home" size={16} />
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
                onClick={() => onNavigate && onNavigate(tab.id)}
                style={{ cursor: 'pointer', color: activeTab === tab.id ? 'var(--accent-emerald)' : 'var(--text-muted)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease-in-out', whiteSpace: 'nowrap', fontWeight: activeTab === tab.id ? 600 : 400 }}
                onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <TooltipIcon name={tab.icon} size={16} />
                {tab.label}
              </span>
            ))}
          </nav>
        )}
        <div className="hide-on-mobile" style={{ display: 'flex', gap: '24px', alignItems: 'center', color: 'var(--text-primary)' }}>
          {currentUser ? (
            <div ref={profileRef} style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', background: isProfileOpen ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)', padding: '8px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
                ) : (
                  <TooltipIcon name="User" size={20} style={{ color: 'var(--accent-emerald)' }} />
                )}
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>Hi, {currentUser.username}</span>
              </div>

              {isProfileOpen && (
                <div className="animate-slide-up" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '48px',
                  marginTop: '12px',
                  background: 'rgba(5, 8, 15, 0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                  width: '260px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  zIndex: 9999,
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
                          <img src={currentUser.avatar_url} alt="Profile" className="profile-dropdown-avatar" />
                        ) : (
                          <div className="profile-dropdown-placeholder">
                            <TooltipIcon name="User" size={32} style={{ color: '#fff' }} />
                          </div>
                        )}
                        <button 
                          className="profile-edit-btn"
                          onClick={() => setIsSelectingAvatar(true)}
                          title="Change Avatar"
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <TooltipIcon name="Edit2" size={14} />
                        </button>
                      </div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#fff' }}>{currentUser?.username || 'Eco Warrior'}</h3>
                      <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#fff' }}>{currentUser?.email || 'user@example.com'}</p>
                      
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
                className="hide-logout-mobile"
                style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px', 
                  borderRadius: '50%', 
                  color: 'var(--accent-emerald)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                title="Logout"
              >
                <TooltipIcon name="LogOut" size={18} />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}
              >
                Log In
              </button>
              <button 
                onClick={onCreateAccountClick}
                className="skeuo-button"
                style={{ padding: '10px 24px', borderRadius: '30px', fontWeight: 600, fontSize: '15px' }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      <div className={`mobile-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setIsSidebarOpen(false)}>
              <X size={28} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img src="/leaf_footprint.webp" alt="Logo" width="32" height="32" style={{ borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
              <h2 style={{ margin: 0, color: '#4ade80', fontSize: '24px', fontFamily: "'Playfair Display', serif" }}>EcoSense</h2>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span
                onClick={() => { onGoHome && onGoHome(); setIsSidebarOpen(false); }}
                style={{ cursor: 'pointer', color: (!activeTab || activeTab === 'home') ? '#4ade80' : '#e2e8f0', fontWeight: (!activeTab || activeTab === 'home') ? 600 : 400, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <TooltipIcon name="Home" size={20} />
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
                  onClick={() => { onNavigate && onNavigate(tab.id); setIsSidebarOpen(false); }}
                  style={{
                    cursor: 'pointer',
                    color: activeTab === tab.id ? '#4ade80' : '#e2e8f0',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <TooltipIcon name={tab.icon} size={20} />
                  {tab.label}
                </span>
              ))}
            </nav>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />
          
          {currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TooltipIcon name="User" size={20} style={{ color: '#fff' }} />
                  </div>
                )}
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{currentUser.username || 'Eco Warrior'}</div>
                  <div style={{ color: 'var(--accent-emerald)', fontSize: '12px' }}>{Math.round(totalEmissions || 0)} kg CO2</div>
                </div>
              </div>
              
              <button 
                onClick={() => { onLogout(); setIsSidebarOpen(false); }}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  color: '#ef4444', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  fontWeight: 'bold'
                }}
              >
                <TooltipIcon name="LogOut" size={18} />
                Logout
              </button>
            </>
          ) : (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => { onLoginClick(); setIsSidebarOpen(false); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px', borderRadius: '8px' }}>Log In</button>
              <button onClick={() => { onCreateAccountClick(); setIsSidebarOpen(false); }} className="skeuo-button" style={{ padding: '12px', borderRadius: '8px' }}>Get Started</button>
            </div>
          )}
      </div>
    </>
  );
}
