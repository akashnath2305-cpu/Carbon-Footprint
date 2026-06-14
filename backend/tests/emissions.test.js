import { calculateEmissions } from '../utils/emissions.js';

describe('Emissions Calculator', () => {
  test('Transportation: Car should calculate correctly', () => {
    expect(calculateEmissions('Transportation', 'Car', 10)).toBe(2.5); // 10 * 0.25
  });

  test('Energy: Electricity should calculate correctly', () => {
    expect(calculateEmissions('Energy', 'Electricity', 100)).toBe(41); // 100 * 0.41
  });

  test('Food: Meat should calculate correctly', () => {
    expect(calculateEmissions('Food', 'Meat/Non-Veg', 5)).toBe(10); // 5 * 2.0
  });

  test('Waste: Recyclable should calculate correctly', () => {
    expect(calculateEmissions('Waste', 'Recyclable', 20)).toBe(12); // 20 * 0.6
  });

  test('Invalid value should return 0', () => {
    expect(calculateEmissions('Transportation', 'Car', 'invalid')).toBe(0);
  });
});
