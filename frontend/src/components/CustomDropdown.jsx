import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{ 
          background: 'rgba(255,255,255,0.1)', 
          color: '#fff', 
          border: '1px solid rgba(255,255,255,0.2)', 
          borderRadius: '8px', 
          padding: '6px 12px',
          fontSize: '14px',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        }}
      >
        {options.find(o => o.value === value)?.label || value}
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <div className="animate-slide-up" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '4px',
          minWidth: '130px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                color: value === opt.value ? '#4ade80' : '#fff',
                background: value === opt.value ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                fontSize: '14px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
