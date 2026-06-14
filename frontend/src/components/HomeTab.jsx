import React from 'react';
import { PlusCircle } from 'lucide-react';
import TooltipIcon from './TooltipIcon';

export default function HomeTab() {
  const newsItems = [
    { id: 1, title: 'Global Carbon Emissions Hit New Record in 2025', source: 'Climate Daily', time: '2 hours ago' },
    { id: 2, title: 'New Solar Technologies Promise 40% Efficiency', source: 'Eco Tech', time: '5 hours ago' },
    { id: 3, title: 'Ocean Cleanup Project Reaches Milestone', source: 'Ocean Watch', time: '1 day ago' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
      
      {/* Global Metrics Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <TooltipIcon name="TreePine" size={40} style={{ color: 'var(--accent-emerald)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Afforestation Average</h3>
          <p style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>+12.5%</p>
          <p style={{ fontSize: '14px', color: 'var(--accent-emerald)' }}>Increase since last decade</p>
        </div>

        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <TooltipIcon name="Globe2" size={40} style={{ color: '#60a5fa', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Steps Taken</h3>
          <p style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>4.2B</p>
          <p style={{ fontSize: '14px', color: '#60a5fa' }}>Metric tons of CO2 offset this year</p>
        </div>
      </div>

      {/* Environmental News Column */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <TooltipIcon name="Newspaper" size={24} style={{ color: 'var(--accent-emerald)' }} />
          <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Environment News</h3>
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
              <h4 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '8px', lineHeight: 1.4 }}>{news.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                <span>{news.source}</span>
                <span>{news.time}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="skeuo-button" style={{ width: '100%', marginTop: '24px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> Log New Activity
        </button>
      </div>

    </div>
  );
}
