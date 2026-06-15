import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';

const Globe = lazy(() => import('react-globe.gl'));

export default function GlobalMap() {
  const globeEl = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState();

  useEffect(() => {
    // Load country boundaries
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        // Add mock data to each country
        const features = data.features.map(f => {
          // Generate mock stats based on some random logic or country size to look realistic
          const randomSeed = f.properties.POP_EST || Math.random() * 10000000;
          const carbonFootprint = (randomSeed * 0.000001 * Math.random() * 10).toFixed(2);
          const pollutionLevel = Math.floor(Math.random() * 100);
          const afforestation = Math.floor(Math.random() * 100);
          
          return {
            ...f,
            properties: {
              ...f.properties,
              carbonFootprint,
              pollutionLevel,
              afforestation
            }
          };
        });
        setCountries({ ...data, features });
      });
  }, []);

  useEffect(() => {
    // Auto-rotate - since Globe is lazy loaded, we need to wait for the ref
    const interval = setInterval(() => {
      if (globeEl.current && globeEl.current.controls()) {
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.5;
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Color scale for carbon footprint (mock)
  const getPolygonColor = (feat) => {
    if (feat === hoverD) return 'rgba(255, 255, 255, 0.8)';
    const footprint = parseFloat(feat.properties.carbonFootprint || 0);
    if (footprint > 500) return 'rgba(239, 68, 68, 0.7)'; // Red
    if (footprint > 100) return 'rgba(245, 158, 11, 0.7)'; // Orange
    if (footprint > 20) return 'rgba(250, 204, 21, 0.7)'; // Yellow
    return 'rgba(34, 197, 94, 0.7)'; // Green
  };

  return (
    <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', height: '70vh', minHeight: '600px', maxHeight: '750px', padding: 0 }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: 'none', padding: '24px' }}>
        <h3 style={{ fontSize: '22px', color: '#ffffff', margin: 0, fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Global Impact Explorer</h3>
      </div>
      
      {/* Legend */}
      <div style={{ position: 'absolute', top: '70px', right: '24px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '14px' }}>Carbon Footprint</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: '2px' }}></div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>High (&gt;500M t)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(245, 158, 11, 0.7)', borderRadius: '2px' }}></div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>Medium (100M-500M t)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(250, 204, 21, 0.7)', borderRadius: '2px' }}></div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>Low (20M-100M t)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(34, 197, 94, 0.7)', borderRadius: '2px' }}></div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>Minimal (&lt;20M t)</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Suspense fallback={<div style={{ color: '#fff', padding: '24px' }}>Loading 3D Globe...</div>}>
          <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            polygonsData={countries.features}
            polygonAltitude={d => d === hoverD ? 0.06 : 0.01}
            polygonCapColor={getPolygonColor}
            polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
            polygonStrokeColor={() => '#111'}
            onPolygonHover={setHoverD}
            polygonLabel={({ properties: d }) => `
              <div style="background: rgba(15, 23, 42, 0.9); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-family: sans-serif;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">${d.ADMIN} (${d.ISO_A2})</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #94a3b8; margin-right: 12px;">Carbon Footprint:</span>
                  <span style="font-weight: bold; color: #f87171;">${d.carbonFootprint}M tons</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #94a3b8; margin-right: 12px;">Pollution Index:</span>
                  <span style="font-weight: bold; color: #fbbf24;">${d.pollutionLevel}/100</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #94a3b8; margin-right: 12px;">Afforestation:</span>
                  <span style="font-weight: bold; color: #4ade80;">${d.afforestation}% cover</span>
                </div>
              </div>
            `}
          />
        </Suspense>
      </div>
    </div>
  );
}
