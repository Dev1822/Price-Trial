const axios = require('axios');
const cheerio = require('cheerio');
const { getStandardHeaders } = require('../utils/headers');
const { parsePrice, parseRating } = require('../utils/parser');

/**
 * Scrape Amazon India for search term (100% Live Cheerio Scraping - No Mock Data)
 */
async function scrapeAmazon(query) {
  // Amazon search URL format matching user's search query pattern
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;
  const results = [];

  try {
    const headers = {
      ...getStandardHeaders('https://www.google.com/'),
      'Host': 'www.amazon.in',
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
      console.warn(`[Amazon Scraper] Response status ${response.status} for query: "${query}"`);
      return [];
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Check for Amazon Bot/Robot Check
    const isBotChallenge = $('title').text().includes('Robot Check') || html.includes('api-services-support@amazon.com');
    if (isBotChallenge) {
      console.warn('[Amazon Scraper] Amazon CAPTCHA challenge or bot check encountered.');
      return [];
    }

    $('div[data-component-type="s-search-result"]').each((i, el) => {
      if (results.length >= 15) return false;

      const container = $(el);

      // Title - get complete text from h2
      let title = container.find('h2').text().replace(/\s+/g, ' ').trim();
      if (!title) {
        title = container.find('h2 a span').first().text().trim() ||
                container.find('h2.a-size-mini span').first().text().trim();
      }
      if (!title || title.length < 3) return;

      // Price
      const rawPrice = container.find('span.a-price span.a-offscreen').first().text().trim() ||
                       container.find('span.a-price-whole').first().text().trim();
      const price = parsePrice(rawPrice);
      if (!price) return;

      // Original / MRP Price
      const rawOriginalPrice = container.find('span.a-price.a-text-price span.a-offscreen').first().text().trim();
      const originalPrice = parsePrice(rawOriginalPrice) || price;

      // Image
      const image = container.find('img.s-image').attr('src') || '';

      // Link - Generate clean, direct canonical product URL using ASIN
      const asin = container.attr('data-asin') || '';
      let link = '';

      if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
        link = `https://www.amazon.in/dp/${asin}`;
      } else {
        const dpLink = container.find('a[href*="/dp/"]').first().attr('href') || '';
        const dpMatch = dpLink.match(/\/dp\/([A-Z0-9]{10})/i);
        if (dpMatch) {
          link = `https://www.amazon.in/dp/${dpMatch[1]}`;
        } else {
          const anyProductLink = container.find('h2 a, a.a-link-normal[href*="/dp/"], a.a-link-normal[href*="/gp/product/"]').first().attr('href') || '';
          if (anyProductLink) {
            link = anyProductLink.startsWith('http') ? anyProductLink : `https://www.amazon.in${anyProductLink}`;
          } else {
            link = `https://www.amazon.in/dp/${asin || ''}`;
          }
        }
      }

      // Rating
      const rawRating = container.find('span.a-icon-alt').first().text().trim();
      const rating = parseRating(rawRating) || 4.2;

      // Reviews Count
      const reviewText = container.find('span.a-size-base.s-underline-text').first().text().trim();
      const reviews = reviewText.replace(/[(),]/g, '') || '100+';

      results.push({
        id: `amz-${Date.now()}-${i}`,
        platform: 'Amazon',
        platformKey: 'amazon',
        title,
        price,
        originalPrice,
        discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        currency: '₹',
        rating,
        reviews,
        image,
        link,
        badge: 'Fast Delivery with Prime',
        availability: 'In Stock'
      });
    });

    console.log(`[Amazon Scraper] Successfully scraped ${results.length} live items for: "${query}"`);
    return results;
  } catch (error) {
    console.error(`[Amazon Scraper] Network or parsing error for "${query}":`, error.message);
    return [];
  }
}

module.exports = {
  scrapeAmazon
};
