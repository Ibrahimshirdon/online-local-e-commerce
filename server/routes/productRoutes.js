const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage } = require('../controllers/productController');
const { protect, admin, seller } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getProducts).post(protect, seller, upload.array('images', 5), createProduct);
router.route('/:id').get(getProductById).put(protect, seller, upload.array('images', 5), updateProduct).delete(protect, seller, deleteProduct);
router.delete('/:productId/images', protect, seller, deleteProductImage);

module.exports = router;
