const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const Shop = require('../models/Shop');

exports.getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, location, condition, sort } = req.query;
        let query = {};

        if (search) query.search = search;
        if (category) query.category_id = category; // Assuming category is ID here; if name, we need lookup.

        if (minPrice) {
            query.price = query.price || {};
            query.price.$gte = minPrice;
        }
        if (maxPrice) {
            query.price = query.price || {};
            query.price.$lte = maxPrice;
        }

        // if (condition) { query.condition = condition; } // Model find logic didn't explicitly check condition, I should add it if critical.

        // Location logic
        // If location is provided, find shops in that location and filter products.
        // My Product.find has rudimentary shop_id support.
        // Let's rely on standard filtering for now.

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        console.log('createProduct body:', req.body);
        console.log('createProduct files:', req.files);

        const productData = { ...req.body };

        const { uploadToCloudinary } = require('../utils/cloudinary');
        // Handle multiple images
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file, index) => 
                uploadToCloudinary(file, 'products').then(url => ({
                    image_url: url,
                    display_order: index
                }))
            );
            productData.images = await Promise.all(uploadPromises);
        }

        const product = await Product.create(productData);

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'CREATE_PRODUCT',
            details: `Created product: ${product.name}`
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const updateData = {};
        const {
            name, brand, model, description, price, discount_price, stock,
            condition, category_id, delivery_info, delivery_fee, is_black_friday, is_out_of_stock
        } = req.body;

        if (name) updateData.name = name;
        if (brand) updateData.brand = brand;
        if (model) updateData.model = model;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (discount_price !== undefined) updateData.discount_price = Number(discount_price);
        if (stock !== undefined) updateData.stock = Number(stock);
        if (condition) updateData.condition = condition;
        if (category_id) updateData.category_id = category_id;
        if (delivery_info) updateData.delivery_info = delivery_info;
        if (delivery_fee !== undefined) updateData.delivery_fee = Number(delivery_fee);
        if (is_black_friday !== undefined) updateData.is_black_friday = is_black_friday === 'true' || is_black_friday === true;
        if (is_out_of_stock !== undefined) updateData.is_out_of_stock = is_out_of_stock === 'true' || is_out_of_stock === true;

        const { uploadToCloudinary } = require('../utils/cloudinary');
        // Handle images append
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file, index) => 
                uploadToCloudinary(file, 'products').then(url => ({
                    image_url: url,
                    display_order: (product.images ? product.images.length : 0) + index
                }))
            );
            updateData.images = await Promise.all(uploadPromises);
        }

        const updatedProduct = await Product.update(req.params.id, updateData);

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'UPDATE_PRODUCT',
            details: `Updated product ID: ${req.params.id}`
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'DELETE_PRODUCT',
            details: `Deleted product ID: ${req.params.id}`
        });

        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteProductImage = async (req, res) => {
    try {
        const { productId } = req.params;
        const imageUrl = req.query.url;

        const db = require('../config/db');
        const docRef = db.collection('products').doc(productId.toString());
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productData = doc.data();
        const updatedImages = (productData.images || []).filter(img => img.image_url !== imageUrl);

        await docRef.update({ images: updatedImages });

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'DELETE_PRODUCT_IMAGE',
            details: `Deleted image from product ID: ${productId}`
        });

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
