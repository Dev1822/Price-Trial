/**
 * comparePrices.js
 * 
 * Core Price Comparison & Matching Orchestration Engine.
 * Combines:
 * - Scraped items from Amazon, Flipkart, and Snapdeal
 * - Strict accessory & model filtering
 * - Multi-factor relevance scoring
 * - Equivalent variant grouping
 * - Exact savings calculation across platforms
 */

const { scrapeAmazon } = require('../../scrapers/amazonScraper');
const { scrapeFlipkart } = require('../../scrapers/flipkartScraper');
const { scrapeSnapdeal } = require('../../scrapers/snapdealScraper');
const { filterProducts } = require('../productMatching/filterProducts');
const { calculateRelevance } = require('../productMatching/calculateRelevance');
const { groupProductVariants } = require('../productMatching/matchVariants');
const { calculateDealScore } = require('./calculateDealScore');
const { formatCurrency } = require('../../utils/parser');

async function executePriceComparison(query, rawScrapedItems = null) {
  if (!query || !query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  const cleanQuery = query.trim();
  const startTime = Date.now();

  let allRawItems = [];

  // If rawScrapedItems provided (e.g., in unit testing or fixture testing), use them
  if (rawScrapedItems && Array.isArray(rawScrapedItems)) {
    allRawItems = rawScrapedItems;
  } else {
    // Run live scrapers concurrently
    const [amazonRes, flipkartRes, snapdealRes] = await Promise.allSettled([
      scrapeAmazon(cleanQuery),
      scrapeFlipkart(cleanQuery),
      scrapeSnapdeal(cleanQuery)
    ]);

    const amazonItems = amazonRes.status === 'fulfilled' ? amazonRes.value : [];
    const flipkartItems = flipkartRes.status === 'fulfilled' ? flipkartRes.value : [];
    const snapdealItems = snapdealRes.status === 'fulfilled' ? snapdealRes.value : [];

    allRawItems = [...amazonItems, ...flipkartItems, ...snapdealItems];
  }

  // 1. Strict Filtering Gate (eliminates incompatible accessories, models, brands, etc.)
  const { queryIntent, accepted, rejectedResults } = filterProducts(allRawItems, cleanQuery);

  if (accepted.length === 0) {
    return {
      query: cleanQuery,
      queryIntent,
      totalResults: 0,
      bestDeal: null,
      summary: null,
      platformComparison: {},
      results: [],
      allDeals: [],
      rejectedResults,
      executionTimeMs: Date.now() - startTime
    };
  }

  // 2. Calculate Relevance Scores for all accepted items
  const scoredItems = accepted.map(item => {
    const relevanceInfo = calculateRelevance(item, queryIntent);
    return {
      ...item,
      ...relevanceInfo,
      formattedPrice: formatCurrency(item.price),
      formattedOriginalPrice: formatCurrency(item.originalPrice || item.price)
    };
  });

  // Sort by relevance score descending
  scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 3. Match and Group Variants
  const { primaryGroup, allVariantGroups } = groupProductVariants(scoredItems, queryIntent);
  const targetItems = primaryGroup ? primaryGroup.items : scoredItems;

  // 4. Compute Deal Scores & Best Deal on the verified primary group
  const { bestDeal, summary } = calculateDealScore(targetItems);

  // 5. Build Side-by-Side Platform Comparison for Verified Target Variant
  const platformBest = {};
  for (const platform of ['amazon', 'flipkart', 'snapdeal']) {
    const platformItems = targetItems
      .filter(i => i.platform?.toLowerCase() === platform && i.price > 0)
      .sort((a, b) => a.price - b.price);

    if (platformItems[0]) {
      const bestOnPlatform = platformItems[0];
      platformBest[platform] = {
        ...bestOnPlatform,
        formattedPrice: formatCurrency(bestOnPlatform.price),
        diffFromBest: bestDeal ? bestOnPlatform.price - bestDeal.price : 0
      };
    } else {
      platformBest[platform] = null;
    }
  }

  // 6. Format Final Result List
  const minPrice = bestDeal ? bestDeal.price : 0;
  const enrichedResults = targetItems.map(item => ({
    ...item,
    isBestDeal: bestDeal ? item.id === bestDeal.id : false,
    priceDifferenceFromBest: item.price - minPrice,
    formattedPrice: formatCurrency(item.price),
    formattedOriginalPrice: formatCurrency(item.originalPrice || item.price)
  }));

  // Sort primary results by price ascending so cheapest deal is first
  enrichedResults.sort((a, b) => a.price - b.price);

  return {
    query: cleanQuery,
    queryIntent: {
      rawQuery: queryIntent.rawQuery,
      targetCategory: queryIntent.targetCategory,
      isAccessoryIntent: queryIntent.isAccessoryIntent,
      brand: queryIntent.brand,
      modelName: queryIntent.modelName,
      storage: queryIntent.storage,
      ram: queryIntent.ram,
      condition: queryIntent.condition
    },
    totalResults: enrichedResults.length,
    executionTimeMs: Date.now() - startTime,
    bestDeal,
    summary,
    platformComparison: platformBest,
    results: enrichedResults,    // Schema expected by user prompt
    allDeals: enrichedResults,   // Preserves React Native frontend compatibility
    variantGroups: allVariantGroups.map(vg => ({
      variantKey: vg.variantKey,
      model: vg.model,
      storage: vg.storage,
      ram: vg.ram,
      itemCount: vg.items.length
    })),
    rejectedResults
  };
}

module.exports = {
  executePriceComparison
};
