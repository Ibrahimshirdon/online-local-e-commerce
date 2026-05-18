const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, paymentMethod, totalPrice, shippingAddress } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Group items by shop to create separate orders per shop
        const itemsByShop = orderItems.reduce((acc, item) => {
            let shopId = item.shop_id || (item.product ? item.product.shop_id : null);

            // Fix for legacy cart items or populated shop objects:
            // valid shop_id should be a primitive (string/number). If it's an object, extract .id or ._id
            if (shopId && typeof shopId === 'object') {
                shopId = shopId.id || shopId._id;
            }

            console.log(`Processing item. Product ID: ${item.product?.id}, Shop ID found: ${shopId}`);
            if (!shopId) {
                console.error('WARNING: Item has no shop_id!', item);
                return acc; // Skip items without shop_id or handle error
            }
            if (!acc[shopId]) acc[shopId] = [];
            acc[shopId].push(item);
            return acc;
        }, {});

        console.log('Items grouped by shop:', Object.keys(itemsByShop));

        const createdOrders = [];

        for (const shopId of Object.keys(itemsByShop)) {
            const shopItems = itemsByShop[shopId];
            const shopTotal = shopItems.reduce((sum, item) => {
                // Use discount price if available, otherwise regular price
                const finalPrice = item.product.discount_price > 0 ? item.product.discount_price : item.product.price;
                return sum + (finalPrice * item.qty);
            }, 0);

            // Create Order
            const orderId = await Order.create({
                user_id: req.user.id,
                shop_id: shopId,
                total_amount: shopTotal,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'online' ? 'paid' : 'pending',
                status: 'pending',
                shipping_address: shippingAddress,
                phone: shippingAddress ? shippingAddress.phone : null // Extract phone from address object
            });

            // Create Order Items and Update Stock
            for (const item of shopItems) {
                const finalPrice = item.product.discount_price > 0 ? item.product.discount_price : item.product.price;
                await OrderItem.create({
                    order_id: orderId,
                    product_id: item.product_id || item.product.id,
                    quantity: item.qty,
                    price: finalPrice
                });

                // Decrease stock (Simulated for now, would be good to have a method in Product model)
                // await Product.decreaseStock(item.product.id, item.qty); 
            }

            createdOrders.push(orderId);
        }

        res.status(201).json({ message: 'Order created', orderIds: createdOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findByUserId(req.user.id);

        // Populate items for each order (manual population since it's SQL)
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem.findByOrderId(order.id);
            return { ...order, items };
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get orders for a shop (Seller)
// @route   GET /api/orders/shop/:shopId
// @access  Private/Seller
exports.getShopOrders = async (req, res) => {
    try {
        console.log(`Fetching orders for shopId param: ${req.params.shopId}, User: ${req.user.id}`);
        // First verify this shop belongs to the user
        const shop = await Shop.findOne({ owner_id: req.user.id });
        console.log('Found shop for user:', shop);

        if (!shop || shop.id != req.params.shopId) {
            console.log('Authorization failed. Shop ID mismatch or no shop found.');
            return res.status(401).json({ message: 'Not authorized to view these orders' });
        }

        const orders = await Order.findByShopId(req.params.shopId);
        console.log(`Found ${orders.length} orders for shop ${req.params.shopId}`);

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem.findByOrderId(order.id);
            return { ...order, items };
        }));

        res.json(ordersWithItems);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization (Shop owner or Admin)
        const shop = await Shop.findOne({ owner_id: req.user.id });
        if (req.user.role !== 'admin' && (!shop || shop.id !== order.shop_id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedOrder = await Order.updateStatus(req.params.id, status);
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
