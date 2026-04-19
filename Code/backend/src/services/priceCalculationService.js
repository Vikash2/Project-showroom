/**
 * Service specifically tasked to securely calculate final prices
 * Server-side calculation prevents payload manipulation from clients.
 */

/**
 * Calculates the total Grand Price of a vehicle mapped against its base pricing configurations,
 * any accessories, RTO options, and discounts.
 * 
 * @param {Object} basePricing - The base `{ exShowroom, rto, insurance }` from variants
 * @param {Object} saleParameters - Form fields evaluating to added/subtracted costs
 * @param {String} customerState - The state where the showroom operates
 * @returns {Number} grandTotal calculated
 */
function calculateGrandTotal(basePricing, saleParameters, customerState = "State") {
  let total = 0;
  
  // 1. Base cost (Ex-showroom + base RTO + Insurance)
  total += Number(basePricing.exShowroom || 0);
  total += Number(basePricing.rto || 0);
  total += Number(basePricing.insurance || 0);

  // 2. Extra Costs based on toggles
  if (saleParameters.hypothecationSelected === "Yes" || saleParameters.hypothecationSelected === true) {
    total += 500; // Registration mark cost for finance
  }

  // Cross-state RTO charge
  if (saleParameters.otherState && saleParameters.otherState !== customerState) {
    total += 500; // Arbitrary processing fee
  }

  // Job club membership fee
  if (saleParameters.jobClub === "YES" || saleParameters.jobClub === true) {
    total += 1500;
  }

  // 3. Dynamic Values
  total += Number(saleParameters.accessoriesTotal || 0);
  total += Number(saleParameters.otherCharges || 0);

  // 4. Discounts (Subtractions)
  let standardDiscount = Number(saleParameters.requestedDiscount || 0);
  let specialDiscount = Number(saleParameters.specialDiscount || 0);

  // If special discount is not strictly 'Approved', it shouldn't be subtracted yet.
  if (saleParameters.specialDiscountStatus !== "Approved") {
    specialDiscount = 0;
  }

  total -= standardDiscount;
  total -= specialDiscount;

  return total;
}

module.exports = {
  calculateGrandTotal,
};
