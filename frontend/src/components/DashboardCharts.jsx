import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChevronDown } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function DashboardCharts({ emissionsOverTime, categoryData, trendFilter, setTrendFilter, categoryFilter, setCategoryFilter }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const options = [
    { value: 'Today', label: 'Today' },
    { value: 'Week', label: 'This Week' },
    { value: 'Month', label: 'This Month' },
    { value: 'Year', label: 'This Year' }
  ];

  return (
    <>
      <div className="glass-panel" style={{ padding: '30px', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#ffffff', fontFamily: "'Playfair Display', serif", margin: 0 }}>Emissions Trend</h3>
          {setTrendFilter && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
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
                  gap: '8px'
                }}
              >
                {options.find(o => o.value === trendFilter)?.label || trendFilter}
                <ChevronDown size={14} />
              </button>
              
              {isDropdownOpen && (
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
                        setTrendFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: trendFilter === opt.value ? '#4ade80' : '#fff',
                        background: trendFilter === opt.value ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                        fontSize: '14px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (trendFilter !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        if (trendFilter !== opt.value) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emissionsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#4ade80', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="emissions" stroke="#4ade80" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', stroke: '#4ade80', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#ffffff', fontFamily: "'Playfair Display', serif", margin: 0 }}>Category Breakdown</h3>
          {setCategoryFilter && (
            <CustomDropdown 
              value={categoryFilter} 
              onChange={setCategoryFilter} 
              options={options}
            />
          )}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600}} width={70} />
              <RechartsTooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="emissions" radius={[0, 4, 4, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
