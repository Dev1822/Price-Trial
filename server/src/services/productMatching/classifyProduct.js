/**
 * classifyProduct.js
 * 
 * Classifies products and user search queries into categories:
 * - Smartphones
 * - Laptops
 * - Headphones / Audio
 * - Smartwatches
 * - Tablets
 * - Accessories
 * - Other
 * 
 * Accurately detects accessory intent vs main device intent.
 */

const { normalizeTitle } = require('./normalizeTitle');
const { extractAttributes } = require('./extractAttributes');

const CATEGORIES = {
  SMARTPHONES: 'Smartphones',
  LAPTOPS: 'Laptops',
  HEADPHONES: 'Headphones',
  SMARTWATCHES: 'Smartwatches',
  TABLETS: 'Tablets',
  ACCESSORIES: 'Accessories',
  OTHER: 'Other'
};

// Patterns defining primary non-accessory device categories
const CATEGORY_PATTERNS = [
  {
    category: CATEGORIES.SMARTPHONES,
    patterns: [
      /\biphone(?:\s*\d{1,2}|\s*se)?\b/i,
      /\bgalaxy\s*(?:[szfa]\d{1,2}|z\s*(?:fold|flip))\b/i,
      /\b(?:smartphone|mobile\s*phone|cell\s*phone|5g\s*phone|dual\s*sim)\b/i,
      /\b(pixel\s*\d+[a-z]?|oneplus\s*(?:\d{1,2}|nord)|redmi\s*note|realme\s*\d+)\b/i
    ]
  },
  {
    category: CATEGORIES.LAPTOPS,
    patterns: [
      /\b(?:macbook(?:\s*air|\s*pro)?|laptop|notebook|ultrabook|chromebook|thinkpad|ideapad|zenbook|vivobook|inspiron|xps|legion|victus|omen|pavilion)\b/i
    ]
  },
  {
    category: CATEGORIES.HEADPHONES,
    patterns: [
      /\b(?:headphones?|earphones?|earbuds?|tws|headset|airpods(?:\s*pro|\s*max)?|quietcomfort|w[hf][- ]?1000xm[3-5]|audio-technica)\b/i
    ]
  },
  {
    category: CATEGORIES.SMARTWATCHES,
    patterns: [
      /\b(?:smart\s*watch(?:es)?|apple\s*watch|galaxy\s*watch|fitbit|garmin|wrist\s*watch|colorfit)\b/i
    ]
  },
  {
    category: CATEGORIES.TABLETS,
    patterns: [
      /\b(?:ipad(?:\s*pro|\s*air|\s*mini)?|tablet|galaxy\s*tab|surface\s*pro)\b/i
    ]
  }
];

// Phrases that explicitly signal that the product is an accessory FOR a device
const ACCESSORY_PHRASES = [
  /\b(?:for|compatible\s*with|suitable\s*for|designed\s*for)\s+(?:iphone|samsung|galaxy|macbook|ipad|pixel|oneplus|watch|laptop)\b/i,
  /\b(?:back\s*cover|tempered\s*glass|screen\s*protector|screen\s*guard|protective\s*case|phone\s*case|camera\s*lens\s*protector)\b/i,
  /\b(?:charging\s*cable|power\s*adapter|usb-?c\s*adapter|fast\s*charger|wall\s*charger|magsafe\s*charger)\b/i,
  /\b(?:watch\s*band|watch\s*strap|ear\s*tips|silicone\s*cover)\b/i,
  /\b(?:laptop\s*bags?|laptop\s*backpacks?|laptop\s*sleeves?|laptop\s*covers?|laptop\s*stands?)\b/i
];

/**
 * Classify a product based on its title and extracted attributes
 */
function classifyProduct(title, attributes = null) {
  const normTitle = normalizeTitle(title);
  const attrs = attributes || extractAttributes(title);

  // 1. Check if it's an accessory
  const hasAccessoryPhrase = ACCESSORY_PHRASES.some(pattern => pattern.test(normTitle));
  const hasAccessoryType = attrs.accessories && attrs.accessories.length > 0;

  if (hasAccessoryPhrase || hasAccessoryType) {
    return {
      category: CATEGORIES.ACCESSORIES,
      isAccessory: true,
      accessoryTypes: attrs.accessories || [],
      confidence: 0.95
    };
  }

  // 2. Classify into primary device categories
  for (const item of CATEGORY_PATTERNS) {
    for (const pattern of item.patterns) {
      if (pattern.test(normTitle)) {
        return {
          category: item.category,
          isAccessory: false,
          accessoryTypes: [],
          confidence: 0.9
        };
      }
    }
  }

  return {
    category: CATEGORIES.OTHER,
    isAccessory: false,
    accessoryTypes: [],
    confidence: 0.5
  };
}

/**
 * Classify User Search Intent
 * Identifies whether user searched for a main device or an accessory.
 */
function classifyQueryIntent(query) {
  const normQuery = normalizeTitle(query);
  const attrs = extractAttributes(query);

  const isAccessoryIntent = attrs.accessories && attrs.accessories.length > 0;
  const classification = classifyProduct(query, attrs);

  return {
    rawQuery: query,
    normalizedQuery: normQuery,
    isAccessoryIntent,
    targetCategory: isAccessoryIntent ? CATEGORIES.ACCESSORIES : classification.category,
    targetAccessoryTypes: attrs.accessories || [],
    brand: attrs.brand,
    modelName: attrs.modelName,
    modelModifiers: attrs.modelModifiers || [],
    storage: attrs.storage,
    ram: attrs.ram,
    chipset: attrs.chipset,
    condition: attrs.condition
  };
}

module.exports = {
  CATEGORIES,
  classifyProduct,
  classifyQueryIntent
};
