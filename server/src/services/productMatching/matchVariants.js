/**
 * matchVariants.js
 * 
 * Groups and matches equivalent product variants.
 * Prevents mixing different storage (128GB vs 256GB), RAM (8GB vs 16GB), or chipsets.
 */

/**
 * Generate a canonical variant signature key
 */
function getVariantKey(product) {
  const attrs = product.extractedAttributes || {};
  const model = (attrs.modelName || 'standard').toLowerCase().replace(/\s+/g, '-');
  const storage = (attrs.storage || 'unknown').toLowerCase();
  const ram = (attrs.ram || 'unknown').toLowerCase();
  const chip = (attrs.chipset || 'standard').toLowerCase().replace(/\s+/g, '-');
  const condition = (attrs.condition || 'new').toLowerCase();

  return `${model}__storage-${storage}__ram-${ram}__chip-${chip}__cond-${condition}`;
}

/**
 * Check if two products are equivalent variants
 */
function areEquivalentVariants(prodA, prodB) {
  const keyA = getVariantKey(prodA);
  const keyB = getVariantKey(prodB);
  return keyA === keyB;
}

/**
 * Group products into equivalent variant clusters
 */
function groupProductVariants(products, queryIntent) {
  const variantGroups = {};

  for (const product of products) {
    const key = getVariantKey(product);
    if (!variantGroups[key]) {
      const attrs = product.extractedAttributes || {};
      variantGroups[key] = {
        variantKey: key,
        model: attrs.modelName || queryIntent.modelName || 'Standard',
        storage: attrs.storage || 'Unknown',
        ram: attrs.ram || 'Unknown',
        chipset: attrs.chipset || 'Standard',
        condition: attrs.condition || 'New',
        items: []
      };
    }
    variantGroups[key].items.push(product);
  }

  // Determine the primary variant group to compare
  const groupKeys = Object.keys(variantGroups);
  if (groupKeys.length === 0) {
    return {
      primaryGroup: null,
      allVariantGroups: []
    };
  }

  let selectedGroupKey = groupKeys[0];

  // 1. If user query explicitly specified storage/RAM, prioritize matching group
  if (queryIntent.storage || queryIntent.ram) {
    for (const key of groupKeys) {
      const group = variantGroups[key];
      let matchesQuery = true;
      if (queryIntent.storage && group.storage !== 'Unknown') {
        if (group.storage.toUpperCase() !== queryIntent.storage.toUpperCase()) {
          matchesQuery = false;
        }
      }
      if (queryIntent.ram && group.ram !== 'Unknown') {
        if (group.ram.toUpperCase() !== queryIntent.ram.toUpperCase()) {
          matchesQuery = false;
        }
      }
      if (matchesQuery) {
        selectedGroupKey = key;
        break;
      }
    }
  } else {
    // 2. Otherwise pick the group with the most items, or lowest base storage (e.g. 128GB)
    let bestScore = -1;
    for (const key of groupKeys) {
      const group = variantGroups[key];
      let score = group.items.length * 10;
      // Prefer standard known base sizes (128GB for phones, 256GB for laptops)
      if (group.storage === '128GB' || group.storage === '256GB') {
        score += 15;
      }
      if (score > bestScore) {
        bestScore = score;
        selectedGroupKey = key;
      }
    }
  }

  const primaryGroup = variantGroups[selectedGroupKey];

  return {
    primaryGroup,
    primaryVariantKey: selectedGroupKey,
    allVariantGroups: Object.values(variantGroups)
  };
}

module.exports = {
  getVariantKey,
  areEquivalentVariants,
  groupProductVariants
};
