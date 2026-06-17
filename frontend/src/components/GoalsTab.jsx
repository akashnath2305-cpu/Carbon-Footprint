import React, { useState, useEffect } from 'react';
import { Plus, Target, Trophy, Users, Medal, Star, Check } from 'lucide-react';
import TooltipIcon from './TooltipIcon';

export default function GoalsTab() {
  const defaultGoals = [];

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('userGoals');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Purge the buggy fallback goal from local storage if it was saved
          parsed = parsed.filter(g => !g.text.includes('Backend Disconnected'));
          return parsed;
        }
      } catch(e) {}
    }
    return defaultGoals;
  });

  useEffect(() => {
    localStorage.setItem('userGoals', JSON.stringify(goals));
  }, [goals]);
  const [newGoal, setNewGoal] = useState('');
  const [reminderTime, setReminderTime] = useState('20:00');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoal.trim() === '') return;
    setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
    setNewGoal('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const mockLeaderboard = [
    { id: 1, name: "EcoWarrior99", savings: "145 kg CO₂", isUser: false },
    { id: 2, name: "Jane Doe", savings: "120 kg CO₂", isUser: false },
    { id: 3, name: "You", savings: "95 kg CO₂", isUser: true },
    { id: 4, name: "GreenNeighbor", savings: "80 kg CO₂", isUser: false },
    { id: 5, name: "PlanetSaver", savings: "45 kg CO₂", isUser: false },
  ];

  return (
    <div className="responsive-grid-2" style={{ alignItems: 'start' }}>
      
      {/* Goals Section */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <TooltipIcon name="Target" size={24} className="icon-pulse" style={{ color: 'var(--accent-emerald)' }} />
          <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Your Sustainability Goals</h3>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', marginBottom: '8px', fontSize: '14px' }}>
            <span>Self Assessment Progress</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{progress}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-emerald)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {goals.map(goal => (
            <div 
              key={goal.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: 'rgba(0,0,0,0.3)', 
                padding: '16px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div 
                onClick={() => toggleGoal(goal.id)}
                style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  border: goal.completed ? 'none' : '2px solid rgba(255,255,255,0.3)',
                  background: goal.completed ? 'var(--accent-emerald)' : 'transparent',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: goal.completed ? 'scale(1.1)' : 'scale(1)',
                  flexShrink: 0
                }}
              >
                {goal.completed && <Check size={14} color="#000" strokeWidth={4} />}
              </div>
              <span style={{ 
                color: goal.completed ? 'var(--text-muted)' : '#ffffff', 
                textDecoration: goal.completed ? 'line-through' : 'none',
                fontSize: '15px',
                flex: 1,
                wordBreak: 'break-word'
              }}>
                {goal.text}
              </span>
            </div>
          ))}
        </div>

        {/* Add Goal Form */}
        <form onSubmit={handleAddGoal} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#ffffff', 
          border: '3px solid #000000', 
          borderRadius: '50px', 
          padding: '6px 6px 6px 20px', 
          boxShadow: '4px 4px 0px #000000',
          position: 'relative'
        }}>
          <input 
            type="text" 
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new task..."
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              color: '#000000', 
              fontSize: '16px',
              outline: 'none',
              fontWeight: 500,
              fontFamily: 'inherit'
            }}
          />
          <button type="submit" style={{ 
            width: '44px', height: '44px', background: '#000', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Plus size={20} strokeWidth={3} />
          </button>
        </form>
      </div>

      {/* Right Column Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Reminders Section */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <TooltipIcon name="BellRing" size={24} className="icon-wiggle" style={{ color: 'var(--accent-emerald)' }} />
          <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Daily Reminders</h3>
        </div>

        {/* Days of week selector feature to fill space */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: '15px', marginBottom: '16px', fontWeight: 600 }}>Active Days</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} style={{ 
                width: '36px', height: '36px', 
                borderRadius: '50%', 
                background: i > 0 && i < 6 ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                color: i > 0 && i < 6 ? '#000' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                boxShadow: i > 0 && i < 6 ? '0 2px 8px rgba(74, 222, 128, 0.4)' : 'none'
              }}>
                {day}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
            Set a daily reminder to log your activities and check your goals. Consistency is key to reducing your footprint.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <label style={{ color: '#ffffff', fontWeight: 600, fontSize: '16px', letterSpacing: '1px' }}>Time:</label>
            <input 
              type="time" 
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              style={{ 
                padding: '12px 20px', 
                borderRadius: '50px', 
                border: '3px solid #000000', 
                backgroundColor: '#ffffff', 
                color: '#000000', 
                fontSize: '18px', 
                fontWeight: 700, 
                outline: 'none',
                fontFamily: "'Times New Roman', Times, serif",
                boxShadow: '4px 4px 0px #000000'
              }}
            />
          </div>

          <button 
            className="skeuo-raised"
            onClick={() => {
              alert('Reminder saved for ' + reminderTime);
            }}
            style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <TooltipIcon name="Check" size={18} /> Save Reminder
          </button>
        </div>
      </div>

      {/* Community Leaderboard Section */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Trophy size={24} className="icon-float" style={{ color: '#fbbf24' }} />
          <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Community Savings</h3>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Compare your monthly CO₂ savings against your neighbors and friends.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockLeaderboard.map((user, index) => (
            <div key={user.id} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              background: user.isUser ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0,0,0,0.3)', 
              border: user.isUser ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(255,255,255,0.05)',
              padding: '16px', borderRadius: '12px',
              boxShadow: user.isUser ? '0 4px 12px rgba(74, 222, 128, 0.1)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span style={{ 
                  fontWeight: 800, fontSize: '18px', width: '24px', textAlign: 'center',
                  color: index === 0 ? '#fbbf24' : index === 1 ? '#cbd5e1' : index === 2 ? '#b45309' : 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} color="#fff" />
                </div>
                <span style={{ color: '#fff', fontWeight: user.isUser ? 700 : 500, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
              </div>
              <span style={{ color: user.isUser ? '#4ade80' : 'var(--accent-emerald)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '8px' }}>
                {user.savings}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Badges & Achievements Section */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Medal size={24} className="icon-pulse" style={{ color: '#a78bfa' }} />
          <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Your Achievements</h3>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Complete goals and reduce your footprint to unlock these badges!</p>

        <div className="responsive-grid-2" style={{ flex: 1 }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(167, 139, 250, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.5)' }}>
              <Star size={24} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Eco Starter</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Completed first goal</div>
            </div>
          </div>

          <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(74, 222, 128, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.5)' }}>
              <Target size={24} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Carbon Cutter</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Saved 50kg CO₂</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', opacity: 0.6 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={24} color="rgba(255,255,255,0.3)" />
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Local Hero</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>Top 3 in Community</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', opacity: 0.6 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={24} color="rgba(255,255,255,0.3)" />
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Streak Master</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>Log 7 days in a row</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
