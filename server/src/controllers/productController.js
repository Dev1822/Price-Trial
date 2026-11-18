/**
 * productController.js
 * 
 * Controller handling product search, matching, and price comparison requests.
 */

const { executePriceComparison } = require('../services/pricing/comparePrices');

async function searchAndMatchProducts(req, res) {
  try {
    const query = req.query.q || req.body?.query;
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query using ?q=your_product'
      });
    }

    const comparison = await executePriceComparison(query);

    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('[Product Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare product prices'
    });
  }
}

module.exports = {
  searchAndMatchProducts
};
