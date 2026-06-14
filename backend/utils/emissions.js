// Carbon footprint calculation formula helper
export function calculateEmissions(category, subCategory, value) {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;

  switch (category.toLowerCase()) {
    case 'transportation':
      if (subCategory.includes('Car')) return numValue * 0.25;
      if (subCategory.includes('Bus')) return numValue * 0.10;
      if (subCategory.includes('Train')) return numValue * 0.05;
      if (subCategory.includes('Flight')) return numValue * 0.15;
      return numValue * 0.15;

    case 'energy':
      if (subCategory.includes('Electricity')) return numValue * 0.41;
      if (subCategory.includes('LPG') || subCategory.includes('Gas')) return numValue * 2.0;
      return numValue * 0.5;

    case 'food':
      if (subCategory.includes('Meat') || subCategory.includes('Non-Veg')) return numValue * 2.0;
      if (subCategory.includes('Vegetarian')) return numValue * 0.5;
      if (subCategory.includes('Vegan')) return numValue * 0.25;
      return numValue * 1.0;

    case 'waste':
      if (subCategory.includes('Non-recycled') || subCategory.includes('Landfill')) return numValue * 3.0;
      if (subCategory.includes('Recyclable')) return numValue * 0.6;
      return numValue * 1.5;

    default:
      return numValue * 1.0;
  }
}
