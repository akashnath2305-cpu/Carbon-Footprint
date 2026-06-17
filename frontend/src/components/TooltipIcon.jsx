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
  Newspaper
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
  Newspaper
};

export default function TooltipIcon({ name, tooltipText, size = 20, className = '', style = {} }) {
  const IconComponent = iconsMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react mapping.`);
    return null;
  }

  return (
    <div className={`tooltip-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: style.color || 'inherit', position: 'relative', ...style }}>
      <IconComponent size={size} />
      {tooltipText && <span className="tooltip-box">{tooltipText}</span>}
    </div>
  );
}
