const db = require('../config/db');
const collectionName = 'order_items';

class OrderItem {
    static async create(data) {
        const { order_id, product_id, quantity, price } = data;
        await db.collection(collectionName).add({
            order_id: order_id ? order_id.toString() : null,
            product_id: product_id ? product_id.toString() : null,
            quantity: Number(quantity),
            price: Number(price)
        });
    }

    static async findByOrderId(orderId) {
        if (!orderId) return [];
        const snapshot = await db.collection(collectionName)
            .where('order_id', '==', orderId.toString())
            .get();

        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch product info
        for (let item of results) {
            if (item.product_id) {
                const productDoc = await db.collection('products').doc(item.product_id).get();
                if (productDoc.exists) {
                    const pData = productDoc.data();
                    item.name = pData.name;
                    item.image_url = pData.images && pData.images.length > 0 ? pData.images[0].image_url : null;
                }
            }
        }
        return results;
    }
}

module.exports = OrderItem;

