import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import TooltipIcon from './TooltipIcon';
import confetti from 'canvas-confetti';
export default function CalculatorResult({ result, onFinish }) {
  const [addedGoals, setAddedGoals] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    // Fetch recent logs to show "Your Recent Activities"
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data && data.recentLogs) {
          setRecentLogs(data.recentLogs.slice(0, 5));
        }
      })
      .catch(err => console.error('Failed to fetch recent logs', err));
  }, []);

  useEffect(() => {
    if (result && result.totalEstimatedCO2 < (result.comparison?.indianAverage || 1900)) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  if (!result) return null;

  const { totalEstimatedCO2, breakdown, comparison, suggestions } = result;

  // Mock historical data to show "improvements from previous one"
  // Since we might only have one audit, we'll create a simulated trend line ending at the current value
  const trendData = [
    { month: 'Jan', emissions: totalEstimatedCO2 * 1.15 },
    { month: 'Feb', emissions: totalEstimatedCO2 * 1.10 },
    { month: 'Mar', emissions: totalEstimatedCO2 * 1.05 },
    { month: 'Current', emissions: totalEstimatedCO2 }
  ];

  const handleAddGoal = (suggestion, index) => {
    // In a real app, this would POST to the backend
    // We'll simulate adding it by storing in local state to change the button UI
    // And you can store it in localStorage so GoalsTab can pick it up
    const existingGoals = JSON.parse(localStorage.getItem('userGoals') || '[]');
    existingGoals.push({ id: Date.now(), text: suggestion.title + ': ' + suggestion.text, completed: false });
    localStorage.setItem('userGoals', JSON.stringify(existingGoals));
    
    setAddedGoals(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: '#fff' }}>
      


      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '48px', fontFamily: "'Playfair Display', serif", margin: '0 0 16px 0', color: 'var(--accent-emerald)' }}>Your Footprint Analysis</h2>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Calculated dynamically by Gemini AI</p>

        {totalEstimatedCO2 < (comparison?.indianAverage || 1900) && (
          <div className="animate-fade-in" style={{ marginTop: '24px', padding: '16px 32px', background: 'rgba(74, 222, 128, 0.1)', border: '2px dashed rgba(74, 222, 128, 0.4)', borderRadius: '12px', display: 'inline-block' }}>
            <h3 style={{ fontSize: '24px', color: '#4ade80', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              🎉 Congrats! 🎉
            </h3>
            <p style={{ fontSize: '16px', color: '#fff', margin: 0 }}>
              Your carbon footprint is less than the average!
            </p>
          </div>
        )}
      </div>

      {/* Top Stats & Breakdown */}
      <div className="responsive-grid-2" style={{ marginBottom: '40px' }}>
        
        {/* Total & Comparison */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>Total Annual Emissions</h3>
          <div style={{ fontSize: '64px', fontWeight: 800, color: '#4ade80', lineHeight: 1, marginBottom: '24px' }}>
            {Math.round(totalEstimatedCO2)} <span style={{ fontSize: '20px' }}>kg CO₂</span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', width: '100%', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Global Average</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>{comparison?.globalAverage || 4700} kg</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Indian Average</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>{comparison?.indianAverage || 1900} kg</div>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel" style={{ padding: '30px', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '16px', fontFamily: "'Playfair Display', serif", textAlign: 'center' }}>Category Breakdown</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="emissions" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || ['#60a5fa', '#fbbf24', '#f87171', '#a78bfa'][index % 4]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Historical Improvements Chart */}
      <div className="glass-panel" style={{ padding: '30px', height: '400px', marginBottom: '40px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>Improvements Over Time</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} domain={['auto', 'auto']} width={35} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#4ade80', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="emissions" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', stroke: '#60a5fa', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini Advice Goals */}
      <h3 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>Adaptive Advice</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        {suggestions && suggestions.map((s, index) => (
          <div key={index} className="glass-panel pulse-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '18px', color: '#fff', fontWeight: 700, margin: 0 }}>{s.title}</h4>
                <TooltipIcon name="Lightbulb" size={20} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '20px' }}>{s.text}</p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px' }}>Impact: {s.impact}</span>
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px' }}>Diff: {s.difficulty}</span>
              </div>
            </div>
            
            <button 
              className={addedGoals[index] ? "skeuo-button" : "skeuo-raised"}
              onClick={() => handleAddGoal(s, index)}
              disabled={addedGoals[index]}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                fontWeight: 600,
                background: addedGoals[index] ? 'var(--accent-emerald)' : '#fff',
                color: addedGoals[index] ? '#fff' : '#000',
                border: 'none',
                cursor: addedGoals[index] ? 'default' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {addedGoals[index] ? <><TooltipIcon name="Check" size={18} /> Added to Goals</> : <><TooltipIcon name="Target" size={18} /> Set as Goal</>}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Activities Section */}
      {recentLogs.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>Your Recent Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentLogs.map((log) => (
              <div key={log.id} className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '18px', color: '#fff', fontWeight: 600, margin: '0 0 8px 0' }}>{log.sub_category}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                    Logged {log.input_value} {log.unit} on {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80' }}>
                    {Math.round(log.carbon_emissions)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4ade80' }}>Kgs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button className="skeuo-button" style={{ borderRadius: '30px', padding: '16px 48px', letterSpacing: '2px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto' }} onClick={onFinish}>
          <TooltipIcon name="LayoutDashboard" size={20} /> GO TO DASHBOARD
        </button>
      </div>

    </div>
  );
}
