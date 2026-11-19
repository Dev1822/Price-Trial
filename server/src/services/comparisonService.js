/**
 * comparisonService.js
 * 
 * Preserves the existing comparePrices interface while utilizing
 * the Intelligent Product Matching & Pricing Engine.
 */

const { executePriceComparison } = require('./pricing/comparePrices');

async function comparePrices(query, rawItems = null) {
  return await executePriceComparison(query, rawItems);
}

module.exports = {
  comparePrices
};
