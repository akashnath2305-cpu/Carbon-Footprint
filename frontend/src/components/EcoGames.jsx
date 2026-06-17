import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, RefreshCw, CheckCircle2, XCircle, ArrowLeft, Trash2, Recycle, Trophy, Users, UserPlus } from 'lucide-react';
import TooltipIcon from './TooltipIcon';

const triviaQuestions = [
  {
    question: "Which of the following activities has the largest carbon footprint?",
    options: ["Driving a car 10 miles", "Taking a 2-hour flight", "Eating a cheeseburger", "Leaving lights on all day"],
    answer: 1,
    explanation: "A 2-hour commercial flight emits roughly 200-300 Kgs of CO2 per passenger, dwarfing the footprint of short drives or single meals."
  },
  {
    question: "How much carbon dioxide can a mature tree absorb in one year?",
    options: ["5 Kgs", "15 Kgs", "22 Kgs", "50 Kgs"],
    answer: 2,
    explanation: "A typical mature tree can absorb about 22 Kgs of carbon dioxide per year, making reforestation a crucial tool against climate change."
  },
  {
    question: "Which diet choice lowers your footprint the most?",
    options: ["Eating local beef", "Eating imported avocados", "A plant-based vegan diet", "Eating only organic food"],
    answer: 2,
    explanation: "A plant-based diet drastically reduces emissions because raising livestock (especially beef) generates enormous amounts of methane and requires vast land and water resources."
  },
  {
    question: "What percentage of the world's electricity comes from renewable sources (as of recent years)?",
    options: ["Less than 10%", "Around 30%", "Over 50%", "Over 75%"],
    answer: 1,
    explanation: "Globally, about 30% of electricity is generated from renewable sources like hydro, wind, and solar, though this percentage is rapidly growing."
  },
  {
    question: "Which everyday item takes the longest time to decompose in a landfill?",
    options: ["Aluminum can", "Plastic grocery bag", "Glass bottle", "Disposable diaper"],
    answer: 2,
    explanation: "A glass bottle can take over 1 million years to decompose in a landfill, making it incredibly important to recycle glass indefinitely."
  },
  {
    question: "What is the most energy-efficient type of light bulb?",
    options: ["Incandescent", "Halogen", "CFL", "LED"],
    answer: 3,
    explanation: "LEDs use up to 90% less energy than incandescent bulbs and last up to 25 times longer."
  },
  {
    question: "Which greenhouse gas is most abundant in the Earth's atmosphere?",
    options: ["Carbon Dioxide", "Methane", "Water Vapor", "Nitrous Oxide"],
    answer: 2,
    explanation: "Water vapor is the most abundant, but human activities have the most direct, damaging impact by drastically increasing Carbon Dioxide and Methane levels."
  },
  {
    question: "What sector is the largest contributor to global greenhouse gas emissions?",
    options: ["Agriculture", "Transportation", "Energy Production", "Manufacturing"],
    answer: 2,
    explanation: "Energy production (burning fossil fuels for electricity and heat) accounts for nearly three-quarters of global greenhouse gas emissions."
  },
  {
    question: "Phantom energy (or vampire power) refers to:",
    options: ["Energy from solar panels", "Power consumed by devices plugged in but turned off", "Energy used at night", "Inefficient power grids"],
    answer: 1,
    explanation: "Vampire power is the electricity consumed by electronics when they are turned off or in standby mode. Unplugging them saves significant energy."
  },
  {
    question: "Which of the following materials is infinitely recyclable without losing quality?",
    options: ["Paper", "Plastic", "Aluminum", "Cardboard"],
    answer: 2,
    explanation: "Aluminum can be melted down and recycled an infinite number of times without any loss of quality, saving 95% of the energy required to make new aluminum."
  }
];

const wasteItems = [
  { name: "Banana Peel", image: "/item_banana_peel.png", bin: "compost", explanation: "Organic waste like fruit peels break down safely in compost." },
  { name: "Greasy Pizza Box", image: "/item_pizza_box.png", bin: "landfill", explanation: "Grease contaminates paper recycling. It must go to the landfill (or commercial compost if accepted locally)." },
  { name: "Clean Aluminum Can", image: "/item_aluminum_can.png", bin: "recycle", explanation: "Aluminum can be recycled infinitely without losing quality!" },
  { name: "Used Paper Napkin", image: "/item_paper_napkin.png", bin: "compost", explanation: "Soiled paper can't be recycled but breaks down well in compost." },
  { name: "Plastic Water Bottle", image: "/item_plastic_bottle.png", bin: "recycle", explanation: "Clean plastics #1 and #2 are highly recyclable in most programs." },
  { name: "Styrofoam Cup", image: "/item_styrofoam_cup.png", bin: "landfill", explanation: "Styrofoam is rarely accepted in curbside recycling and never in compost." },
];

const mythbusterQuestions = [
  {
    statement: "Washing dishes by hand uses less water than a modern dishwasher.",
    isTrue: false,
    explanation: "False! Modern Energy Star dishwashers use significantly less water (about 3-4 gallons) compared to hand-washing (up to 20 gallons)."
  },
  {
    statement: "Leaving a fan on cools down the room even when you are not in it.",
    isTrue: false,
    explanation: "False! Fans cool people, not rooms. Leaving them on in an empty room just wastes electricity."
  },
  {
    statement: "The internet and data centers account for more greenhouse gas emissions than the airline industry.",
    isTrue: true,
    explanation: "True! Global digital infrastructure accounts for roughly 3.7% of global emissions, slightly more than the aviation sector."
  },
  {
    statement: "Buying a new electric vehicle (EV) is always better for the environment than keeping an old gas-powered car.",
    isTrue: false,
    explanation: "False! Manufacturing a new EV has a huge carbon footprint. If you drive infrequently, keeping an old car longer might be more eco-friendly overall."
  },
  {
    statement: "Organic food always has a lower carbon footprint than conventionally grown food.",
    isTrue: false,
    explanation: "False! While organic farming avoids synthetic pesticides, organic food can sometimes have a higher carbon footprint due to lower crop yields and longer transportation distances."
  },
  {
    statement: "Planting trees is the only effective way to remove carbon dioxide from the atmosphere.",
    isTrue: false,
    explanation: "False! While planting trees is vital, restoring wetlands, protecting peat bogs, and ocean conservation are also highly effective at removing CO2."
  },
  {
    statement: "Using a microwave to heat food uses significantly less energy than an electric oven.",
    isTrue: true,
    explanation: "True! Microwaves heat food much more quickly and direct the energy straight into the food, using up to 80% less energy than conventional ovens."
  },
  {
    statement: "Paper bags are always better for the environment than plastic bags.",
    isTrue: false,
    explanation: "False! Manufacturing paper bags requires significantly more water and energy than making plastic bags. You need to reuse a paper bag at least 3-4 times to offset its higher production footprint."
  },
  {
    statement: "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
    isTrue: true,
    explanation: "True! Recycling aluminum saves 95% of the energy needed to make new aluminum from ore, making it incredibly energy efficient."
  },
  {
    statement: "Leaving the lights on consumes less electricity than frequently turning them off and on.",
    isTrue: false,
    explanation: "False! The surge of power used to turn on a light is microscopic. You will always save energy by turning off the lights when leaving a room."
  }
];


function GamesHub({ onSelect }) {
  const games = [
    {
      id: 'trivia',
      title: 'Carbon Trivia',
      icon: 'Sprout',
      color: '#4ade80',
      description: 'Test your knowledge about the environment and earn Eco-Points.'
    },
    {
      id: 'sorter',
      title: 'Waste Sorter',
      icon: 'Trash2',
      color: '#fbbf24',
      description: 'Sort common household items into the correct bins as fast as you can!'
    },
    {
      id: 'mythbusters',
      title: 'Eco Mythbusters',
      icon: 'Lightbulb',
      color: '#60a5fa',
      description: 'True or False? Debunk common environmental myths.'
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent-emerald)' }}>
        <TooltipIcon name="Gamepad2" size={64} className="pulse-glow" />
      </div>
      <h3 style={{ fontSize: '32px', marginBottom: '16px', color: '#fff', fontFamily: "'Playfair Display', serif" }}>Eco Games Hub</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px', fontSize: '16px' }}>
        Choose a mini-game below to test your sustainability knowledge, have fun, and earn Eco-Points for the community leaderboard!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {games.map(game => (
          <div key={game.id} className="skeuo-button" style={{ 
            padding: '30px', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(10, 10, 10, 0.5)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s',
          }}
          onClick={() => onSelect(game.id)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = game.color; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
          >
            <TooltipIcon name={game.icon} size={48} style={{ color: game.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            <h4 style={{ fontSize: '20px', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{game.title}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{game.description}</p>
            <button style={{ 
              marginTop: 'auto', 
              padding: '8px 24px', 
              borderRadius: '30px', 
              border: `1px solid ${game.color}`, 
              background: 'transparent', 
              color: game.color,
              fontWeight: 600,
              cursor: 'pointer',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              Play Now
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '48px', padding: '30px', background: 'rgba(10, 10, 10, 0.65)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy size={24} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>Eco-Points Leaderboard</h3>
          </div>
          <button style={{ background: 'transparent', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <UserPlus size={16} /> Add Friend
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 1, name: "EcoWarrior99", score: 4500, isUser: false },
            { id: 2, name: "Jane Doe", score: 3200, isUser: false },
            { id: 3, name: "You", score: 2800, isUser: true },
            { id: 4, name: "GreenNeighbor", score: 1500, isUser: false },
          ].map((user, index) => (
            <div key={user.id} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              background: user.isUser ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0,0,0,0.3)', 
              border: user.isUser ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(255,255,255,0.05)',
              padding: '16px', borderRadius: '12px',
              boxShadow: user.isUser ? '0 4px 12px rgba(74, 222, 128, 0.1)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span style={{ 
                  fontWeight: 800, fontSize: '18px', width: '24px', textAlign: 'center',
                  color: index === 0 ? '#fbbf24' : index === 1 ? '#cbd5e1' : index === 2 ? '#b45309' : 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} color="#fff" />
                </div>
                <span style={{ color: '#fff', fontWeight: user.isUser ? 700 : 500, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
              </div>
              <span style={{ color: user.isUser ? '#4ade80' : 'var(--accent-emerald)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '8px' }}>
                {user.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TriviaGame({ onExit }) {
  const { addEarnedPoints } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const questions = triviaQuestions;

  const handleAnswer = (idx) => {
    setUserAnswers(prev => [...prev, idx]);
    let newScore = score;
    if (idx === questions[currentQuestion].answer) {
      newScore = score + 5;
      setScore(newScore);
    }
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
      if (newScore > 0) addEarnedPoints(newScore);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
  };

  if (showResult) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', color: 'var(--accent-emerald)' }}>
          <TooltipIcon name="Trophy" size={64} style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#fff', fontFamily: "'Playfair Display', serif" }}>Quiz Complete!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>
            You earned <strong style={{ color: 'var(--accent-emerald)' }}>{score} Eco-Points</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px' }}>
          {questions.map((q, qIndex) => {
            const isCorrect = userAnswers[qIndex] === q.answer;
            return (
              <div key={qIndex} style={{ 
                padding: '24px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.65)', backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  {isCorrect ? <CheckCircle2 size={24} color="#4ade80" /> : <XCircle size={24} color="#f87171" />}
                  <h4 style={{ fontSize: '18px', color: '#fff', margin: 0, lineHeight: 1.4, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{q.question}</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '36px', marginBottom: '20px' }}>
                  {q.options.map((opt, optIndex) => {
                    let bgColor = 'rgba(0,0,0,0.5)'; let borderColor = 'rgba(255,255,255,0.1)';
                    let shadow = 'inset 0 2px 4px rgba(0,0,0,0.5)'; let color = '#cbd5e1';
                    if (optIndex === q.answer) {
                      bgColor = 'rgba(74, 222, 128, 0.15)'; borderColor = 'rgba(74, 222, 128, 0.4)';
                      shadow = '0 4px 10px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'; color = '#4ade80';
                    } else if (optIndex === userAnswers[qIndex] && optIndex !== q.answer) {
                      bgColor = 'rgba(248, 113, 113, 0.15)'; borderColor = 'rgba(248, 113, 113, 0.4)';
                      shadow = '0 4px 10px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'; color = '#f87171';
                    }
                    return (
                      <div key={optIndex} style={{ padding: '12px 16px', borderRadius: '8px', background: bgColor, border: `1px solid ${borderColor}`, boxShadow: shadow, color: color, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{opt}</span>
                        {optIndex === userAnswers[qIndex] && <span style={{ fontSize: '12px', opacity: 0.8 }}>(Your Answer)</span>}
                        {optIndex === q.answer && optIndex !== userAnswers[qIndex] && <span style={{ fontSize: '12px', opacity: 0.8 }}>(Correct Answer)</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', border: '1px solid rgba(96, 165, 250, 0.3)', borderLeft: '4px solid #60a5fa', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', marginLeft: '36px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Explanation</h5>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: '15px', lineHeight: 1.5 }}>{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="skeuo-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 32px' }} onClick={restartGame}>
            <RefreshCw size={18} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Hub
      </button>

      {/* Progress Bar Line */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '100%', width: `${((currentQuestion) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 80%, #60a5fa 100%)', boxShadow: '2px 0 15px rgba(96, 165, 250, 0.8)', transition: 'width 0.3s ease', borderRadius: '3px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '10px', background: '#fff', boxShadow: '0 0 15px 5px #60a5fa', borderRadius: '50%' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Question {currentQuestion + 1} of {questions.length}</span>
        <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Score: {score}</span>
      </div>
      
      <h3 style={{ fontSize: '20px', marginBottom: '24px', color: '#fff', lineHeight: 1.4, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
        {questions[currentQuestion].question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {questions[currentQuestion].options.map((opt, idx) => (
          <button key={idx} className="skeuo-raised" style={{ padding: '16px 20px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', fontWeight: 500, color: '#fff', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            onClick={() => handleAnswer(idx)}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-emerald)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function WasteSorter({ onExit }) {
  const { addEarnedPoints } = useAuth();
  const [currentItem, setCurrentItem] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation, bin }
  const [throwing, setThrowing] = useState(null); // 'left', 'center', 'right' or null
  
  const items = wasteItems;

  const handleSort = (bin, index) => {
    const dir = index === 0 ? 'left' : index === 1 ? 'center' : 'right';
    setThrowing(dir);
    
    setTimeout(() => {
      setThrowing(null);
      const isCorrect = items[currentItem].bin === bin;
      if (isCorrect) setScore(score + 5);
      setFeedback({ isCorrect, explanation: items[currentItem].explanation, bin });
    }, 600);
  };

  const nextItem = () => {
    setFeedback(null);
    const nextIdx = currentItem + 1;
    if (nextIdx >= items.length && score > 0) {
      addEarnedPoints(score);
    }
    setCurrentItem(nextIdx);
  };

  const restartGame = () => {
    setCurrentItem(0);
    setScore(0);
    setFeedback(null);
  };

  if (currentItem >= items.length) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
        <TooltipIcon name="Recycle" size={64} style={{ color: '#fbbf24', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#fff', fontFamily: "'Playfair Display', serif" }}>Sorting Complete!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '24px' }}>
          You correctly sorted {score / 5} out of {items.length} items.
        </p>
        <button className="skeuo-button" style={{ padding: '16px 32px' }} onClick={restartGame}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Hub
      </button>

      {/* Progress Bar Line */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '100%', width: `${((currentItem) / items.length) * 100}%`, background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 80%, #60a5fa 100%)', boxShadow: '2px 0 15px rgba(96, 165, 250, 0.8)', transition: 'width 0.3s ease', borderRadius: '3px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '10px', background: '#fff', boxShadow: '0 0 15px 5px #60a5fa', borderRadius: '50%' }}></div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Item {currentItem + 1} of {items.length}</span>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>Score: {score}</span>
      </div>

      <div style={{ padding: '40px', background: 'rgba(10, 10, 10, 0.65)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}>
        {!feedback && <img src={items[currentItem].image} alt={items[currentItem].name} className={throwing ? `throw-${throwing}` : ''} style={{ width: '180px', height: '180px', objectFit: 'contain', margin: '0 auto 24px', display: 'block', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }} />}
        <h3 style={{ fontSize: '28px', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{items[currentItem].name}</h3>
      </div>

      {feedback ? (
        <div className="animate-fade-in" style={{ padding: '24px', background: feedback.isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', border: `1px solid ${feedback.isCorrect ? '#4ade80' : '#f87171'}`, borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            {feedback.isCorrect ? <CheckCircle2 size={32} color="#4ade80" /> : <XCircle size={32} color="#f87171" />}
            <h4 style={{ fontSize: '24px', margin: 0, color: feedback.isCorrect ? '#4ade80' : '#f87171' }}>{feedback.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
          </div>
          <p style={{ color: '#fff', fontSize: '16px', lineHeight: 1.5, marginBottom: '20px' }}>{feedback.explanation}</p>
          <button className="skeuo-button" style={{ padding: '12px 24px' }} onClick={nextItem}>Next Item</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {[
            { id: 'recycle', label: 'Recycle', color: '#3b82f6', img: '/recycle_bin.png' },
            { id: 'compost', label: 'Compost', color: '#4ade80', img: '/compost_bin.png' },
            { id: 'landfill', label: 'Landfill', color: '#94a3b8', img: '/landfill_bin.png' }
          ].map((bin, index) => (
            <button key={bin.id} className="skeuo-raised" style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1 }}
              onClick={() => handleSort(bin.id, index)}
              disabled={throwing !== null}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = bin.color; e.currentTarget.style.transform = 'translateY(-5px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={bin.img} alt={bin.label} style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} />
              <span style={{ color: '#fff', fontWeight: 600 }}>{bin.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Mythbusters({ onExit }) {
  const { addEarnedPoints } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const questions = mythbusterQuestions;

  const handleAnswer = (answer) => {
    const isCorrect = answer === questions[currentQ].isTrue;
    if (isCorrect) setScore(score + 5);
    setFeedback({ isCorrect, explanation: questions[currentQ].explanation });
  };

  const nextQuestion = () => {
    setFeedback(null);
    const nextIdx = currentQ + 1;
    if (nextIdx >= questions.length && score > 0) {
      addEarnedPoints(score);
    }
    setCurrentQ(nextIdx);
  };

  if (currentQ >= questions.length) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
        <TooltipIcon name="Lightbulb" size={64} style={{ color: '#60a5fa', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#fff', fontFamily: "'Playfair Display', serif" }}>Mythbusting Complete!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '24px' }}>
          You correctly answered {score / 5} out of {questions.length} myths.
        </p>
        <button className="skeuo-button" style={{ padding: '16px 32px' }} onClick={() => { setCurrentQ(0); setScore(0); setFeedback(null); }}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
      <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Hub
      </button>

      {/* Progress Bar Line */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '100%', width: `${((currentQ) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 80%, #60a5fa 100%)', boxShadow: '2px 0 15px rgba(96, 165, 250, 0.8)', transition: 'width 0.3s ease', borderRadius: '3px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '10px', background: '#fff', boxShadow: '0 0 15px 5px #60a5fa', borderRadius: '50%' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Myth {currentQ + 1} of {questions.length}</span>
        <span style={{ fontWeight: 700, color: '#60a5fa' }}>Score: {score}</span>
      </div>

      <div style={{ padding: '40px', background: 'rgba(10, 10, 10, 0.65)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '26px', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.5 }}>
          "{questions[currentQ].statement}"
        </h3>
      </div>

      {feedback ? (
        <div className="animate-fade-in" style={{ padding: '24px', background: feedback.isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', border: `1px solid ${feedback.isCorrect ? '#4ade80' : '#f87171'}`, borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            {feedback.isCorrect ? <CheckCircle2 size={32} color="#4ade80" /> : <XCircle size={32} color="#f87171" />}
            <h4 style={{ fontSize: '24px', margin: 0, color: feedback.isCorrect ? '#4ade80' : '#f87171' }}>{feedback.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
          </div>
          <p style={{ color: '#fff', fontSize: '16px', lineHeight: 1.5, marginBottom: '20px' }}>{feedback.explanation}</p>
          <button className="skeuo-button" style={{ padding: '12px 24px' }} onClick={nextQuestion}>Next Myth</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="skeuo-raised" style={{ flex: 1, padding: '20px', fontSize: '20px', fontWeight: 700, color: '#fff', background: 'rgba(74, 222, 128, 0.2)', border: '1px solid rgba(74, 222, 128, 0.5)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            onClick={() => handleAnswer(true)}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(74, 222, 128, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(74, 222, 128, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            TRUE
          </button>
          <button className="skeuo-raised" style={{ flex: 1, padding: '20px', fontSize: '20px', fontWeight: 700, color: '#fff', background: 'rgba(248, 113, 113, 0.2)', border: '1px solid rgba(248, 113, 113, 0.5)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            onClick={() => handleAnswer(false)}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            FALSE
          </button>
        </div>
      )}
    </div>
  );
}

export default function EcoGames() {
  const [currentGame, setCurrentGame] = useState(null);

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', backgroundColor: 'transparent' }}>
        {currentGame === null && <GamesHub onSelect={setCurrentGame} />}
        {currentGame === 'trivia' && <TriviaGame onExit={() => setCurrentGame(null)} />}
        {currentGame === 'sorter' && <WasteSorter onExit={() => setCurrentGame(null)} />}
        {currentGame === 'mythbusters' && <Mythbusters onExit={() => setCurrentGame(null)} />}
      </div>
    </div>
  );
}
