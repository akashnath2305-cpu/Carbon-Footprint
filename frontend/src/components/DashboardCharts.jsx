import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardCharts({ emissionsOverTime, categoryData }) {
  return (
    <>
      <div className="glass-panel" style={{ padding: '30px', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#ffffff', fontFamily: "'Playfair Display', serif", margin: 0 }}>Emissions Trend</h3>
          {/* Note: The dropdown was left in the parent or recreated here. For simplicity, we just render the chart here. */}
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
        <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>Category Breakdown</h3>
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
