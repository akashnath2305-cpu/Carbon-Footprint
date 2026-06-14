import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      temperature: 0.2
    }
  });

  const prompt = `
You are an expert carbon footprint calculator focusing strictly on the Indian context.
Calculate the estimated annualized carbon emissions (in kg of CO2) for a user based on the following raw questionnaire inputs:
- Household Size: 2
- Diet Preference: Vegan (In India, meat eaters have higher footprint, vegans lower. Average Indian diet is ~300-500 kg CO2/year)
- Annual Public Travel (km): Bus: 0, Electric Bus: 0, Cab: 0, Electric Cab: 0
- Annual Home Fuel (kg): LPG/CNG: 0, Coal: 0, Coke: 0
- Annual Vehicle Fuel (liters): Petrol: 0, Diesel: 0, CNG: 0
- Monthly Electricity (kWh): 200 (Indian grid emission factor is ~0.71 kg CO2/kWh)
- Annual Flights: Short-haul: 0, Long-haul: 0

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

  try {
    const result = await model.generateContent(prompt);
    console.log("SUCCESS TEXT:", result.response.text());
  } catch (err) {
    console.error("CAUGHT ERROR:", err.message || err);
  }
}

test();
