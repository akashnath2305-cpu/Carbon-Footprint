import React, { useState } from 'react';
import { ArrowRight, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import TooltipIcon from './TooltipIcon';
import { useAuth } from '../context/AuthContext';

export default function LoginView({ onLogin, initialIsSignUp = false }) {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const bodyData = isSignUp ? { username, email, password } : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unable to connect to the authentication server. Please check if the backend is running.');
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Success
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        if (isSignUp) {
          setIsSignUp(false);
          setPassword('');
          setErrorMsg('');
        } else {
          login(data.user, data.token);
          if (onLogin) onLogin();
        }
      }, 1500);
      
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      position: 'relative'
    }}>
      <div className="glass-panel animate-slide-up" style={{ 
        maxWidth: '450px', 
        width: '100%', 
        padding: '48px 40px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Decorative Green Accent */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '4px',
          background: 'var(--accent-emerald)'
        }} />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--accent-emerald)' }}>
          <TooltipIcon name="Leaf" size={48} className="pulse-glow" />
        </div>

        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {isSignUp ? 'Join the Movement' : 'Welcome Back'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          {isSignUp ? 'Create an account to start tracking your footprint.' : 'Log in to continue your sustainability journey.'}
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {isSignUp && (
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="skeuo-input" 
                style={{ width: '100%', fontSize: '15px' }} 
                placeholder="you@example.com"
              />
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              {isSignUp ? 'Username' : 'Username / Email'}
            </label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="skeuo-input" 
              style={{ width: '100%', fontSize: '15px' }} 
              placeholder={isSignUp ? "eco_warrior" : "eco_warrior or you@example.com"}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="skeuo-input" 
                style={{ width: '100%', fontSize: '15px', paddingRight: '40px' }} 
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="skeuo-button" 
            style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '12px' }}
          >
            {isSignUp ? <><UserPlus size={18} style={{ marginRight: '8px' }} /> Sign Up</> : <><LogIn size={18} style={{ marginRight: '8px' }} /> Log In</>}
          </button>
        </form>

        <div style={{ marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            style={{ 
              background: 'none', border: 'none', 
              color: 'var(--accent-emerald)', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>

      {/* Success Toast Notification */}
      {showSuccess && (
        <div className="animate-slide-up" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#ffffff',
          color: '#000000',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          fontWeight: 600
        }}>
          <TooltipIcon name="CheckCircle" size={20} style={{ color: 'var(--accent-emerald)' }} />
          {isSignUp ? 'Successfully Registered' : 'Successfully Logged In'}
        </div>
      )}
    </div>
  );
}
