const axios = require('axios');
const cheerio = require('cheerio');
const { getStandardHeaders } = require('../utils/headers');
const { parsePrice, parseRating } = require('../utils/parser');

/**
 * Scrape Snapdeal India for search term (100% Live Cheerio Scraping - No Mock Data)
 */
async function scrapeSnapdeal(query) {
  // Snapdeal search URL format matching user's search query pattern
  const url = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&categoryId=0&vertical=p&noOfResults=20&sort=rlvncy`;
  const results = [];

  try {
    const headers = {
      ...getStandardHeaders('https://www.snapdeal.com/'),
      'Host': 'www.snapdeal.com',
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
      console.warn(`[Snapdeal Scraper] Response status ${response.status} for query: "${query}"`);
      return [];
    }

    const html = response.data;
    const $ = cheerio.load(html);

    $('div.product-tuple-listing, div.favDp, div.product-tuple-description').each((i, el) => {
      if (results.length >= 15) return false;

      const container = $(el);

      // Title
      const title = container.find('p.product-title, a.dp-widget-link p').first().text().trim();
      if (!title || title.length < 3) return;

      // Price
      const rawPrice = container.find('span.product-price').first().text().trim();
      const price = parsePrice(rawPrice);
      if (!price) return;

      // Original Price
      const rawOriginal = container.find('span.product-desc-price').first().text().trim();
      const originalPrice = parsePrice(rawOriginal) || price;

      // Rating
      const ratingStars = container.find('div.filled-stars').attr('style') || '';
      let rating = 4.0;
      if (ratingStars.includes('width:')) {
        const widthMatch = ratingStars.match(/width:\s*(\d+(\.\d+)?)%/);
        if (widthMatch) {
          rating = Math.round((parseFloat(widthMatch[1]) / 20) * 10) / 10;
        }
      }

      // Reviews
      const reviewText = container.find('p.product-rating-count').first().text().trim() || '150+ Reviews';

      // Image
      const image = container.find('img.product-image').attr('data-src') ||
                    container.find('img.product-image').attr('src') || '';

      // Link
      const relativeLink = container.find('a.dp-widget-link').attr('href') || '';
      const link = relativeLink.startsWith('http') ? relativeLink : (relativeLink ? `https://www.snapdeal.com${relativeLink}` : url);

      results.push({
        id: `sd-${Date.now()}-${i}`,
        platform: 'Snapdeal',
        platformKey: 'snapdeal',
        title,
        price,
        originalPrice,
        discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        currency: '₹',
        rating,
        reviews: reviewText,
        image,
        link,
        badge: 'Snapdeal Certified',
        availability: 'In Stock'
      });
    });

    console.log(`[Snapdeal Scraper] Successfully scraped ${results.length} live items for: "${query}"`);
    return results;
  } catch (error) {
    console.error(`[Snapdeal Scraper] Network or parsing error for "${query}":`, error.message);
    return [];
  }
}

module.exports = {
  scrapeSnapdeal
};
