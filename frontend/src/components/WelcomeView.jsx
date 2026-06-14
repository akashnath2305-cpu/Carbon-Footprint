import React, { useState, useEffect } from 'react';
import { LogIn, Play, UserPlus } from 'lucide-react';
import TooltipIcon from './TooltipIcon';
import { useAuth } from '../context/AuthContext';

export default function WelcomeView({ currentUser, dashboardData, onLoginClick, onCreateAccountClick, onProceed, onLogout, onNavigate }) {
  const { token, login } = useAuth();
  const totalEmissions = dashboardData?.totalEmissions || 0;
  const recentLogs = dashboardData?.recentLogs || [];
  
  const [scrollY, setScrollY] = useState(0);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

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
  
  // Quotes Carousel State
  const quotes = [
    "The greatest threat to our planet is the belief that someone else will save it. – Robert Swan",
    "We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly. – Anne Marie Bonneau",
    "What you do makes a difference, and you have to decide what kind of difference you want to make. – Jane Goodall",
    "The Earth is what we all have in common. – Wendell Berry"
  ];
  const [quoteIdx, setQuoteIdx] = useState(0);

  const newsItems = [
    { id: 1, title: 'Global Carbon Emissions Hit New Record in 2025', source: 'Climate Daily', time: '2 hours ago' },
    { id: 2, title: 'New Solar Technologies Promise 40% Efficiency', source: 'Eco Tech', time: '5 hours ago' },
    { id: 3, title: 'Ocean Cleanup Project Reaches Milestone', source: 'Ocean Watch', time: '1 day ago' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Typing Effect State
  const phrases = ["The Planet.", "Your Community.", "Your Future."];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx];
    let timer;

    if (!isDeleting && charIdx < currentPhrase.length) {
      timer = setTimeout(() => setCharIdx(prev => prev + 1), 100);
    } else if (isDeleting && charIdx > 0) {
      timer = setTimeout(() => setCharIdx(prev => prev - 1), 50);
    } else if (!isDeleting && charIdx === currentPhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000); // Pause at end of word
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, phraseIdx, phrases]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Glass Navigation Header */}
      <header 
        className="glass-panel" 
        style={{ 
          margin: '20px auto', 
          width: '95%',
          maxWidth: '1600px', 
          padding: '10px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          zIndex: 10,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '4px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/leaf_footprint.webp" alt="Logo" width="32" height="32" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%', aspectRatio: '1/1' }} className="pulse-glow" />
          <span className="pulse-glow" style={{ fontFamily: 'var(--font-headers)', fontWeight: 800, fontSize: '24px', color: '#ffffff', letterSpacing: '1px' }}>
            Eco<span style={{ color: 'var(--accent-emerald)', fontWeight: 300 }}>Sense</span>
          </span>
        </div>

        {/* Central Navigation Links */}
        {currentUser && (
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <span 
              style={{ cursor: 'pointer', color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease-in-out', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
                style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease-in-out', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <TooltipIcon name={tab.icon} size={16} />
                {tab.label}
              </span>
            ))}
          </nav>
        )}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', color: 'var(--text-primary)' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
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
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px', 
                  borderRadius: '50%', 
                  color: 'var(--accent-emerald)',
                  transition: 'background 0.3s'
                }}
                title="Logout"
              >
                <TooltipIcon name="LogOut" size={20} />
              </button>
            </div>
          ) : (
            <button 
              className="skeuo-button" 
              style={{ borderRadius: '30px', padding: '12px 32px' }}
              onClick={onLoginClick}
            >
              <LogIn size={18} /> Login / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        style={{ 
          maxWidth: '1000px', 
          margin: '40px auto', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 5, 
          textAlign: 'center' 
        }}
      >
        <div className="glass-panel animate-slide-up" style={{ padding: '60px 32px', marginBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <p style={{ fontSize: '18px', textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
            Welcome to the future of sustainability
          </p>
          
          <h1 style={{ fontSize: '48px', lineHeight: 1.2, marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px', color: 'var(--text-primary)', minHeight: '116px' }}>
            Calculate Your Impact On <br/>
            <span className="typing-text typing-cursor" style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>
              {phrases[phraseIdx].substring(0, charIdx)}
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Track your personal carbon emissions across transportation, diet, and household utilities. Let our AI tailor a roadmap to lower your footprint and join a community making real-world change.
          </p>

          {currentUser ? (
            <button 
              className="skeuo-button pulse-glow" 
              style={{ borderRadius: '30px', padding: '16px 48px', letterSpacing: '2px', fontSize: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto' }}
              onClick={onProceed}
            >
              <Play size={20} /> START JOURNEY
            </button>
          ) : (
            <button 
              className="skeuo-button pulse-glow" 
              style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto' }}
              onClick={onCreateAccountClick}
            >
              <UserPlus size={18} /> Create Account
            </button>
          )}
        </div>

        {/* Quote Carousel Section */}
        <div 
          className="glass-panel"
          style={{ 
            marginTop: '0px',
            marginBottom: '40px',
            padding: '24px 40px',
            minHeight: '100px',
            maxWidth: '650px',
            margin: '0 auto 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.05)',
            borderRadius: '24px'
          }}
        >
          {/* Decorative quotes - Left */}
          <div style={{ position: 'absolute', top: '15px', left: '20px', color: 'var(--accent-emerald)', fontSize: '60px', fontFamily: 'serif', lineHeight: 0.8, opacity: 0.9 }}>“</div>
          
          <div 
            key={quoteIdx}
            className="animate-slide-up"
            style={{ textAlign: 'center', padding: '0 20px', width: '100%', zIndex: 2 }}
          >
            <p style={{ 
              color: 'var(--text-primary)', 
              fontSize: '16px', 
              fontStyle: 'normal', 
              fontWeight: 400,
              lineHeight: 1.5,
              margin: '0 0 12px 0'
            }}>
              {quotes[quoteIdx].split(' – ')[0]}
            </p>
            <p style={{
              color: 'var(--accent-emerald)',
              fontSize: '14px',
              fontWeight: 600,
              margin: 0
            }}>
              – {quotes[quoteIdx].split(' – ')[1]}
            </p>
          </div>
          
          {/* Decorative quotes - Right */}
          <div style={{ position: 'absolute', bottom: '-5px', right: '20px', color: 'var(--accent-emerald)', fontSize: '60px', fontFamily: 'serif', lineHeight: 0.8, opacity: 0.9 }}>”</div>
        </div>

        {/* Row 1: What is a Carbon Footprint (Full width) */}
        <div className="animate-slide-up" style={{ marginBottom: '40px', textAlign: 'left' }}>
          <div className="glass-panel" style={{ padding: '40px', display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <TooltipIcon name="Info" size={28} style={{ color: 'var(--accent-emerald)' }} />
                <h2 style={{ fontSize: '24px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>What is a Carbon Footprint?</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
                Your carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by your actions. 
                Everything from the food you eat, the clothes you buy, to the way you commute contributes to this number.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>
                The average carbon footprint for a person in the United States is 16 tons, one of the highest rates in the world. 
                Globally, the average is closer to 4 tons. To have the best chance of avoiding a 2℃ rise in global temperatures, the average global carbon footprint per year needs to drop to under 2 tons by 2050.
              </p>
            </div>
            <div style={{ width: '250px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <img src="/footprint_measure.webp" width="313" height="292" alt="Carbon Footprint Measure" style={{ width: '100%', borderRadius: '16px', objectFit: 'contain', aspectRatio: '313/292', height: 'auto' }} />
            </div>
          </div>
        </div>

        {/* Row 2: Stats (Side by side) */}
        <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <TooltipIcon name="TreePine" size={40} style={{ color: 'var(--accent-emerald)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Afforestation Average</h2>
            <p style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>+12.5%</p>
            <p style={{ fontSize: '14px', color: 'var(--accent-emerald)' }}>Increase since last decade</p>
          </div>

          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <TooltipIcon name="Globe2" size={40} style={{ color: '#60a5fa', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Steps Taken</h2>
            <p style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>4.2B</p>
            <p style={{ fontSize: '14px', color: '#60a5fa' }}>Metric tons of CO2 offset this year</p>
          </div>
        </div>

        {/* Row 3: Fun Facts & News (Side by side) */}
        <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px', textAlign: 'left', alignItems: 'start' }}>
          
          <div className="glass-panel" style={{ padding: '30px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <TooltipIcon name="Lightbulb" size={24} style={{ color: '#fbbf24' }} />
              <h2 style={{ fontSize: '20px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Fun Facts about Nature</h2>
            </div>
            <ul style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><strong>Trees are superheroes:</strong> A single mature tree can absorb carbon dioxide at a rate of 48 lbs per year and release enough oxygen back into the atmosphere to support two human beings.</li>
              <li><strong>The Ocean's role:</strong> The ocean is the planet's greatest carbon sink, absorbing about 30% of the carbon dioxide that humans pump into the atmosphere.</li>
              <li><strong>Digital carbon:</strong> Every email, search query, and streamed video requires energy. The internet accounts for about 3.7% of global greenhouse emissions.</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '30px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
              <img className="pulse-glow" src="/leaf_footprint.webp" alt="Logo" width="40" height="40" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', aspectRatio: '1/1' }} />
              <h2 className="pulse-glow" style={{ fontSize: '32px', margin: 0, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'var(--accent-emerald)' }}>
                Headlines
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {newsItems.map(news => (
                <div key={news.id} style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '8px', lineHeight: 1.4 }}>{news.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>{news.source}</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
