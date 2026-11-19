/**
 * calculateRelevance.js
 * 
 * Configurable multi-factor relevance scoring engine.
 * Computes a normalized relevance score between 0 and 100 based on:
 * - Brand Match (20 pts)
 * - Exact Model Match (35 pts)
 * - Category Match (15 pts)
 * - Specification Match: Storage, RAM, Chip (15 pts)
 * - Title Token & Fuzzy Similarity (15 pts)
 */

const { tokenJaccardSimilarity, stringSimilarity } = require('./normalizeTitle');

const DEFAULT_WEIGHTS = {
  brand: 20,
  model: 35,
  category: 15,
  specifications: 15,
  titleSimilarity: 15
};

/**
 * Calculate the relevance score of a product against the query intent
 */
function calculateRelevance(product, queryIntent, weights = DEFAULT_WEIGHTS) {
  const pAttrs = product.extractedAttributes || {};
  let score = 0;

  // 1. Brand Score
  if (queryIntent.brand && pAttrs.brand) {
    if (queryIntent.brand.toLowerCase() === pAttrs.brand.toLowerCase()) {
      score += weights.brand;
    } else {
      score += weights.brand * 0.2; // partial/unconfirmed brand
    }
  } else if (!queryIntent.brand) {
    // Brand wasn't specified in query, award neutral portion
    score += weights.brand * 0.8;
  }

  // 2. Model Score
  if (queryIntent.modelName && pAttrs.modelName) {
    const qModelNorm = queryIntent.modelName.toLowerCase().replace(/[- ]/g, '');
    const pModelNorm = pAttrs.modelName.toLowerCase().replace(/[- ]/g, '');
    if (qModelNorm === pModelNorm) {
      score += weights.model;
    } else if (pModelNorm.includes(qModelNorm) || qModelNorm.includes(pModelNorm)) {
      score += weights.model * 0.8;
    } else {
      score += weights.model * 0.3;
    }
  } else {
    // Generic model token overlap
    const jaccard = tokenJaccardSimilarity(queryIntent.normalizedQuery, product.title);
    score += weights.model * Math.min(1, jaccard * 1.5);
  }

  // 3. Category Score
  if (queryIntent.targetCategory && product.classification?.category) {
    if (queryIntent.targetCategory === product.classification.category) {
      score += weights.category;
    } else if (queryIntent.isAccessoryIntent && product.classification.isAccessory) {
      score += weights.category;
    } else {
      score += weights.category * 0.2;
    }
  } else {
    score += weights.category * 0.7;
  }

  // 4. Specifications Match (Storage, RAM, Chipset)
  let specScoreRatio = 0;
  let specCriteriaCount = 0;

  if (queryIntent.storage) {
    specCriteriaCount++;
    if (pAttrs.storage && pAttrs.storage.toUpperCase() === queryIntent.storage.toUpperCase()) {
      specScoreRatio += 1.0;
    }
  }

  if (queryIntent.ram) {
    specCriteriaCount++;
    if (pAttrs.ram && pAttrs.ram.toUpperCase() === queryIntent.ram.toUpperCase()) {
      specScoreRatio += 1.0;
    }
  }

  if (queryIntent.chipset) {
    specCriteriaCount++;
    if (pAttrs.chipset && pAttrs.chipset.toUpperCase() === queryIntent.chipset.toUpperCase()) {
      specScoreRatio += 1.0;
    }
  }

  if (specCriteriaCount > 0) {
    score += weights.specifications * (specScoreRatio / specCriteriaCount);
  } else {
    // No specific spec demanded by user, check if product has recognized specs
    score += weights.specifications * 0.9;
  }

  // 5. Title & Token Fuzzy Similarity
  const jaccardSim = tokenJaccardSimilarity(queryIntent.normalizedQuery, product.title);
  const strSim = stringSimilarity(queryIntent.normalizedQuery, product.title);
  const combinedSim = (jaccardSim * 0.6) + (strSim * 0.4);
  score += weights.titleSimilarity * Math.min(1, combinedSim);

  // Round and bound between 10 and 100 for approved products
  const finalScore = Math.min(100, Math.max(10, Math.round(score)));

  return {
    relevanceScore: finalScore,
    matchedModel: pAttrs.modelName || queryIntent.modelName || queryIntent.rawQuery,
    brand: pAttrs.brand || queryIntent.brand || 'Unknown',
    storage: pAttrs.storage || 'Unknown',
    ram: pAttrs.ram || 'Unknown',
    condition: pAttrs.condition || 'New'
  };
}

module.exports = {
  DEFAULT_WEIGHTS,
  calculateRelevance
};
