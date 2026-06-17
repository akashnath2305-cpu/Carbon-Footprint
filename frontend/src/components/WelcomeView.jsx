import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Play, UserPlus, Menu, X } from 'lucide-react';
import TooltipIcon from './TooltipIcon';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

export default function WelcomeView({ currentUser, dashboardData, onLoginClick, onCreateAccountClick, onProceed, onLogout, onNavigate }) {
  const { token, login } = useAuth();
  const totalEmissions = dashboardData?.totalEmissions || 0;
  const recentLogs = dashboardData?.recentLogs || [];
  
  const [scrollY, setScrollY] = useState(0);
  

  
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
      
      <Header 
        currentUser={currentUser}
        dashboardData={dashboardData}
        onLoginClick={onLoginClick}
        onCreateAccountClick={onCreateAccountClick}
        onLogout={onLogout}
        onNavigate={onNavigate}
        activeTab="home"
      />

      {/* Main Content Area */}
      <main 
        style={{ 
          maxWidth: '1000px', 
          margin: '40px auto', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 1, 
          textAlign: 'center' 
        }}
      >
        <div className="glass-panel animate-slide-up welcome-main-panel" style={{ marginBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <p style={{ fontSize: '18px', textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
            Welcome to the future of sustainability
          </p>
          
          <h1 className="welcome-title" style={{ lineHeight: 1.2, marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px', color: 'var(--text-primary)', minHeight: '116px' }}>
            Calculate Your Impact On <br/>
            <span className="typing-text typing-cursor" style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>
              {phrases[phraseIdx].substring(0, charIdx)}
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Track your personal carbon emissions across transportation, diet, and household utilities. Let our AI tailor a roadmap to lower your footprint and join a community making real-world change.
          </p>

          <button 
            className="skeuo-button pulse-glow" 
            style={{ borderRadius: '30px', padding: '16px 48px', letterSpacing: '2px', fontSize: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto' }}
            onClick={currentUser ? onProceed : onLoginClick}
          >
            <Play size={20} /> START JOURNEY
          </button>
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
          <div className="glass-panel responsive-flex-row" style={{ padding: '40px', alignItems: 'center' }}>
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
        <div className="animate-slide-up responsive-grid-2" style={{ marginBottom: '40px' }}>
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
        <div className="animate-slide-up responsive-grid-2" style={{ marginBottom: '40px', textAlign: 'left', alignItems: 'start' }}>
          
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
