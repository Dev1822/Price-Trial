/**
 * calculateDealScore.js
 * 
 * Computes deal metrics, savings percentages, and deal quality tags.
 */

const { formatCurrency } = require('../../utils/parser');

/**
 * Calculate comprehensive deal analytics for a set of equivalent items
 */
function calculateDealScore(items) {
  if (!items || items.length === 0) {
    return {
      bestDeal: null,
      summary: null
    };
  }

  // Sort ascending by price
  const sorted = [...items].sort((a, b) => a.price - b.price);
  const bestItem = sorted[0];

  const prices = sorted.map(i => i.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxSavings = maxPrice - minPrice;
  const savingsPercent = maxPrice > 0 ? Math.round((maxSavings / maxPrice) * 100) : 0;

  let recommendationText = `Best deal found on ${bestItem.platform} at ${formatCurrency(bestItem.price)}.`;
  if (maxSavings > 0) {
    recommendationText += ` You can save up to ${formatCurrency(maxSavings)} (${savingsPercent}%) compared to highest priced retailer!`;
  }

  return {
    bestDeal: {
      ...bestItem,
      isBestDeal: true,
      formattedPrice: formatCurrency(bestItem.price),
      formattedOriginalPrice: formatCurrency(bestItem.originalPrice || bestItem.price),
      savingsVsHighest: formatCurrency(maxSavings),
      savingsPercent
    },
    summary: {
      lowestPrice: minPrice,
      highestPrice: maxPrice,
      lowestPriceFormatted: formatCurrency(minPrice),
      highestPriceFormatted: formatCurrency(maxPrice),
      maxSavings,
      maxSavingsFormatted: formatCurrency(maxSavings),
      savingsPercent,
      winnerPlatform: bestItem.platform,
      recommendationText
    }
  };
}

module.exports = {
  calculateDealScore
};
