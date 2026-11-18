/**
 * productRoutes.js
 * 
 * Express routes for product comparison, matching, and trending searches.
 */

const express = require('express');
const router = express.Router();
const { searchAndMatchProducts } = require('../controllers/productController');
const { handleTrending, handleHealth } = require('../controllers/compareController');

router.get('/search', searchAndMatchProducts);
router.post('/compare', searchAndMatchProducts);
router.get('/trending', handleTrending);
router.get('/health', handleHealth);

module.exports = router;
