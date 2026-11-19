/**
 * filterProducts.js
 * 
 * Strict pre-filtering and rejection engine.
 * Discards incompatible products before ranking and pricing comparison:
 * - Rejects accessories in main device searches (e.g., covers/chargers for iPhone 15)
 * - Rejects mismatched accessories when searching for specific accessories
 * - Enforces strict model distinction (e.g., iPhone 15 vs iPhone 15 Pro vs Plus vs Pro Max)
 * - Enforces variant constraints (e.g., 128GB vs 256GB)
 * - Returns structured rejection logs.
 */

const { normalizeTitle } = require('./normalizeTitle');
const { extractAttributes } = require('./extractAttributes');
const { classifyProduct, classifyQueryIntent, CATEGORIES } = require('./classifyProduct');

/**
 * Check if the product model strictly matches the query model
 */
function checkModelCompatibility(queryIntent, productAttrs) {
  const qNorm = queryIntent.normalizedQuery;
  const pNorm = productAttrs.normalizedText;

  // 1. iPhone Model Check
  const qIphone = qNorm.match(/\biphone\s*(\d{1,2}|se)\b/i);
  if (qIphone) {
    const qGen = qIphone[1].toLowerCase();
    const pIphone = pNorm.match(/\biphone\s*(\d{1,2}|se)\b/i);
    if (!pIphone || pIphone[1].toLowerCase() !== qGen) {
      return { compatible: false, reason: 'Incompatible model (different iPhone generation)' };
    }

    // Check modifiers: Pro Max, Pro, Plus, Mini
    const qHasProMax = /\bpro\s*max\b/i.test(qNorm);
    const qHasPro = !qHasProMax && /\bpro\b/i.test(qNorm);
    const qHasPlus = /\bplus\b/i.test(qNorm);
    const qHasMini = /\bmini\b/i.test(qNorm);
    const qIsBase = !qHasProMax && !qHasPro && !qHasPlus && !qHasMini;

    const pHasProMax = /\bpro\s*max\b/i.test(pNorm);
    const pHasPro = !pHasProMax && /\bpro\b/i.test(pNorm);
    const pHasPlus = /\bplus\b/i.test(pNorm);
    const pHasMini = /\bmini\b/i.test(pNorm);
    const pIsBase = !pHasProMax && !pHasPro && !pHasPlus && !pHasMini;

    if (qIsBase && !pIsBase) {
      const modifier = pHasProMax ? 'Pro Max' : pHasPro ? 'Pro' : pHasPlus ? 'Plus' : 'Mini';
      return { compatible: false, reason: `Incompatible model (found ${modifier} for base model search)` };
    }
    if (qHasPro && !pHasPro) {
      return { compatible: false, reason: 'Incompatible model (expected Pro model)' };
    }
    if (qHasProMax && !pHasProMax) {
      return { compatible: false, reason: 'Incompatible model (expected Pro Max model)' };
    }
    if (qHasPlus && !pHasPlus) {
      return { compatible: false, reason: 'Incompatible model (expected Plus model)' };
    }
    if (qHasMini && !pHasMini) {
      return { compatible: false, reason: 'Incompatible model (expected Mini model)' };
    }

    return { compatible: true };
  }

  // 2. Samsung Galaxy Model Check
  const qGalaxy = qNorm.match(/\bgalaxy\s*(s\d{1,2}|z\s*(?:fold|flip)\s*\d?|a\d{1,2})\b/i);
  if (qGalaxy) {
    const qModel = qGalaxy[1].replace(/\s+/g, '').toLowerCase();
    const pGalaxy = pNorm.match(/\bgalaxy\s*(s\d{1,2}|z\s*(?:fold|flip)\s*\d?|a\d{1,2})\b/i);
    if (!pGalaxy || pGalaxy[1].replace(/\s+/g, '').toLowerCase() !== qModel) {
      return { compatible: false, reason: 'Incompatible model (different Galaxy model)' };
    }

    // Check modifiers: Ultra, Plus, FE
    const qHasUltra = /\bultra\b/i.test(qNorm);
    const qHasPlus = /\b(?:plus|\+)\b/i.test(qNorm);
    const qHasFE = /\bfe\b/i.test(qNorm);
    const qIsBase = !qHasUltra && !qHasPlus && !qHasFE;

    const pHasUltra = /\bultra\b/i.test(pNorm);
    const pHasPlus = /\b(?:plus|\+)\b/i.test(pNorm);
    const pHasFE = /\bfe\b/i.test(pNorm);

    if (qIsBase && (pHasUltra || pHasPlus || pHasFE)) {
      const modifier = pHasUltra ? 'Ultra' : pHasPlus ? 'Plus' : 'FE';
      return { compatible: false, reason: `Incompatible model (found ${modifier} for base Galaxy search)` };
    }
    if (qHasUltra && !pHasUltra) {
      return { compatible: false, reason: 'Incompatible model (expected Ultra variant)' };
    }
    if (qHasPlus && !pHasPlus) {
      return { compatible: false, reason: 'Incompatible model (expected Plus variant)' };
    }

    return { compatible: true };
  }

  // 3. MacBook Check (Air vs Pro and Chipset M1/M2/M3/M4)
  const qMacbook = qNorm.match(/\bmacbook\s*(air|pro)\b/i);
  if (qMacbook) {
    const qType = qMacbook[1].toLowerCase();
    const pMacbook = pNorm.match(/\bmacbook\s*(air|pro)\b/i);
    if (!pMacbook || pMacbook[1].toLowerCase() !== qType) {
      return { compatible: false, reason: `Incompatible model (expected MacBook ${qType.toUpperCase()})` };
    }

    // Check chipset if user specified M1/M2/M3/M4
    const qChip = qNorm.match(/\b(m[1-4])\b/i);
    if (qChip) {
      const pChip = pNorm.match(/\b(m[1-4])\b/i);
      if (pChip && pChip[1].toLowerCase() !== qChip[1].toLowerCase()) {
        return { compatible: false, reason: `Incompatible model (expected ${qChip[1].toUpperCase()} chip, found ${pChip[1].toUpperCase()})` };
      }
    }

    return { compatible: true };
  }

  // 4. Sony Headphone Check (e.g. WH-1000XM5 vs WH-1000XM4)
  const qSony = qNorm.match(/\b(w[hf][- ]?1000xm[3-5])\b/i);
  if (qSony) {
    const qModel = qSony[1].replace(/[- ]/g, '').toLowerCase();
    const pSony = pNorm.match(/\b(w[hf][- ]?1000xm[3-5])\b/i);
    if (!pSony || pSony[1].replace(/[- ]/g, '').toLowerCase() !== qModel) {
      return { compatible: false, reason: `Incompatible model (expected ${qSony[1].toUpperCase()})` };
    }
    return { compatible: true };
  }

  return { compatible: true };
}

/**
 * Filter an array of scraped products against the query intent
 */
function filterProducts(products, rawQuery) {
  const queryIntent = classifyQueryIntent(rawQuery);
  const accepted = [];
  const rejected = [];
  const reasonsCount = {};

  function addRejection(product, reason) {
    rejected.push({
      id: product.id,
      title: product.title,
      price: product.price,
      platform: product.platform,
      reason
    });
    reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
  }

  for (const product of products) {
    // 0. Price sanity
    if (!product || typeof product.price !== 'number' || product.price <= 0) {
      addRejection(product, 'Invalid price');
      continue;
    }

    const title = product.title || '';
    const pAttrs = extractAttributes(title);
    const pClass = classifyProduct(title, pAttrs);

    // 1. Accessory Handling
    if (!queryIntent.isAccessoryIntent) {
      // User is searching for a main device (e.g. "iPhone 15", "Samsung Galaxy S24")
      if (pClass.isAccessory) {
        addRejection(product, 'Accessory product');
        continue;
      }
    } else {
      // User is explicitly searching for an accessory (e.g. "iPhone 15 charger", "iPhone 15 cover")
      if (!pClass.isAccessory) {
        addRejection(product, 'Device listing in accessory search');
        continue;
      }

      // Check specific accessory type match if user targeted one
      if (queryIntent.targetAccessoryTypes.length > 0 && pAttrs.accessories.length > 0) {
        const matchesType = queryIntent.targetAccessoryTypes.some(type =>
          pAttrs.accessories.includes(type)
        );
        if (!matchesType) {
          addRejection(product, `Wrong accessory type (expected ${queryIntent.targetAccessoryTypes.join('/')})`);
          continue;
        }
      }
    }

    // 2. Strict Brand Compatibility (when user specified a brand for device searches)
    if (!queryIntent.isAccessoryIntent && queryIntent.brand) {
      const qBrand = queryIntent.brand.toLowerCase();
      if (pAttrs.brand && pAttrs.brand.toLowerCase() !== qBrand) {
        addRejection(product, `Brand mismatch (expected ${queryIntent.brand}, found ${pAttrs.brand})`);
        continue;
      }
      if (!pAttrs.brand && !title.toLowerCase().includes(qBrand)) {
        addRejection(product, `Brand mismatch (expected ${queryIntent.brand})`);
        continue;
      }
    }

    // 3. Strict Model Compatibility
    const modelCheck = checkModelCompatibility(queryIntent, pAttrs);
    if (!modelCheck.compatible) {
      addRejection(product, modelCheck.reason);
      continue;
    }

    // 4. Strict Specification Matching: Storage
    if (queryIntent.storage && pAttrs.storage) {
      if (queryIntent.storage.toUpperCase() !== pAttrs.storage.toUpperCase()) {
        addRejection(product, `Storage mismatch (expected ${queryIntent.storage}, found ${pAttrs.storage})`);
        continue;
      }
    }

    // 4. Strict Specification Matching: RAM
    if (queryIntent.ram && pAttrs.ram) {
      if (queryIntent.ram.toUpperCase() !== pAttrs.ram.toUpperCase()) {
        addRejection(product, `RAM mismatch (expected ${queryIntent.ram}, found ${pAttrs.ram})`);
        continue;
      }
    }

    // 5. Condition Matching (New vs Refurbished)
    if (queryIntent.condition === 'New' && pAttrs.condition !== 'New') {
      addRejection(product, `Condition mismatch (found ${pAttrs.condition})`);
      continue;
    }

    // Passed all strict filters!
    accepted.push({
      ...product,
      extractedAttributes: pAttrs,
      classification: pClass
    });
  }

  return {
    queryIntent,
    accepted,
    rejectedResults: {
      count: rejected.length,
      reasons: Object.keys(reasonsCount),
      reasonsBreakdown: reasonsCount,
      items: rejected
    }
  };
}

module.exports = {
  checkModelCompatibility,
  filterProducts
};
