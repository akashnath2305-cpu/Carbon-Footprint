import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    ai = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI Client successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI client:', error);
  }
} else {
  console.log('No GEMINI_API_KEY environment variable found. The server will use the intelligent fallback simulation.');
}

// Fallback recommendations generator based on logged categories
function getMockInsights(logs) {
  const totals = { transportation: 0, energy: 0, food: 0, waste: 0 };
  let grandTotal = 0;

  logs.forEach(log => {
    const emissions = parseFloat(log.carbon_emissions);
    totals[log.category] = (totals[log.category] || 0) + emissions;
    grandTotal += emissions;
  });

  const suggestions = [];

  if (totals.energy > 200) {
    suggestions.push({
      title: 'Optimize Home Heating & Electricity',
      text: `Your household energy emissions are currently ${totals.energy.toFixed(1)} Kgs CO2. Upgrading to a smart programmable thermostat can reduce HVAC heating/cooling waste, saving you up to 45 Kgs CO2 monthly.`,
      impact: 'High',
      difficulty: 'Medium'
    });
  } else {
    suggestions.push({
      title: 'Eliminate Phantom Energy Loads',
      text: 'Great job maintaining a low electricity footprint! Unplugging idle phone chargers, microwave displays, and entertainment units overnight can shave off another 5-10% from your monthly electricity bill.',
      impact: 'Low',
      difficulty: 'Easy'
    });
  }

  if (totals.transportation > 40) {
    suggestions.push({
      title: 'Transition Commutes to Shared Transit',
      text: `Your transportation footprint is ${totals.transportation.toFixed(1)} Kgs CO2. If you commute solo, replacing just two drive days per week with carpooling or bus transport can reduce vehicle emissions by approximately 30%.`,
      impact: 'High',
      difficulty: 'Medium'
    });
  }

  if (totals.food > 25) {
    suggestions.push({
      title: 'Embrace More Plant-Based Protein',
      text: `Your dietary footprint stands at ${totals.food.toFixed(1)} Kgs CO2. Livestock production represents a huge share of farming emissions. Switching two meat meals to beans, lentils, or tofu reduces carbon footprint and water usage.`,
      impact: 'Medium',
      difficulty: 'Easy'
    });
  }

  if (totals.waste > 8) {
    suggestions.push({
      title: 'Divert Organics to Composting',
      text: `Landfill waste releases methane gas, which is 25x more potent than CO2. Composting food scraps at home or signing up for local organic waste pickups keeps these materials out of landfills, mitigating methane.`,
      impact: 'Medium',
      difficulty: 'Easy'
    });
  }

  if (suggestions.length < 3) {
    suggestions.push({
      title: 'Choose Post-Consumer Recycled Goods',
      text: 'Buying clothes, electronics, and books second-hand eliminates manufacturing emissions and keeps goods out of landfills. Look for local thrift shops or online listings.',
      impact: 'Medium',
      difficulty: 'Easy'
    });
  }

  // Find primary driver
  let primaryDriver = 'energy';
  let maxVal = 0;
  for (const cat in totals) {
    if (totals[cat] > maxVal) {
      maxVal = totals[cat];
      primaryDriver = cat;
    }
  }

  return {
    totalEstimatedCO2: grandTotal,
    report: `Your total logged emissions are ${grandTotal.toFixed(1)} Kgs CO2. Your primary carbon driver appears to be ${primaryDriver.toUpperCase()} at ${maxVal.toFixed(1)} Kgs CO2. Implementing these suggested adjustments will help lower your impact below national targets.`,
    comparison: {
      globalAverage: 4700,
      indianAverage: 1900
    },
    suggestions
  };
}

export async function getPersonalizedInsights(logs) {
  if (!ai) {
    // Return mock insights if Gemini API client is not initialized
    return getMockInsights(logs);
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 800,
        temperature: 0.2
      }
    });

    // Create text representation of user's logs
    const logSummary = logs.map(l =>
      `- Category: ${l.category}, Activity: ${l.sub_category}, Input: ${l.input_value} ${l.unit}, CO2: ${l.carbon_emissions} Kgs`
    ).join('\n');

    const prompt = `
You are an expert carbon footprint analyst. 
Analyze the following user carbon emission logs which represent their annualized footprint in different categories:
${logSummary}

Based on these logs, calculate their total estimated carbon emissions (in kg of CO2), and generate a JSON response containing:
1. "totalEstimatedCO2": Your calculated total emissions in kg (as a number).
2. "report": A short paragraph (2-4 sentences) analyzing their lifestyle and carbon drivers.
3. "comparison": An object containing:
   - "globalAverage": 4700
   - "indianAverage": 1900
4. "suggestions": An array of 3 to 4 specific, actionable, personalized reduction strategies. Each strategy must be an object with:
   - "title": Short title (e.g. "Smart Commuting")
   - "text": Detailed description with why it helps and estimated impact.
   - "impact": "High", "Medium", or "Low"
   - "difficulty": "Easy", "Medium", or "Hard"

Return ONLY valid JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON structure found in the response text.");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn('Gemini returned invalid or truncated JSON. Returning fallback insights.');
      return getMockInsights(logs);
    }

    return parsed;
  } catch (error) {
    console.warn('Gemini API call failed. Returning fallback insights.');
    return getMockInsights(logs);
  }
}

export async function calculateDynamicFootprint(inputs) {
  if (!ai) {
    // Fallback if no AI is configured
    return {
      totalEstimatedCO2: 1850,
      breakdown: [
        { name: 'Transport', emissions: 600, fill: '#60a5fa' },
        { name: 'Energy', emissions: 700, fill: '#fbbf24' },
        { name: 'Food', emissions: 400, fill: '#f87171' },
        { name: 'Waste', emissions: 150, fill: '#a78bfa' }
      ],
      comparison: { globalAverage: 4700, indianAverage: 1900 },
      suggestions: [
        { title: 'Reduce Flights', text: 'Consider taking fewer flights.', impact: 'High', difficulty: 'Hard' }
      ]
    };
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 800,
        temperature: 0.2
      }
    });

    const prompt = `
You are an expert carbon footprint calculator focusing strictly on the Indian context.
Calculate the estimated annualized carbon emissions (in kg of CO2) for a user based on the following raw questionnaire inputs:
- Household Size: ${inputs.householdSize}
- Diet Preference: ${inputs.food.diet} (In India, meat eaters have higher footprint, vegans lower. Average Indian diet is ~300-500 kg CO2/year)
- Annual Public Travel (km): Bus: ${inputs.publicTravel.bus || 0}, Electric Bus: ${inputs.publicTravel.ebus || 0}, Cab: ${inputs.publicTravel.cab || 0}, Electric Cab: ${inputs.publicTravel.ecab || 0}
- Annual Home Fuel (kg): LPG/CNG: ${inputs.homeFuel.lng || 0}, Coal: ${inputs.homeFuel.coal || 0}, Coke: ${inputs.homeFuel.coke || 0}
- Annual Vehicle Fuel (liters): Petrol: ${inputs.vehicleFuel.petrol || 0}, Diesel: ${inputs.vehicleFuel.diesel || 0}, CNG: ${inputs.vehicleFuel.cng || 0}
- Monthly Electricity (kWh): ${inputs.electricity.kwh || 0} (Indian grid emission factor is ~0.71 kg CO2/kWh)
- Annual Flights: Short-haul: ${inputs.flights.short || 0}, Long-haul: ${inputs.flights.long || 0}

Instructions:
1. Dynamically calculate the CO2 emissions for each category using precise Indian scientific conversion factors. 
   - DO NOT exaggerate the numbers. The average Indian per capita emission is around 1900 kg CO2.
   - Scale household consumption (like Home Fuel and Electricity) by dividing by the Household Size.
2. Provide a JSON response containing:
   - "totalEstimatedCO2": Total calculated emissions in kg (number).
   - "breakdown": An array of exactly 4 objects for the pie chart, corresponding to the 4 categories:
      [{ "name": "Transport", "emissions": <number>, "fill": "#60a5fa" },
       { "name": "Energy", "emissions": <number>, "fill": "#fbbf24" },
       { "name": "Food", "emissions": <number>, "fill": "#f87171" },
       { "name": "Waste", "emissions": <number>, "fill": "#a78bfa" }]
      (For waste, estimate around 100-200 kg based on household size if missing inputs).
   - "comparison": {"globalAverage": 4700, "indianAverage": 1900}
   - "suggestions": An array of 3 to 4 specific, actionable, personalized reduction strategies based strictly on their highest emission areas in an Indian context.
      Each strategy object must have:
      - "title": Short title
      - "text": Detailed description with why it helps.
      - "impact": "High", "Medium", or "Low"
      - "difficulty": "Easy", "Medium", or "Hard"

Return ONLY valid JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON structure found in the response text.");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn('Gemini returned invalid or truncated JSON for footprint calculation. Returning fallback data.');
      return {
        totalEstimatedCO2: 1850,
        breakdown: [
          { name: 'Transport', emissions: 600, fill: '#60a5fa' },
          { name: 'Energy', emissions: 700, fill: '#fbbf24' },
          { name: 'Food', emissions: 400, fill: '#f87171' },
          { name: 'Waste', emissions: 150, fill: '#a78bfa' }
        ],
        comparison: { globalAverage: 4700, indianAverage: 1900 },
        suggestions: [
          { title: 'Reduce Flights', text: 'Consider taking fewer flights.', impact: 'High', difficulty: 'Hard' }
        ]
      };
    }

    return parsed;
  } catch (error) {
    console.log(error);
    console.warn('Gemini API call failed for footprint calculation. Returning fallback data.');
    // Return fallback if API fails
    return {
      totalEstimatedCO2: 1850,
      breakdown: [
        { name: 'Transport', emissions: 600, fill: '#60a5fa' },
        { name: 'Energy', emissions: 700, fill: '#fbbf24' },
        { name: 'Food', emissions: 400, fill: '#f87171' },
        { name: 'Waste', emissions: 150, fill: '#a78bfa' }
      ],
      comparison: { globalAverage: 4700, indianAverage: 1900 },
      suggestions: [
        { title: 'Reduce Flights', text: 'Consider taking fewer flights.', impact: 'High', difficulty: 'Hard' }
      ]
    };
  }
}
