const { comparePrices } = require('../services/comparisonService');

const TRENDING_SEARCHES = [
  { id: '1', title: 'iPhone 15 (128 GB)', category: 'Smartphones', query: 'iphone 15' },
  { id: '2', title: 'MacBook Air M2', category: 'Laptops', query: 'macbook air m2' },
  { id: '3', title: 'Sony WH-1000XM5', category: 'Audio', query: 'sony wh 1000xm5' },
  { id: '4', title: 'Samsung Galaxy S24', category: 'Smartphones', query: 'samsung galaxy s24' },
  { id: '5', title: 'Apple AirPods Pro (2nd Gen)', category: 'Audio', query: 'airpods pro 2' },
  { id: '6', title: 'Nike Air Force 1', category: 'Footwear', query: 'nike air force 1' }
];

async function handleSearch(req, res) {
  try {
    const query = req.query.q || req.body.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query using ?q=your_product'
      });
    }

    console.log(`[PriceTrail API] Scraping and comparing prices for: "${query}"`);
    const comparison = await comparePrices(query);

    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('[PriceTrail API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare product prices'
    });
  }
}

function handleTrending(req, res) {
  return res.status(200).json({
    success: true,
    data: TRENDING_SEARCHES
  });
}

function handleHealth(req, res) {
  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'PriceTrail Node.js + Cheerio Comparison Engine'
  });
}

module.exports = {
  handleSearch,
  handleTrending,
  handleHealth
};
