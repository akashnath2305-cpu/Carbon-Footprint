import React from 'react';
import * as Lucide from 'lucide-react';

export default function TooltipIcon({ name, tooltipText, size = 20, className = '', style = {} }) {
  const IconComponent = Lucide[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react.`);
    return null;
  }

  return (
    <div className={`tooltip-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: style.color || 'inherit', position: 'relative', ...style }}>
      <IconComponent size={size} />
      {tooltipText && <span className="tooltip-box">{tooltipText}</span>}
    </div>
  );
}
