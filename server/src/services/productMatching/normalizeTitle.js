/**
 * normalizeTitle.js
 * 
 * Cleans, canonicalizes, and standardizes product titles and query strings.
 * Handles inconsistent retailer formatting, spacing, and unit representations.
 */

/**
 * Normalize basic text: lowercases, removes non-alphanumeric noise,
 * standardizes whitespace, while preserving hyphens and slashes in model names.
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[()[\]{}]/g, ' ')            // Replace brackets with spaces
    .replace(/[,;:@_=+*~`!#$%^&?<>|]/g, ' ') // Strip special punctuation
    .replace(/\s+/g, ' ')                   // Normalize multiple spaces
    .trim();
}

/**
 * Standardize common technology units and variations:
 * e.g., "128 gb" -> "128gb", "1 tb" -> "1tb", "16 gb ram" -> "16gb ram", "15.6 inch" -> "15.6inch"
 */
function standardizeUnits(text) {
  if (!text) return '';
  let str = text;

  // Storage and RAM: 128 gb, 128-gb, 128GB -> 128gb
  str = str.replace(/(\d+)\s*[-_]?\s*(gb|tb|mb)\b/gi, '$1$2');

  // Display size: 15.6 inch, 15.6-inch, 15.6" -> 15.6inch
  str = str.replace(/(\d+(?:\.\d+)?)\s*[-_]?\s*(?:inch(?:es)?|["'”])\b/gi, '$1inch');

  // Generation: 2nd gen, 2nd generation, gen 2 -> 2nd gen
  str = str.replace(/\b(\d+)(?:st|nd|rd|th)?\s*gen(?:eration)?\b/gi, '$1gen');

  // Chipsets: M-1, M 2, M-3 -> m1, m2, m3
  str = str.replace(/\bm\s*[-_]?\s*([1-4])\b/gi, 'm$1');

  return str;
}

/**
 * Full title normalization pipeline
 */
function normalizeTitle(rawTitle) {
  if (!rawTitle) return '';
  const cleaned = normalizeString(rawTitle);
  return standardizeUnits(cleaned);
}

/**
 * Tokenize string into an array of meaningful words/tokens
 */
function tokenize(text) {
  const norm = normalizeTitle(text);
  if (!norm) return [];
  return norm.split(/\s+/).filter(token => token.length > 0);
}

/**
 * Calculate Jaccard similarity between two token sets (0.0 to 1.0)
 */
function tokenJaccardSimilarity(textA, textB) {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
  if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Levenshtein distance for fuzzy string comparison
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy similarity ratio between 0.0 and 1.0
 */
function stringSimilarity(strA, strB) {
  const a = normalizeTitle(strA);
  const b = normalizeTitle(strB);
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

module.exports = {
  normalizeString,
  standardizeUnits,
  normalizeTitle,
  tokenize,
  tokenJaccardSimilarity,
  stringSimilarity
};
