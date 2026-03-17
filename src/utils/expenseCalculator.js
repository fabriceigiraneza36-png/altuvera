/**
 * AI-Powered Tour Expense Calculator
 * Calculates minimal and low-cost tour expenses based on destination, duration, and tour type
 */

const EXPENSE_CONFIG = {
  accommodation: {
    budget: 30,
    standard: 60,
    premium: 120,
  },
  meals: {
    budget: 15,
    standard: 25,
    premium: 50,
  },
  transport: {
    budget: 20,
    standard: 40,
    premium: 80,
  },
  activities: {
    budget: 25,
    standard: 50,
    premium: 100,
  },
  miscellaneous: {
    budget: 10,
    standard: 20,
    premium: 40,
  },
};

const DESTINATION_MULTIPLIERS = {
  kenya: 1.0,
  tanzania: 0.95,
  uganda: 0.9,
  rwanda: 1.1,
  ethiopia: 0.85,
  djibouti: 1.2,
  'south-africa': 1.15,
};

/**
 * Calculate tour expenses with AI logic
 * Prioritizes minimal and low-cost options while maintaining quality
 */
export const calculateTourExpenses = (tourParams = {}) => {
  const {
    destination = 'kenya',
    duration = 7,
    groupSize = 1,
    tourType = 'safari', // safari, cultural, adventure, luxury
    passengers = 1,
    season = 'low', // low, high
  } = tourParams;

  // Normalize destination
  const dest = destination.toLowerCase().replace(/\s+/g, '-');
  const multiplier = DESTINATION_MULTIPLIERS[dest] || 1.0;

  // Adjust for season
  const seasonMultiplier = season === 'high' ? 1.15 : 0.85;

  // Determine base tier: prioritize budget/low cost
  let tier = 'budget';
  if (tourType === 'luxury' || season === 'high') {
    tier = 'standard';
  }

  // Calculate per-person daily expenses
  const dailyExpenses = {
    accommodation: EXPENSE_CONFIG.accommodation[tier],
    meals: EXPENSE_CONFIG.meals[tier],
    transport: EXPENSE_CONFIG.transport[tier] * (1 + (groupSize - 1) * 0.1), // Slightly more expensive with larger group
    activities: EXPENSE_CONFIG.activities[tier],
    miscellaneous: EXPENSE_CONFIG.miscellaneous[tier],
  };

  // Apply multipliers
  Object.keys(dailyExpenses).forEach((key) => {
    dailyExpenses[key] *= multiplier * seasonMultiplier;
    dailyExpenses[key] = Math.round(dailyExpenses[key] * 100) / 100; // Round to 2 decimals
  });

  // Calculate total daily cost
  const dailyTotal = Object.values(dailyExpenses).reduce((sum, val) => sum + val, 0);

  // Calculate total trip cost (per person)
  const tripCostPerPerson = dailyTotal * duration;

  // Group discounts (minimize costs for larger groups)
  let groupDiscount = 0;
  if (groupSize >= 3) groupDiscount = 0.05;
  if (groupSize >= 5) groupDiscount = 0.1;
  if (groupSize >= 10) groupDiscount = 0.15;

  const discountedCost = tripCostPerPerson * (1 - groupDiscount);
  const totalGroupCost = discountedCost * groupSize;

  // Breakdown and AI-generated tips
  const expenses = {
    accommodation: Math.round(dailyExpenses.accommodation * duration * 100) / 100,
    meals: Math.round(dailyExpenses.meals * duration * 100) / 100,
    transport: Math.round(dailyExpenses.transport * duration * 100) / 100,
    activities: Math.round(dailyExpenses.activities * duration * 100) / 100,
    miscellaneous: Math.round(dailyExpenses.miscellaneous * duration * 100) / 100,
  };

  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);

  return {
    destination,
    duration,
    groupSize,
    passengers,
    tourType,
    season,
    tier,
    multiplier,
    seasonMultiplier,
    // Per person
    dailyTotal: Math.round(dailyTotal * 100) / 100,
    perPersonTotal: Math.round(discountedCost * 100) / 100,
    // Expenses breakdown
    expenses,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    // Group costs
    groupDiscount: Math.round(groupDiscount * 10000) / 100, // percentage
    totalGroupCost: Math.round(totalGroupCost * 100) / 100,
    // Cost per person in group
    costPerPerson: Math.round((totalGroupCost / groupSize) * 100) / 100,
    // AI recommendations
    recommendations: generateCostSavingTips(tourParams, tier),
    savings: generateSavingsSummary(tourParams, groupSize),
  };
};

/**
 * Generate AI-powered cost-saving tips
 */
const generateCostSavingTips = (tourParams, tier) => {
  const tips = [];

  if (tier === 'budget') {
    tips.push('✓ Budget tier selected - maximizing value for money');
    tips.push('✓ Local homestays and lodges reduce accommodation costs');
    tips.push('✓ Group sizes of 4+ receive 5-15% additional discounts');
  }

  if (tourParams.season === 'low') {
    tips.push('✓ Traveling in low season - excellent cost optimization');
    tips.push('✓ Wildlife viewing is excellent even during low season');
  }

  if (tourParams.tourType === 'cultural') {
    tips.push('✓ Cultural tours are budget-friendly while offering rich experiences');
    tips.push('✓ Local guides reduce costs and support communities');
  }

  if (tourParams.groupSize >= 5) {
    tips.push(`✓ Group of ${tourParams.groupSize} qualifies for group discounts`);
  }

  if (!tips.length) {
    tips.push('✓ Standard pricing applied for optimal experience');
  }

  return tips;
};

/**
 * Generate savings summary
 */
const generateSavingsSummary = (tourParams, groupSize) => {
  let savings = 0;
  let message = 'Budget option selected';

  if (groupSize >= 10) {
    savings = 15;
    message = '15% savings for large group (10+ people)';
  } else if (groupSize >= 5) {
    savings = 10;
    message = '10% savings for medium group (5-9 people)';
  } else if (groupSize >= 3) {
    savings = 5;
    message = '5% savings for small group (3-4 people)';
  }

  if (tourParams.season === 'low') {
    savings += 15;
    message += ' + 15% low season discount';
  }

  return {
    percentage: savings,
    message,
    youSave: Math.round((savings / 100) * 1000), // Approximate savings for a $1000 tour
  };
};

/**
 * Get suggested tour duration for budget
 */
export const getSuggestedDuration = (budget = 1000, destination = 'kenya') => {
  const dest = destination.toLowerCase().replace(/\s+/g, '-');
  const multiplier = DESTINATION_MULTIPLIERS[dest] || 1.0;

  // Average daily cost: $100 for budget tier
  const dailyCost = 100 * multiplier;
  const maxDays = Math.floor(budget / dailyCost);

  return {
    budget,
    destination,
    maxDurationDays: Math.max(1, maxDays),
    recommendedDays: Math.max(3, Math.min(7, maxDays)),
    message:
      maxDays < 3
        ? `Budget allows for ${maxDays} day tour. Consider saving more for a fuller experience.`
        : `Your budget allows for a ${maxDays}-day tour. We recommend ${Math.max(3, Math.min(7, maxDays))} days for optimal experience.`,
  };
};

/**
 * Compare pricing across tiers
 */
export const comparePricingTiers = (tourParams = {}) => {
  const tiers = {
    budget: calculateTourExpenses({ ...tourParams, tourType: 'adventure' }),
    standard: calculateTourExpenses({
      ...tourParams,
      tourType: 'standard',
      season: 'high',
    }),
  };

  return {
    budget: tiers.budget,
    standard: tiers.standard,
    savings: Math.round((tiers.standard.totalExpenses - tiers.budget.totalExpenses) * 100) / 100,
    comparison:
      tiers.budget.tier === 'budget'
        ? `Save $${(tiers.standard.totalExpenses - tiers.budget.totalExpenses)} by choosing budget tier`
        : 'Similar pricing across tiers',
  };
};
