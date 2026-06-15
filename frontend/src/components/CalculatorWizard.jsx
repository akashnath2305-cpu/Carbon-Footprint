import React, { useState } from 'react';
import TooltipIcon from './TooltipIcon';
import CalculatorResult from './CalculatorResult';
import { useAuth } from '../context/AuthContext';

export default function CalculatorWizard({ onSubmit, onCancel }) {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // State for the visual inputs
  const [householdSize, setHouseholdSize] = useState(2);
  const [food, setFood] = useState({ diet: 'meat' });
  const [publicTravel, setPublicTravel] = useState({ bus: '', ebus: '', cab: '', ecab: '', train: '' });
  const [homeFuel, setHomeFuel] = useState({ lng: '', coal: '', coke: '' });
  const [vehicleFuel, setVehicleFuel] = useState({ petrol: '', diesel: '', cng: '' });
  const [electricity, setElectricity] = useState({ kwh: '' });
  const [flights, setFlights] = useState({ short: '', long: '' });

  const [resultData, setResultData] = useState(null);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setIsAnimating(false);
    }, 1200); 
  };

  const handleSubmitFinal = async () => {
    setIsAnimating(true);
    
    const rawInputs = {
      householdSize,
      food,
      publicTravel,
      homeFuel,
      vehicleFuel,
      electricity,
      flights
    };

    try {
      const res = await fetch('/api/calculate-footprint', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rawInputs)
      });
      
      if (res.ok) {
        onSubmit();
      } else {
        throw new Error('Failed to calculate footprint dynamically');
      }
    } catch (err) {
      console.error('API error:', err);
      // Fallback if backend server isn't restarted or failing
      setResultData({
        totalEstimatedCO2: 1850,
        breakdown: [
          { name: 'Transport', emissions: 600, fill: '#60a5fa' },
          { name: 'Energy', emissions: 700, fill: '#fbbf24' },
          { name: 'Food', emissions: 400, fill: '#f87171' },
          { name: 'Waste', emissions: 150, fill: '#a78bfa' }
        ],
        comparison: { globalAverage: 4700, indianAverage: 1900 },
        suggestions: [
          { title: 'Transition to a Flexitarian Diet', text: 'Substituting meat with traditional protein alternatives like lentils, chickpeas, or paneer just 3 days a week can reduce your food emissions by nearly 20-30%.', impact: 'High', difficulty: 'Medium' },
          { title: 'Opt for Trains over Flights', text: 'Whenever feasible, opt for the electrified railway network for domestic travel. Trains emit up to 80% less CO2 per kilometer than short-haul flights.', impact: 'High', difficulty: 'Medium' },
          { title: 'Compost Organic Waste at Home', text: 'Segregating your kitchen wet waste and composting it at home prevents organic matter from ending up in local landfills, where it generates harmful methane gas.', impact: 'Medium', difficulty: 'Easy' }
        ]
      });
      onSubmit();
    } finally {
      setIsAnimating(false);
    }
  };

  if (isAnimating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="footprint-container" style={{ marginBottom: '40px' }}>
          <TooltipIcon name="Footprints" size={40} className="footprint-step" />
          <TooltipIcon name="Footprints" size={40} className="footprint-step" />
          <TooltipIcon name="Footprints" size={40} className="footprint-step" />
          <TooltipIcon name="Footprints" size={40} className="footprint-step" />
          <TooltipIcon name="Footprints" size={40} className="footprint-step" />
        </div>
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '16px', fontWeight: 400, fontFamily: "'Times New Roman', Times, serif" }}>Calculating Your Footprint...</h4>
        <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, margin: 0, textAlign: 'center', fontFamily: "'Times New Roman', Times, serif" }}>
          Good things come to those who <span style={{ color: 'var(--accent-emerald)' }}>wait.</span> 😏
        </h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* Progress Indicator at extreme top (hide on step 8) */}
      {step < 8 && (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4, 5, 6, 7].map(s => (
            <div key={s} style={{ 
              flex: 1, 
              height: '6px', 
              margin: '0 5px', 
              background: step >= s ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              boxShadow: step >= s ? '0 0 10px rgba(74, 222, 128, 0.5)' : 'none',
              transition: 'all 0.4s ease'
            }} />
          ))}
          </div>
        </div>
      )}

      {/* Centered Question Window */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
          
          {step < 8 && onCancel && (
            <button 
              onClick={onCancel}
              style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '20px', 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: '48px', 
                height: '48px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                zIndex: 20,
                backdropFilter: 'blur(10px)'
              }}
              title="Return to Home Screen"
            >
              <TooltipIcon name="Home" size={22} />
            </button>
          )}

          <div className="glass-panel animate-fade-in wizard-main-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* STEP 1: HOUSEHOLD */}
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="wizard-title-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div className="wizard-title-left" style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>HOW MANY<br/>PEOPLE LIVE<br/>IN YOUR</div>
              <h2 className="wizard-title-right" style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Household?</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>Some details will be asked at a household level, for example, total electricity consumption per year.</p>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', marginBottom: '60px' }}>To arrive at your specific share of household level consumption, please provide the number of people in your household.</p>
            
            <div className="wizard-counter-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
              <button 
                onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--text-dark)', background: 'transparent', color: 'var(--text-dark)', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >-</button>
              
              <div style={{ position: 'relative', width: '300px', height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '200px', height: '140px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '100px', zIndex: 1, bottom: '20px' }}></div>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '-10px', alignItems: 'flex-end' }}>
                    {Array.from({ length: Math.min(householdSize, 5) }).map((_, i) => (
                      <div key={i} style={{ color: 'var(--text-muted)', paddingBottom: '0px' }}>
                        <TooltipIcon name="User" size={56} />
                      </div>
                    ))}
                    {householdSize > 5 && <div style={{ color: 'var(--text-muted)', paddingBottom: '15px', fontWeight: 'bold', fontSize: '20px', marginLeft: '10px' }}>+{householdSize - 5}</div>}
                  </div>
                  <div style={{ color: 'var(--accent-emerald)' }}>
                    <TooltipIcon name="Home" size={100} />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setHouseholdSize(householdSize + 1)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--text-dark)', background: 'transparent', color: 'var(--text-dark)', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >+</button>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
              <button className="skeuo-button" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleNext}>
                NEXT <TooltipIcon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FOOD */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>Carbon<br/>Emissions<br/>From</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Meals</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '16px', textAlign: 'center', marginBottom: '60px' }}>Please select your meal preference for the year.</p>
            
            <div className="visual-card-grid">
              <div className={`visual-card ${food.diet === 'vegan' ? 'selected' : ''}`} onClick={() => setFood({ diet: 'vegan' })} style={{ cursor: 'pointer' }}>
                <div className="co2-cloud"><strong>2,019</strong><br/><span style={{ fontSize: '10px', fontStyle: 'italic' }}>kg of CO₂ per person<br/>per annum</span></div>
                <div className="visual-card-icon" style={{ background: '#dcfce7', color: '#166534' }}><TooltipIcon name="Leaf" size={56} /></div>
                <div className="visual-card-title">VEGAN</div>
                <input type="radio" className="visual-radio" checked={food.diet === 'vegan'} readOnly />
              </div>

              <div className={`visual-card ${food.diet === 'vegetarian' ? 'selected' : ''}`} onClick={() => setFood({ diet: 'vegetarian' })} style={{ cursor: 'pointer' }}>
                <div className="co2-cloud"><strong>2,176</strong><br/><span style={{ fontSize: '10px', fontStyle: 'italic' }}>kg of CO₂ per person<br/>per annum</span></div>
                <div className="visual-card-icon" style={{ background: '#fef08a', color: '#854d0e' }}><TooltipIcon name="Carrot" size={56} /></div>
                <div className="visual-card-title">VEGETARIAN</div>
                <input type="radio" className="visual-radio" checked={food.diet === 'vegetarian'} readOnly />
              </div>

              <div className={`visual-card ${food.diet === 'meat' ? 'selected' : ''}`} onClick={() => setFood({ diet: 'meat' })} style={{ cursor: 'pointer' }}>
                <div className="co2-cloud"><strong>3,781</strong><br/><span style={{ fontSize: '10px', fontStyle: 'italic' }}>kg of CO₂ per person<br/>per annum</span></div>
                <div className="visual-card-icon" style={{ background: '#fecaca', color: '#991b1b' }}><TooltipIcon name="Beef" size={56} /></div>
                <div className="visual-card-title">MEAT EATER</div>
                <input type="radio" className="visual-radio" checked={food.diet === 'meat'} readOnly />
              </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Previous Step"
              >
                <TooltipIcon name="ArrowLeft" size={24} />
              </button>
              <button className="skeuo-button" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleNext}>
                NEXT <TooltipIcon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRAVEL */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>Carbon<br/>Emissions<br/>From</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Travel</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '16px', textAlign: 'center', marginBottom: '60px' }}>Please provide approximate kms travelled by you in a year using the following modes.</p>
            
            <div className="visual-card-grid">
              <div className="visual-card">
                <div className="co2-cloud"><strong>0.041 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per km</span></div>
                <div className="visual-card-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}><TooltipIcon name="Train" size={56} /></div>
                <div className="visual-card-title">Travel by Train</div>
                <div className="visual-card-subtitle">(in km)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={publicTravel.train} onChange={e => setPublicTravel({...publicTravel, train: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>0.054 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per km</span></div>
                <div className="visual-card-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}><TooltipIcon name="Bus" size={56} /></div>
                <div className="visual-card-title">Bus Travel</div>
                <div className="visual-card-subtitle">(in km)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={publicTravel.bus} onChange={e => setPublicTravel({...publicTravel, bus: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>0.03782 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per km</span></div>
                <div className="visual-card-icon" style={{ background: '#f0fdf4', color: '#15803d' }}><TooltipIcon name="Bus" size={56} /></div>
                <div className="visual-card-title">Electric Bus Travel</div>
                <div className="visual-card-subtitle">(in km)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={publicTravel.ebus} onChange={e => setPublicTravel({...publicTravel, ebus: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>0.1431 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per km</span></div>
                <div className="visual-card-icon" style={{ background: '#fffbeb', color: '#b45309' }}><TooltipIcon name="Car" size={56} /></div>
                <div className="visual-card-title">Cab/Taxi Travel</div>
                <div className="visual-card-subtitle">(in km)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={publicTravel.cab} onChange={e => setPublicTravel({...publicTravel, cab: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>0.1035 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per km</span></div>
                <div className="visual-card-icon" style={{ background: '#dcfce7', color: '#166534' }}><TooltipIcon name="Car" size={56} /></div>
                <div className="visual-card-title">Electric Cab/Taxi</div>
                <div className="visual-card-subtitle">(in km)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={publicTravel.ecab} onChange={e => setPublicTravel({...publicTravel, ecab: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setStep(2)}
                style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Previous Step"
              >
                <TooltipIcon name="ArrowLeft" size={24} />
              </button>
              <button className="skeuo-button" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleNext}>
                NEXT <TooltipIcon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: HOME FUEL */}
        {step === 4 && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>Carbon<br/>Emissions<br/>From</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Home Fuel</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '16px', textAlign: 'center', marginBottom: '60px' }}>Please share total fuel use for cooking and heating by your household for the year.</p>
            
            <div className="visual-card-grid">
              <div className="visual-card">
                <div className="co2-cloud"><strong>2.07 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per kg of fuel</span></div>
                <div className="visual-card-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}><TooltipIcon name="Flame" size={56} /></div>
                <div className="visual-card-title">LNG/CNG Consumption</div>
                <div className="visual-card-subtitle">(in kg)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={homeFuel.lng} onChange={e => setHomeFuel({...homeFuel, lng: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>2.5 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per kg of fuel</span></div>
                <div className="visual-card-icon" style={{ background: '#f1f5f9', color: '#334155' }}><TooltipIcon name="Box" size={56} /></div>
                <div className="visual-card-title">Coal Consumption</div>
                <div className="visual-card-subtitle">(in kg)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={homeFuel.coal} onChange={e => setHomeFuel({...homeFuel, coal: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>2.8 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per kg of fuel</span></div>
                <div className="visual-card-icon" style={{ background: '#e2e8f0', color: '#475569' }}><TooltipIcon name="Boxes" size={56} /></div>
                <div className="visual-card-title">Coke Consumption</div>
                <div className="visual-card-subtitle">(in kg)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={homeFuel.coke} onChange={e => setHomeFuel({...homeFuel, coke: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setStep(3)}
                style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Previous Step"
              >
                <TooltipIcon name="ArrowLeft" size={24} />
              </button>
              <button className="skeuo-button" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleNext}>
                NEXT <TooltipIcon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VEHICLE FUEL */}
        {step === 5 && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>Carbon<br/>Emissions<br/>From</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Vehicle Fuel</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '16px', textAlign: 'center', marginBottom: '60px' }}>Please provide approximate liters of fuel used by you in a year.</p>
            
            <div className="visual-card-grid">
              <div className="visual-card">
                <div className="co2-cloud"><strong>2.34 ltr.</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per unit of fuel</span></div>
                <div className="visual-card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><TooltipIcon name="Fuel" size={56} /></div>
                <div className="visual-card-title">Petrol Consumption</div>
                <div className="visual-card-subtitle">(in liters)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={vehicleFuel.petrol} onChange={e => setVehicleFuel({...vehicleFuel, petrol: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>2.71 ltr.</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per unit of fuel</span></div>
                <div className="visual-card-icon" style={{ background: '#fefce8', color: '#eab308' }}><TooltipIcon name="Fuel" size={56} /></div>
                <div className="visual-card-title">Diesel Consumption</div>
                <div className="visual-card-subtitle">(in liters)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={vehicleFuel.diesel} onChange={e => setVehicleFuel({...vehicleFuel, diesel: e.target.value})} />
              </div>

              <div className="visual-card">
                <div className="co2-cloud"><strong>2.07 ltr.</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per unit of fuel</span></div>
                <div className="visual-card-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}><TooltipIcon name="Fuel" size={56} /></div>
                <div className="visual-card-title">LPG/CNG Consumption</div>
                <div className="visual-card-subtitle">(in liters)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={vehicleFuel.cng} onChange={e => setVehicleFuel({...vehicleFuel, cng: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setStep(4)}
                style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Previous Step"
              >
                <TooltipIcon name="ArrowLeft" size={24} />
              </button>
              <button className="skeuo-button" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleNext}>
                NEXT <TooltipIcon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: ELECTRICITY */}
        {step === 6 && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>Carbon<br/>Emissions<br/>From</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Electricity</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '16px', textAlign: 'center', marginBottom: '60px' }}>Please provide your household's average monthly electricity usage in kWh.</p>
            
            <div className="visual-card-grid">
              <div className="visual-card" style={{ maxWidth: '300px' }}>
                <div className="co2-cloud"><strong>0.41 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per kWh</span></div>
                <div className="visual-card-icon" style={{ background: '#fef9c3', color: '#a16207' }}><TooltipIcon name="Zap" size={56} /></div>
                <div className="visual-card-title">Monthly Electricity</div>
                <div className="visual-card-subtitle">(in kWh)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="000" value={electricity.kwh} onChange={e => setElectricity({...electricity, kwh: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setStep(5)}
                style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Previous Step"
              >
                <TooltipIcon name="ArrowLeft" size={24} />
              </button>
              <button className="skeuo-button" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleNext}>
                NEXT <TooltipIcon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: FLIGHTS */}
        {step === 7 && (
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ textAlign: 'right', marginRight: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '1.4' }}>Carbon<br/>Emissions<br/>From</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '70px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: 0, lineHeight: '1' }}>Flights</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '16px', textAlign: 'center', marginBottom: '60px' }}>Please estimate the number of short and long-haul flights you take annually.</p>
            
            <div className="visual-card-grid">
              <div className="visual-card" style={{ maxWidth: '300px' }}>
                <div className="co2-cloud"><strong>150 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per flight</span></div>
                <div className="visual-card-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><TooltipIcon name="Plane" size={56} /></div>
                <div className="visual-card-title">Short-Haul Flights</div>
                <div className="visual-card-subtitle">(under 3 hours)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="0" value={flights.short} onChange={e => setFlights({...flights, short: e.target.value})} />
              </div>

              <div className="visual-card" style={{ maxWidth: '300px' }}>
                <div className="co2-cloud"><strong>400 kg</strong><br/><span style={{fontWeight: 400}}>of CO₂ emitted<br/>per flight</span></div>
                <div className="visual-card-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}><TooltipIcon name="Plane" size={56} /></div>
                <div className="visual-card-title">Long-Haul Flights</div>
                <div className="visual-card-subtitle">(over 3 hours)</div>
                <input type="number" min="0" className="visual-input-yellow" placeholder="0" value={flights.long} onChange={e => setFlights({...flights, long: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setStep(6)}
                style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Previous Step"
              >
                <TooltipIcon name="ArrowLeft" size={24} />
              </button>
              <button className="skeuo-button pulse-glow" style={{ borderRadius: '30px', padding: '12px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleSubmitFinal}>
                <TooltipIcon name="Check" size={18} /> SUBMIT
              </button>
            </div>
          </div>
        )}


      </div>
        </div>
      </div>
    </div>
  );
}
