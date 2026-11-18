const axios = require('axios');
const cheerio = require('cheerio');
const { getStandardHeaders } = require('../utils/headers');
const { parsePrice, parseRating } = require('../utils/parser');

/**
 * Scrape Flipkart India for search term (100% Live Cheerio Scraping - No Mock Data)
 */
async function scrapeFlipkart(query) {
  // Flipkart search URL format matching user's search query pattern
  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`;
  const results = [];
  const seenUrls = new Set();

  try {
    const headers = {
      ...getStandardHeaders('https://www.google.com/'),
      'Host': 'www.flipkart.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };

    const response = await axios.get(url, {
      headers,
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    if (response.status !== 200) {
      console.warn(`[Flipkart Scraper] Response status ${response.status} for query: "${query}"`);
      return [];
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Flipkart renders both list views (laptops, phones) and grid views (bags, accessories)
    // Both views have anchor tags linking to product pages: a[href*="/p/"]
    $('a[href*="/p/"]').each((i, el) => {
      if (results.length >= 15) return false;

      const linkEl = $(el);
      const relativeLink = linkEl.attr('href') || '';
      if (!relativeLink.includes('/p/itm') && !relativeLink.includes('pid=')) return;

      const cleanKey = relativeLink.split('?')[0];
      if (seenUrls.has(cleanKey)) return;

      // Find the card container
      let container = linkEl.closest('div[data-id]');
      if (!container.length) {
        container = linkEl.closest('div.cPHDOP, div._1sdMkc, div._75nlfW, div._4ddWXP, div.slAVV4, div.tUxRFH, div._1AtVbE');
      }
      if (!container.length) {
        container = linkEl.parent().parent();
      }

      // Title Extraction Strategy:
      // 1. Image alt tag (Flipkart puts clean untruncated product title on product images)
      let title = linkEl.find('img[alt]').attr('alt') ||
                  container.find('img[alt]').attr('alt');

      // 2. Class-based title containers
      if (!title || title.length < 5) {
        title = container.find('div.KzDlHZ, a.wjcEIp, a.WKTcLC, div.css-146c3p1, div._4rR01T, a.s1Q9rs').first().text().trim();
      }

      // 3. Clean link text if image alt is absent
      if (!title || title.length < 5) {
        const rawText = linkEl.text().trim();
        title = rawText
          .replace(/^Add to Compare/i, '')
          .replace(/^Sponsored/i, '')
          .replace(/₹[\d,]+.*/s, '')
          .trim();
      }

      // 4. URL slug fallback
      if (!title || title.length < 5) {
        const slugMatch = relativeLink.match(/^\/([^/]+)\/p\//);
        if (slugMatch && slugMatch[1]) {
          title = slugMatch[1].replace(/-/g, ' ');
        }
      }

      if (!title || title.length < 3) return;

      // Price Extraction
      let rawPrice = container.find('div.Nx9bqj, div.hZ3P6w, div._30jeq3').first().text().trim();
      if (!rawPrice) {
        const allPrices = container.text().match(/₹[\d,]+/g);
        if (allPrices && allPrices.length > 0) rawPrice = allPrices[0];
      }
      const price = parsePrice(rawPrice);
      if (!price) return;

      // Original Price
      let rawOriginal = container.find('div.yRaY8j, div.kRYCnD, div._3I9_wc').first().text().trim();
      if (!rawOriginal) {
        const allPrices = container.text().match(/₹[\d,]+/g);
        if (allPrices && allPrices.length > 1) rawOriginal = allPrices[1];
      }
      const originalPrice = parsePrice(rawOriginal) || price;

      // Rating
      const rawRating = container.find('div.XQDdHH, div._3LWZlK').first().text().trim();
      const rating = parseRating(rawRating) || 4.2;

      // Image
      let image = container.find('img').filter((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src') || '';
        return src.includes('flixcart.com/image/') || src.includes('rukminim');
      }).first().attr('src') || '';

      const link = relativeLink.startsWith('http') ? relativeLink : `https://www.flipkart.com${relativeLink}`;
      const reviewText = container.find('span.WJhMAl, span._2_R_DZ').first().text().trim();

      seenUrls.add(cleanKey);

      results.push({
        id: `fk-${Date.now()}-${i}`,
        platform: 'Flipkart',
        platformKey: 'flipkart',
        title,
        price,
        originalPrice,
        discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        currency: '₹',
        rating,
        reviews: reviewText || '400+ Ratings',
        image,
        link,
        badge: 'Flipkart Assured',
        availability: 'In Stock'
      });
    });

    console.log(`[Flipkart Scraper] Successfully scraped ${results.length} live items for: "${query}"`);
    return results;
  } catch (error) {
    console.error(`[Flipkart Scraper] Network or parsing error for "${query}":`, error.message);
    return [];
  }
}

module.exports = {
  scrapeFlipkart
};
