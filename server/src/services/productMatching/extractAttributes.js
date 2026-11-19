/**
 * extractAttributes.js
 * 
 * Extracts structured product attributes from normalized titles and search queries.
 * Identifies brand, core model, model modifiers, storage, RAM, chip, display size,
 * color, condition, and accessory types.
 */

const { normalizeTitle } = require('./normalizeTitle');

// Known brands dictionary with canonical naming and model aliases
const BRAND_MAP = {
  apple: { name: 'Apple', aliases: ['apple', 'iphone', 'macbook', 'ipad', 'airpods', 'iwatch'] },
  samsung: { name: 'Samsung', aliases: ['samsung', 'galaxy'] },
  sony: { name: 'Sony', aliases: ['sony', 'bravia', 'playstation', 'ps5'] },
  dell: { name: 'Dell', aliases: ['dell', 'alienware', 'inspiron', 'xps'] },
  hp: { name: 'HP', aliases: ['hp', 'hewlett packard', 'pavilion', 'omen', 'victus'] },
  lenovo: { name: 'Lenovo', aliases: ['lenovo', 'thinkpad', 'ideapad', 'legion'] },
  asus: { name: 'Asus', aliases: ['asus', 'rog', 'tuf', 'zenbook', 'vivobook'] },
  acer: { name: 'Acer', aliases: ['acer', 'predator', 'aspire', 'nitro'] },
  oneplus: { name: 'OnePlus', aliases: ['oneplus', 'one plus', 'nord'] },
  google: { name: 'Google', aliases: ['google', 'pixel'] },
  xiaomi: { name: 'Xiaomi', aliases: ['xiaomi', 'redmi', 'mi', 'poco'] },
  realme: { name: 'Realme', aliases: ['realme', 'narzo'] },
  bose: { name: 'Bose', aliases: ['bose', 'quietcomfort'] },
  jbl: { name: 'JBL', aliases: ['jbl'] },
  boat: { name: 'boAt', aliases: ['boat', 'bo-at'] },
  noise: { name: 'Noise', aliases: ['noise', 'colorfit'] },
  motorola: { name: 'Motorola', aliases: ['motorola', 'moto'] },
  nothing: { name: 'Nothing', aliases: ['nothing', 'cmf'] },
  spigen: { name: 'Spigen', aliases: ['spigen'] },
  anker: { name: 'Anker', aliases: ['anker', 'soundcore'] }
};

// Known model modifiers that create distinct, non-interchangeable tiers
const MODEL_MODIFIERS = [
  'pro max',
  'pro',
  'max',
  'plus',
  'ultra',
  'mini',
  'lite',
  'fe',
  'se',
  'classic',
  'active',
  'edition',
  'air'
];

// Accessory keywords mapped to canonical accessory types
const ACCESSORY_SIGNALS = [
  { type: 'cover', patterns: [/\b(?:back\s*)?covers?\b/i, /\bcases?\b/i, /\bpouch(?:es)?\b/i, /\bskins?\b/i] },
  { type: 'bag', patterns: [/\b(?:laptop\s*)?bags?\b/i, /\bbackpacks?\b/i, /\bbriefcases?\b/i, /\bmessenger\s*bags?\b/i, /\bsleeves?\b/i] },
  { type: 'screen_protector', patterns: [/\btempered\s*glass\b/i, /\bscreen\s*protectors?\b/i, /\bscreen\s*guards?\b/i, /\bcamera\s*lens\s*protectors?\b/i] },
  { type: 'charger', patterns: [/\bchargers?\b/i, /\bcharging\s*adapters?\b/i, /\bpower\s*adapters?\b/i, /\badapters?\b/i, /\bwall\s*chargers?\b/i, /\bmag-?safe\s*chargers?\b/i] },
  { type: 'cable', patterns: [/\bcables?\b/i, /\busb-?c\s*cables?\b/i, /\blightning\s*cables?\b/i, /\btype-?c\s*cables?\b/i, /\bcharging\s*cables?\b/i] },
  { type: 'strap', patterns: [/\bstraps?\b/i, /\bwatch\s*bands?\b/i, /\bwristbands?\b/i] },
  { type: 'stand', patterns: [/\bstands?\b/i, /\bholders?\b/i, /\bmounts?\b/i, /\btripods?\b/i] },
  { type: 'ear_tips', patterns: [/\bear\s*tips?\b/i, /\bear\s*pads?\b/i, /\bcushions?\b/i] },
  { type: 'stylus', patterns: [/\bstylus(?:es)?\b/i, /\bpencil\s*tips?\b/i, /\bs-?pen\b/i] }
];

const COLORS = [
  'space black', 'space grey', 'space gray', 'midnight', 'starlight',
  'natural titanium', 'blue titanium', 'white titanium', 'black titanium',
  'phantom black', 'titanium gray', 'graphite', 'deep purple', 'rose gold',
  'black', 'white', 'blue', 'green', 'yellow', 'pink', 'purple', 'red',
  'gold', 'silver', 'grey', 'gray', 'orange', 'bronze', 'cream'
];

/**
 * Extract brand from text
 */
function extractBrand(normText) {
  for (const [key, info] of Object.entries(BRAND_MAP)) {
    for (const alias of info.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(normText)) {
        return info.name;
      }
    }
  }
  return null;
}

/**
 * Extract accessory types if present
 */
function extractAccessoryTypes(normText) {
  const detected = [];
  for (const item of ACCESSORY_SIGNALS) {
    for (const pattern of item.patterns) {
      if (pattern.test(normText)) {
        if (!detected.includes(item.type)) {
          detected.push(item.type);
        }
        break;
      }
    }
  }
  return detected;
}

/**
 * Extract storage and RAM specifications
 */
function extractMemorySpecs(normText) {
  let storage = null;
  let ram = null;

  // Explicit storage patterns: e.g. "128gb storage", "rom 128gb", "128gb rom"
  const explicitStorageMatch = normText.match(/\b(\d+(?:gb|tb))\s*(?:storage|rom|internal\s*memory)\b/i) ||
                               normText.match(/\b(?:storage|rom|internal\s*memory)\s*(\d+(?:gb|tb))\b/i);
  if (explicitStorageMatch) {
    storage = explicitStorageMatch[1].toUpperCase();
  }

  // Explicit RAM patterns: e.g. "8gb ram", "ram 8gb", "16gb unified memory"
  const explicitRamMatch = normText.match(/\b(\d+(?:gb|mb))\s*(?:ram|memory|unified\s*memory)\b/i) ||
                           normText.match(/\b(?:ram)\s*(\d+(?:gb|mb))\b/i);
  if (explicitRamMatch) {
    ram = explicitRamMatch[1].toUpperCase();
  }

  // Dual memory pattern: e.g. "8gb/128gb", "8gb + 128gb", "16gb/512gb"
  const dualMatch = normText.match(/\b(\d+gb)\s*[\/|+&]\s*(\d+(?:gb|tb))\b/i);
  if (dualMatch) {
    const val1 = dualMatch[1].toUpperCase();
    const val2 = dualMatch[2].toUpperCase();
    // Usually smaller is RAM, larger is Storage
    const num1 = parseInt(val1);
    const num2 = val2.endsWith('TB') ? parseInt(val2) * 1024 : parseInt(val2);
    if (num1 <= 32 && num2 >= 64) {
      if (!ram) ram = val1;
      if (!storage) storage = val2;
    } else {
      if (!storage) storage = val2;
    }
  }

  // General standalone memory matches if not explicitly tagged
  if (!storage) {
    // Typical storage sizes: 32gb, 64gb, 128gb, 256gb, 512gb, 1tb, 2tb
    const storageMatch = normText.match(/\b(32gb|64gb|128gb|256gb|512gb|1tb|2tb)\b/i);
    if (storageMatch) {
      storage = storageMatch[1].toUpperCase();
    }
  }

  if (!ram) {
    // If we have a standalone RAM size like 16gb, 8gb, 24gb, 32gb
    const ramMatch = normText.match(/\b(4gb|6gb|8gb|12gb|16gb|18gb|24gb|32gb|64gb)\b/i);
    if (ramMatch) {
      const candidate = ramMatch[1].toUpperCase();
      // Only set as RAM if it is not already used as storage
      if (candidate !== storage) {
        ram = candidate;
      }
    }
  }

  return { storage, ram };
}

/**
 * Extract chipset/processor details (e.g. M1, M2, M3, M3 Pro, Snapdragon 8 Gen 3)
 */
function extractChipset(normText) {
  const chipMatch = normText.match(/\b(m[1-4](?:\s*(?:pro|max|ultra))?)\b/i) ||
                    normText.match(/\b(snapdragon\s*\d+\s*(?:gen\s*\d+)?)\b/i) ||
                    normText.match(/\b(intel\s*core\s*i[3579]|i[3579]-?\d{4,5}[a-z]?)\b/i) ||
                    normText.match(/\b(ryzen\s*[3579]\s*\d{4}[a-z]?)\b/i) ||
                    normText.match(/\b(a1[5-8]\s*(?:bionic|pro)?)\b/i) ||
                    normText.match(/\b(tensor\s*g[1-4])\b/i);
  return chipMatch ? chipMatch[1].toUpperCase().replace(/\s+/g, ' ') : null;
}

/**
 * Extract display size (e.g. 13.6inch, 15.6inch, 14inch, 16inch)
 */
function extractDisplaySize(normText) {
  const sizeMatch = normText.match(/\b(\d+(?:\.\d+)?inch)\b/i);
  return sizeMatch ? sizeMatch[1].toLowerCase() : null;
}

/**
 * Extract product condition: New, Refurbished, Used
 */
function extractCondition(normText) {
  if (/\b(?:refurbished|renewed|pre-?owned|second\s*hand)\b/i.test(normText)) {
    return 'Refurbished';
  }
  if (/\b(?:used|unboxed)\b/i.test(normText)) {
    return 'Used';
  }
  return 'New';
}

/**
 * Extract color from title
 */
function extractColor(normText) {
  for (const color of COLORS) {
    const regex = new RegExp(`\\b${color}\\b`, 'i');
    if (regex.test(normText)) {
      return color.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return null;
}

/**
 * Extract model modifiers like Pro, Max, Plus, Ultra, Mini, FE, SE, Air
 */
function extractModelModifiers(normText) {
  const modifiers = [];
  for (const mod of MODEL_MODIFIERS) {
    const regex = new RegExp(`\\b${mod}\\b`, 'i');
    if (regex.test(normText)) {
      if (!modifiers.some(existing => existing.includes(mod))) {
        modifiers.push(mod);
      }
    }
  }
  return modifiers;
}

/**
 * Extract core model identifier from text
 */
function extractModelName(normText, brand) {
  // Common specific series regex
  // iPhone: iphone 11, 12, 13, 14, 15, 16, se
  const iphoneMatch = normText.match(/\b(iphone\s*(?:se|\d{1,2}))(?:\s*(pro\s*max|pro|plus|mini))?\b/i);
  if (iphoneMatch) {
    const base = iphoneMatch[1].replace(/\s+/g, ' ');
    const modifier = iphoneMatch[2] ? ` ${iphoneMatch[2].replace(/\s+/g, ' ')}` : '';
    return (base + modifier).trim();
  }

  // Samsung Galaxy: galaxy s20, s21, s22, s23, s24, z fold 5, z flip 5, a55, etc.
  const galaxyMatch = normText.match(/\b(galaxy\s*(?:[szfa]\d{1,2}|z\s*(?:fold|flip)\s*\d?))(?:\s*(ultra|plus|\+|fe))?\b/i);
  if (galaxyMatch) {
    const base = galaxyMatch[1].replace(/\s+/g, ' ');
    const modifier = galaxyMatch[2] ? ` ${galaxyMatch[2]}` : '';
    return (base + modifier).trim();
  }

  // MacBook Air / Pro
  const macbookMatch = normText.match(/\b(macbook\s*(?:air|pro))(?:\s*(m[1-4]))?\b/i);
  if (macbookMatch) {
    const base = macbookMatch[1].replace(/\s+/g, ' ');
    const chip = macbookMatch[2] ? ` ${macbookMatch[2].toUpperCase()}` : '';
    return (base + chip).trim();
  }

  // Sony headphones: WH-1000XM5, WF-1000XM5, WH-CH720N
  const sonyAudioMatch = normText.match(/\b(w[hf][- ]?1000xm[3-5]|wh[- ]?ch\d{3}[a-z]?)\b/i);
  if (sonyAudioMatch) {
    return sonyAudioMatch[1].toUpperCase().replace(/\s+/, '-');
  }

  // AirPods: AirPods Pro 2, AirPods 3, AirPods Max
  const airpodsMatch = normText.match(/\b(airpods(?:\s*pro\s*\d?|\s*max|\s*\d)?)\b/i);
  if (airpodsMatch) {
    return airpodsMatch[1].trim();
  }

  // Generic model capture: looks for model-like alphanumeric patterns
  return null;
}

/**
 * Main attribute extraction function
 */
function extractAttributes(rawText) {
  const normalized = normalizeTitle(rawText);
  const brand = extractBrand(normalized);
  const accessories = extractAccessoryTypes(normalized);
  const { storage, ram } = extractMemorySpecs(normalized);
  const chipset = extractChipset(normalized);
  const displaySize = extractDisplaySize(normalized);
  const condition = extractCondition(normalized);
  const color = extractColor(normalized);
  const modelModifiers = extractModelModifiers(normalized);
  const modelName = extractModelName(normalized, brand);

  return {
    rawText: rawText || '',
    normalizedText: normalized,
    brand,
    modelName,
    modelModifiers,
    storage,
    ram,
    chipset,
    displaySize,
    condition,
    color,
    accessories,
    isAccessory: accessories.length > 0
  };
}

module.exports = {
  extractAttributes,
  extractBrand,
  extractModelName,
  extractMemorySpecs,
  extractAccessoryTypes,
  extractModelModifiers
};
