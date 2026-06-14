import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TooltipIcon from './TooltipIcon';
import CalculatorResult from './CalculatorResult';

export default function HistoryTab() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '100px', fontSize: '24px' }}>😏 Loading your analysis...</div>;
  }

  // Find the most recent log that has a session_id and details
  const latestAudit = history.find(log => log.session_id && log.details && log.details.result);

  if (!latestAudit) {
    return (
      <div className="glass-panel animate-slide-up" style={{ padding: '40px', marginTop: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <TooltipIcon name="History" size={28} style={{ color: 'var(--accent-emerald)' }} />
          <h2 style={{ fontSize: '28px', color: '#ffffff', fontWeight: 700, fontFamily: "'Playfair Display', serif", margin: 0 }}>
            Recent Analysis
          </h2>
        </div>

        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px', 
          color: 'var(--text-muted)',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <TooltipIcon name="FileText" size={64} style={{ opacity: 0.3, marginBottom: '24px', color: '#fff' }} />
          <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px', fontWeight: 600 }}>No recent analysis found</h3>
          <p style={{ fontSize: '16px' }}>Run a new dynamic audit to see your full analysis and AI suggestions here!</p>
        </div>
      </div>
    );
  }

  // Pass the result data directly to the CalculatorResult component
  return (
    <div className="animate-fade-in" style={{ paddingTop: '80px' }}>
      <CalculatorResult result={latestAudit.details.result} onFinish={() => {}} />
    </div>
  );
}
