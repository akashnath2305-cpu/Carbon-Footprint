import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Coffee, Tag, Gift, TreePine, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function ScratchCode({ code }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fullyRevealed, setFullyRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fill with silver scratch-off color
    ctx.fillStyle = '#94a3b8'; // Lighter slate
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add diagonal stripes for scratch ticket look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 8;
    for (let i = -100; i < canvas.width + 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, canvas.height);
      ctx.stroke();
    }

    // Add 'SCRATCH ME' text with bolder font
    ctx.fillStyle = '#000000'; 
    ctx.font = '900 15px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 2;
    ctx.fillText('SCRATCH ME', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
  }, []);

  const checkPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || fullyRevealed) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    const percent = transparent / (pixels.length / 4);
    if (percent > 0.45) { // 45% scratched
      setFullyRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const scratch = (e) => {
    if (!isDrawing || fullyRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, 2 * Math.PI);
    ctx.fill();
  };

  return (
    <div className={fullyRevealed ? "bounce-animation" : ""} style={{ position: 'relative', display: 'inline-block', width: '150px', height: '36px', borderRadius: '8px', overflow: 'hidden', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', color: '#0f172a', fontWeight: 900, letterSpacing: '2px', fontSize: '15px', boxShadow: fullyRevealed ? '0 0 15px rgba(74, 222, 128, 0.8)' : '0 2px 8px rgba(255,255,255,0.2)', border: fullyRevealed ? '2px solid var(--accent-emerald)' : 'none', transition: 'all 0.3s ease' }}>
      {/* The actual secret code */}
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {code}
      </span>
      
      {/* The scratchable overlay canvas */}
      {!fullyRevealed && (
        <canvas
          ref={canvasRef}
          width={150}
          height={36}
          style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={(e) => { setIsDrawing(true); scratch(e); }}
          onMouseUp={() => { setIsDrawing(false); checkPercentage(); }}
          onMouseMove={scratch}
          onMouseLeave={() => { setIsDrawing(false); checkPercentage(); }}
          onTouchStart={(e) => { setIsDrawing(true); scratch(e); }}
          onTouchEnd={() => { setIsDrawing(false); checkPercentage(); }}
          onTouchMove={(e) => { e.preventDefault(); scratch(e); }}
        />
      )}
    </div>
  );
}

export default function RewardsTab() {
  const { currentUser, token, updateUserPoints } = useAuth();
  const toast = useToast();

  // Real Points State
  const totalPoints = currentUser ? currentUser.total_points || 0 : 0;
  const usedPoints = currentUser ? currentUser.used_points || 0 : 0;
  const availablePoints = totalPoints - usedPoints;

  // Infinite Scroll State for Vouchers
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);
  
  // Brands mock data
  const brands = [
    { name: 'EcoMart', icon: <ShoppingBag size={24} />, color: '#10b981' },
    { name: 'GreenBeans Coffee', icon: <Coffee size={24} />, color: '#d97706' },
    { name: 'SustainStyle', icon: <Tag size={24} />, color: '#6366f1' },
    { name: 'NatureGear', icon: <TreePine size={24} />, color: '#059669' },
    { name: 'EarthTreasures', icon: <Gift size={24} />, color: '#ec4899' },
  ];

  // Voucher mock generator
  const generateVouchers = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      const discountOptions = [
        { d: 10, p: 5000 },
        { d: 15, p: 10000 },
        { d: 20, p: 20000 },
        { d: 25, p: 30000 },
        { d: 50, p: 50000 }
      ];
      const selected = discountOptions[Math.floor(Math.random() * discountOptions.length)];

      return {
        id: Math.random().toString(36).substr(2, 9),
        brand: brand.name,
        icon: brand.icon,
        color: brand.color,
        title: `${selected.d}% Discount On Next Purchase`,
        points: selected.p,
        code: `ECO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        redeemed: false
      };
    });
  };

  useEffect(() => {
    // Initial load
    setVouchers(generateVouchers(8));
  }, []);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setVouchers(prev => [...prev, ...generateVouchers(8)]);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loading]);

  const handleRedeem = async (id, points) => {
    if (availablePoints >= points) {
      try {
        const response = await fetch('http://localhost:5000/api/rewards/use', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ points })
        });
        if (response.ok) {
          updateUserPoints(points);
          setVouchers(prev => prev.map(v => v.id === id ? { ...v, redeemed: true } : v));
          toast.success(`Successful redemption of points: ${points}`);
        } else {
          const errorData = await response.json();
          toast.error(`Failed to redeem: ${errorData.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Redeem error:', err);
        toast.error('Failed to connect to the server.');
      }
    } else {
      toast.error("Not enough points to redeem this voucher!");
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Points Summary Header */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div>
          <h2 style={{ fontSize: '28px', color: '#fff', fontFamily: "'Playfair Display', serif", margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Coins color="var(--accent-emerald)" size={32} /> Your Rewards Balance
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Earn points by logging activities and joining eco-campaigns.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', textAlign: 'center', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Collected</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{totalPoints}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Used</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{usedPoints}</div>
          </div>
          <div style={{ paddingLeft: '32px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '1px', fontWeight: 'bold' }}>Available Balance</div>
            <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1 }}>{availablePoints}</div>
          </div>
        </div>
      </div>

      {/* Vouchers Grid */}
      <div>
        <h3 style={{ fontSize: '22px', color: '#fff', fontFamily: "'Playfair Display', serif", margin: '0 0 24px 0' }}>Available Vouchers</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {vouchers.map(voucher => (
            <div key={voucher.id} className={`glass-panel ${!voucher.redeemed ? 'golden-pulse' : ''}`} style={{ 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.7)',
              opacity: voucher.redeemed ? 0.8 : 1,
              transform: voucher.redeemed ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(251, 191, 36, 0.4)'
            }}>
              {/* Brand Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: voucher.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 4px 12px ${voucher.color}40` }}>
                  {voucher.icon}
                </div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '16px' }}>{voucher.brand}</div>
              </div>
              
              {/* Voucher Detail */}
              <h4 style={{ fontSize: '20px', color: '#fff', margin: '0 0 16px 0', lineHeight: 1.3 }}>{voucher.title}</h4>
              
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>
                  <Coins size={18} /> {voucher.points}
                </div>
                
                {voucher.redeemed ? (
                  <ScratchCode code={voucher.code} />
                ) : (
                  <button 
                    onClick={() => handleRedeem(voucher.id, voucher.points)}
                    disabled={availablePoints < voucher.points}
                    style={{ 
                      background: availablePoints >= voucher.points ? '#ffffff' : 'rgba(255,255,255,0.1)', 
                      color: availablePoints >= voucher.points ? '#000000' : 'rgba(255,255,255,0.3)', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      fontWeight: 700, 
                      cursor: availablePoints >= voucher.points ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: availablePoints >= voucher.points ? '0 2px 8px rgba(255,255,255,0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => { if(availablePoints >= voucher.points) e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={(e) => { if(availablePoints >= voucher.points) e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <Gift size={16} /> Redeem
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading trigger for infinite scroll */}
        <div ref={observerTarget} style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          {loading ? '😏 Finding more rewards...' : 'Scroll for more vouchers'}
        </div>
      </div>
    </div>
  );
}
