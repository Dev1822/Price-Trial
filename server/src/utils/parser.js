/**
 * Clean raw price string and extract numeric value
 * e.g., "₹79,990" -> 79990, "$1,199.99" -> 1199.99
 */
function parsePrice(rawPrice) {
  if (!rawPrice) return null;
  if (typeof rawPrice === 'number') return rawPrice;

  // Remove currency symbols, commas, non-breaking spaces
  const cleaned = rawPrice
    .replace(/[₹$,]/g, '')
    .replace(/\s+/g, '')
    .trim();

  // Find the first float / integer sequence
  const match = cleaned.match(/(\d+(\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : val;
  }
  return null;
}

/**
 * Clean and format rating e.g., "4.3 out of 5 stars" -> 4.3
 */
function parseRating(rawRating) {
  if (!rawRating) return null;
  const match = rawRating.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Format currency in Indian Rupees format (₹)
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
  return '₹' + amount.toLocaleString('en-IN');
}

module.exports = {
  parsePrice,
  parseRating,
  formatCurrency
};
