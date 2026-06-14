-- Database Initialization for Carbon Footprint Platform

-- Drop existing tables if they exist (for clean initialization)
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS eco_tips CASCADE;
DROP TABLE IF EXISTS carbon_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    used_points INTEGER DEFAULT 0,
    pending_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Carbon Logs Table (Stores tracking activities)
CREATE TABLE carbon_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'transportation', 'energy', 'food', 'waste'
    sub_category VARCHAR(100) NOT NULL, -- e.g. 'Petrol Car', 'Electricity', 'Red Meat', 'Landfill Waste'
    input_value NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    carbon_emissions NUMERIC NOT NULL, -- in Kgs CO2
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    details JSONB
);

-- Create Eco Tips Table (For Infinite Scrolling feed)
CREATE TABLE eco_tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    impact_level VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High'
    potential_savings NUMERIC NOT NULL, -- Kgs CO2 per month
    difficulty VARCHAR(20) NOT NULL -- 'Easy', 'Medium', 'Hard'
);

-- Create AI Insights Table (Caches Gemini recommendations)
CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    insights JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default User (Password: password123)
INSERT INTO users (id, username, email, password, avatar_url, total_points, used_points, pending_points) VALUES (1, 'Akash', 'akash@example.com', '$2b$10$ZPAcJuQLxRvPh/n6cNQl5Osm7Uk0Y1PnxiD61b7ORI7mdDTNqyNZi', 'https://api.dicebear.com/7.x/bottts/svg?seed=Akash', 85000, 15000, 0);

-- Fix sequence for users table since we inserted a hardcoded ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Insert Initial Carbon Logs for Akash (to populate charts)
-- (780 kWh electricity matches the dashboard image screenshot)
INSERT INTO carbon_logs (user_id, category, sub_category, input_value, unit, carbon_emissions, logged_at) VALUES
(1, 'energy', 'Electricity Usage', 780, 'kWh', 320.5, CURRENT_DATE - INTERVAL '15 days'),
(1, 'transportation', 'Petrol Car Driving', 150, 'km', 37.2, CURRENT_DATE - INTERVAL '12 days'),
(1, 'food', 'Meat Meals', 14, 'meals', 28.0, CURRENT_DATE - INTERVAL '10 days'),
(1, 'waste', 'Non-recycled Waste', 4, 'bags', 12.0, CURRENT_DATE - INTERVAL '8 days'),
(1, 'transportation', 'Public Bus Travel', 80, 'km', 8.5, CURRENT_DATE - INTERVAL '6 days'),
(1, 'food', 'Vegetarian Meals', 25, 'meals', 12.5, CURRENT_DATE - INTERVAL '4 days'),
(1, 'energy', 'Electricity Usage', 720, 'kWh', 295.0, CURRENT_DATE - INTERVAL '2 days'),
(1, 'waste', 'Recyclable Plastics', 2, 'bags', 1.2, CURRENT_DATE - INTERVAL '1 day');

-- Insert seed data for Eco Tips (Need a robust list of 15+ tips for testing infinite scrolling)
INSERT INTO eco_tips (title, description, category, impact_level, potential_savings, difficulty) VALUES
('Switch to LED Light Bulbs', 'Replace traditional incandescent bulbs with energy-efficient LEDs. They use 75% less energy and last 25 times longer.', 'energy', 'Medium', 15.0, 'Easy'),
('Unplug Phantom Electronics', 'Devices draw power even when turned off. Unplug chargers, TVs, and computers when not in use, or use smart power strips.', 'energy', 'Low', 8.2, 'Easy'),
('Adopt Meatless Mondays', 'Skip meat once a week. Producing plant-based food uses fewer resources and generates far lower carbon emissions compared to livestock farming.', 'food', 'Medium', 25.0, 'Easy'),
('Install a Programmable Thermostat', 'Program your heating and cooling to adjust automatically when you are asleep or away from home, saving valuable HVAC energy.', 'energy', 'High', 45.0, 'Medium'),
('Opt for Cold Water Laundry', 'About 90% of the energy consumed by a washing machine goes to heating the water. Switching to cold water saves electricity and preserves clothes.', 'energy', 'Medium', 12.0, 'Easy'),
('Carpool or Ride-Share', 'Share your daily commute with coworkers or friends. Cutting down on single-passenger car journeys dramatically decreases transport emissions.', 'transportation', 'High', 60.0, 'Medium'),
('Compost Your Food Scraps', 'Organic waste in landfills decomposes anaerobically, releasing methane. Composting transforms waste into nutrient-rich soil helper.', 'waste', 'Medium', 18.0, 'Medium'),
('Reduce Single-Use Plastics', 'Bring your own bags, containers, and coffee cups. Plastic production is highly carbon-intensive, and disposal pollutes ecosystems.', 'waste', 'Low', 5.0, 'Easy'),
('Maintain Proper Tire Inflation', 'Underinflated tires increase rolling resistance, lowering fuel efficiency. Keep tires properly inflated to save fuel and cut emissions.', 'transportation', 'Low', 6.5, 'Easy'),
('Transition to a Vegan Diet', 'Embracing a fully plant-based diet is one of the most powerful personal choices for cutting green-house emissions and land use.', 'food', 'High', 80.0, 'Hard'),
('Seal Window and Door Drafts', 'Apply weatherstripping or caulk to seal gaps around windows and doors, stopping heated or cooled air from escaping your home.', 'energy', 'Medium', 22.0, 'Medium'),
('Install Low-Flow Showerheads', 'Reduce hot water consumption by upgrading to low-flow showerheads, which deliver strong water pressure while using half the volume.', 'energy', 'Medium', 14.5, 'Easy'),
('Switch to a Fuel-Efficient or Electric Vehicle', 'When purchasing your next vehicle, consider an EV or hybrid. Over their lifespan, EVs produce significantly fewer greenhouse gases.', 'transportation', 'High', 250.0, 'Hard'),
('Plant Native Trees and Plants', 'Trees naturally capture and store carbon dioxide. Native plants also require less water and support local biodiversity.', 'energy', 'Medium', 10.0, 'Medium'),
('Purchase Second-Hand Items', 'Extend the lifespan of products by buying pre-owned clothing, electronics, and furniture. This bypasses manufacturing emissions.', 'waste', 'Medium', 20.0, 'Easy'),
('Limit Air Travel When Possible', 'Aviation has an outsized carbon footprint. Choose train travel for regional trips, or offset emissions for unavoidable flights.', 'transportation', 'High', 150.0, 'Hard'),
('Use a Clothesline or Drying Rack', 'Air-drying your laundry instead of using a gas or electric clothes dryer is completely free and eliminates dryer energy usage.', 'energy', 'Medium', 16.0, 'Easy'),
('Minimize Food Waste', 'Plan meals, store food properly, and eat leftovers. One-third of global food is wasted, compounding farming emissions.', 'food', 'High', 35.0, 'Easy'),
('Support Renewable Energy Programs', 'Opt into your utility provider''s green power program, or install solar panels to directly source your electricity from renewable generators.', 'energy', 'High', 120.0, 'Hard'),
('Implement a Zero-Waste Office Routine', 'Digitize files, print double-sided when necessary, use digital note-taking, and recycle all paper, glass, and aluminum products.', 'waste', 'Low', 7.5, 'Medium');
