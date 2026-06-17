import React from 'react';
import {
  Lightbulb,
  Check,
  Target,
  LayoutDashboard,
  Footprints,
  Home,
  User,
  ArrowRight,
  Leaf,
  Carrot,
  Beef,
  ArrowLeft,
  Train,
  Bus,
  Car,
  Flame,
  Box,
  Boxes,
  Fuel,
  Zap,
  Plane,
  Users,
  Globe2,
  BarChart2,
  History,
  Gamepad2,
  Gift,
  Edit2,
  LogOut,
  Trophy,
  Recycle,
  Sprout,
  Trash2,
  BellRing,
  FileText,
  TreePine,
  Newspaper,
  Info,
  CheckCircle
} from 'lucide-react';

const iconsMap = {
  Lightbulb,
  Check,
  Target,
  LayoutDashboard,
  Footprints,
  Home,
  User,
  ArrowRight,
  Leaf,
  Carrot,
  Beef,
  ArrowLeft,
  Train,
  Bus,
  Car,
  Flame,
  Box,
  Boxes,
  Fuel,
  Zap,
  Plane,
  Users,
  Globe2,
  BarChart2,
  History,
  Gamepad2,
  Gift,
  Edit2,
  LogOut,
  Trophy,
  Recycle,
  Sprout,
  Trash2,
  BellRing,
  FileText,
  TreePine,
  Newspaper,
  Info,
  CheckCircle
};

export default function TooltipIcon({ name, tooltipText, size = 20, className = '', style = {} }) {
  const IconComponent = iconsMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react mapping.`);
    return null;
  }

  return (
    <div 
      className={`tooltip-wrapper ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: style.color || 'inherit', position: 'relative', ...style }}
      aria-label={tooltipText || name}
      role={tooltipText ? "tooltip" : "img"}
      tabIndex={tooltipText ? 0 : undefined}
    >
      <IconComponent size={size} aria-hidden="true" />
      {tooltipText && <span className="tooltip-box" aria-hidden="true">{tooltipText}</span>}
    </div>
  );
}
