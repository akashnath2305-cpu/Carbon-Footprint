import React, { useRef, useCallback, useState } from 'react';
import TooltipIcon from './TooltipIcon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CommunityTab({ tips, fetchMore, hasMore, isLoading }) {
  const { token, addPendingPoints } = useAuth();
  const toast = useToast();
  const campaigns = [
    { title: 'Local River Cleanup', date: 'This Saturday, 9 AM', participants: 42, points: 500 },
    { title: 'Tree Plantation Drive', date: 'Next Sunday, 8 AM', participants: 128, points: 1000 },
    { title: 'Zero Waste Workshop', date: 'June 25th, 6 PM', participants: 15, points: 200 }
  ];

  const [joinedCampaigns, setJoinedCampaigns] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const handleJoinCampaign = async (idx, points) => {
    if (joinedCampaigns[idx]) {
      toast.info('You are already registered for this campaign.');
      return;
    }

    try {
      const response = await fetch('/api/campaigns/join', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points })
      });

      if (response.ok) {
        setJoinedCampaigns(prev => ({ ...prev, [idx]: true }));
        addPendingPoints(points);
        toast.info('You joined a campaign successfully and awaiting approval');
      } else {
        toast.error('Failed to join campaign. Please try again later.');
      }
    } catch (err) {
      console.error('Error joining campaign:', err);
      toast.error('Network error. Failed to connect to server.');
    }
  };

  // Infinite Scroll Observer Setup
  const observer = useRef();
  const lastTipElementRef = useCallback((node) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchMore]);

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      
      {/* Community Campaigns Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <TooltipIcon name="Users" tooltipText="Community Events" size={28} style={{ color: 'var(--accent-emerald)' }} />
        <h2 style={{ fontSize: '24px', color: 'var(--text-dark)' }}>Community Campaigns</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {campaigns.map((camp, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '24px', backgroundColor: 'transparent', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', marginBottom: '8px' }}>{camp.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>{camp.date}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>{camp.participants}</strong> joined
              </span>
              <span style={{ fontSize: '13px', color: 'var(--accent-emerald)', fontWeight: 600 }}>+{camp.points} Pts</span>
            </div>
            
            
            <button 
              className="skeuo-button" 
              style={{ width: '100%', padding: '10px', opacity: joinedCampaigns[idx] ? 0.8 : 1, cursor: 'pointer' }}
              onClick={() => handleJoinCampaign(idx, camp.points)}
              disabled={joinedCampaigns[idx]}
            >
              {joinedCampaigns[idx] ? 'Awaiting Approval' : 'Join Campaign'}
            </button>
          </div>
        ))}
      </div>

      {/* Global Action Feed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <TooltipIcon name="Globe2" tooltipText="Community conservation stream" size={28} style={{ color: 'var(--accent-emerald)' }} />
        <h2 style={{ fontSize: '24px', color: 'var(--text-dark)' }}>Global Action Feed</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tips.map((tip, index) => {
          const isLastElement = tips.length === index + 1;
          return (
            <div 
              key={tip.id} 
              ref={isLastElement ? lastTipElementRef : null}
              className="skeuo-raised" 
              style={{ 
                borderRadius: '16px', 
                padding: '20px',
                backgroundColor: 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {tip.category}
                </span>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontWeight: 600,
                    background: tip.impact_level === 'High' ? '#fee2e2' : tip.impact_level === 'Medium' ? '#fef3c7' : '#d1fae5',
                    color: tip.impact_level === 'High' ? '#991b1b' : tip.impact_level === 'Medium' ? '#92400e' : '#065f46'
                  }}
                >
                  {tip.impact_level} Impact
                </span>
              </div>
              <h4 style={{ fontSize: '16px', color: 'var(--text-dark)', marginBottom: '8px' }}>{tip.title}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{tip.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Difficulty: <strong style={{ color: 'var(--text-dark)' }}>{tip.difficulty}</strong></span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  -{tip.potential_savings} Kgs CO₂/mo
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--accent-emerald)' }}>
            😏 Loading more actions...
          </div>
        )}
      </div>

    </div>
  );
}
