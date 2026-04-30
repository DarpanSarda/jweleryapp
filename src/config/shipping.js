// Special cities with custom pricing
const SPECIAL_CITIES = {
  ahmedabad: {
    cities: ['Ahmedabad'],
    standard_cost: 50,
    express_cost: null, // Not available
    estimated_days: '1-2 business days'
  },
  mumbai: {
    cities: ['Mumbai', 'Navi Mumbai', 'Mumbai City', 'Mumbai Suburban'],
    standard_cost: 80,
    express_cost: 150,
    estimated_days: '2-3 business days'
  }
};

// Pricing by state
const STATE_PRICING = {
  'Gujarat': {
    standard_cost: 50,
    express_cost: 150,
    estimated_days: '2-3 business days'
  },
  'Maharashtra': {
    standard_cost: 100,
    express_cost: 150,
    estimated_days: '3-4 business days'
  },
  'default': {
    standard_cost: 100,
    express_cost: 150,
    estimated_days: '3-5 business days'
  }
};

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 2999;

/**
 * Calculate shipping cost based on city, state, and shipping method
 * @param {string} city - Customer's city
 * @param {string} state - Customer's state
 * @param {string} method - 'standard' or 'express'
 * @param {number} orderAmount - Total order amount before shipping
 * @returns {object} Shipping details including cost, zone, etc.
 */
function calculateShippingCost(city, state, method = 'standard', orderAmount = 0) {
  // Check if order qualifies for free shipping (standard only)
  if (orderAmount >= FREE_SHIPPING_THRESHOLD && method === 'standard') {
    return {
      cost: 0,
      zone: 'free',
      zone_name: 'Free Shipping',
      method: method,
      estimated_days: '3-5 business days',
      is_free: true,
      state: state,
      city: city
    };
  }

  // Check if it's a special city (Ahmedabad or Mumbai)
  const specialCityKey = Object.keys(SPECIAL_CITIES).find(key =>
    SPECIAL_CITIES[key].cities.some(c =>
      c.toLowerCase() === city?.toLowerCase()
    )
  );

  if (specialCityKey) {
    const specialCity = SPECIAL_CITIES[specialCityKey];
    const cost = method === 'express'
      ? (specialCity.express_cost || specialCity.standard_cost)
      : specialCity.standard_cost;

    return {
      cost: cost,
      zone: specialCityKey,
      zone_name: specialCityKey === 'ahmedabad' ? 'Ahmedabad' : 'Mumbai',
      method: method,
      estimated_days: specialCity.estimated_days,
      is_free: false,
      state: state,
      city: city
    };
  }

  // Get pricing for the state
  const pricing = STATE_PRICING[state] || STATE_PRICING['default'];
  const cost = method === 'express'
    ? pricing.express_cost
    : pricing.standard_cost;

  // Determine zone name
  let zone_name = state;
  if (state === 'Gujarat') {
    zone_name = 'Gujarat (except Ahmedabad)';
  } else if (state === 'Maharashtra') {
    zone_name = 'Maharashtra (except Mumbai)';
  }

  return {
    cost: cost,
    zone: state === 'Gujarat' ? 'gujarat' : state === 'Maharashtra' ? 'maharashtra' : 'other_states',
    zone_name: zone_name,
    method: method,
    estimated_days: pricing.estimated_days,
    is_free: false,
    state: state,
    city: city
  };
}

/**
 * Check if express shipping is available for a city and state
 * @param {string} city - Customer's city
 * @param {string} state - Customer's state
 * @returns {boolean} True if express shipping is available
 */
function isExpressAvailable(city, state) {
  // Check special cities
  const specialCityKey = Object.keys(SPECIAL_CITIES).find(key =>
    SPECIAL_CITIES[key].cities.some(c =>
      c.toLowerCase() === city?.toLowerCase()
    )
  );

  if (specialCityKey) {
    return SPECIAL_CITIES[specialCityKey].express_cost !== null;
  }

  // For other cities, express is available
  return true;
}

/**
 * Format shipping cost for display
 * @param {number} cost - Shipping cost
 * @returns {string} Formatted cost (e.g., "₹50" or "FREE")
 */
function formatShippingCost(cost) {
  if (cost === 0) return 'FREE';
  return `₹${cost}`;
}

/**
 * Get shipping details summary for display
 * @param {object} shippingDetails - Shipping details from calculateShippingCost
 * @returns {string} Summary text
 */
function getShippingSummary(shippingDetails) {
  if (shippingDetails.is_free) {
    return 'FREE Shipping (3-5 business days)';
  }
  return `${formatShippingCost(shippingDetails.cost)} - ${shippingDetails.zone_name} (${shippingDetails.estimated_days})`;
}

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  SPECIAL_CITIES,
  STATE_PRICING,
  calculateShippingCost,
  isExpressAvailable,
  formatShippingCost,
  getShippingSummary
};
