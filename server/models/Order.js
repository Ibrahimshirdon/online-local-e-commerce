const db = require('../config/db');
const collectionName = 'orders';

class Order {
    static async create(data) {
        const { user_id, shop_id, total_amount, payment_method, payment_status, status, shipping_address, phone } = data;
        const newOrder = {
            user_id: user_id ? user_id.toString() : null,
            shop_id: shop_id ? shop_id.toString() : null,
            total_amount: Number(total_amount),
            payment_method,
            payment_status,
            status: status || 'pending',
            shipping_address: typeof shipping_address === 'string' ? JSON.parse(shipping_address) : shipping_address,
            phone,
            created_at: new Date().toISOString()
        };
        const docRef = await db.collection(collectionName).add(newOrder);
        return docRef.id;
    }

    static async findById(id) {
        if (!id) return null;
        const doc = await db.collection(collectionName).doc(id.toString()).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findByUserId(userId) {
        if (!userId) return [];
        const snapshot = await db.collection(collectionName)
            .where('user_id', '==', userId.toString())
            .get();

        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort in memory to avoid requiring a Firestore composite index
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Fetch shop name
        for (let order of results) {
            if (order.shop_id) {
                const shopDoc = await db.collection('shops').doc(order.shop_id).get();
                if (shopDoc.exists) {
                    order.shop_name = shopDoc.data().name;
                }
            }
        }
        return results;
    }

    static async findByShopId(shopId) {
        if (!shopId) return [];
        const snapshot = await db.collection(collectionName)
            .where('shop_id', '==', shopId.toString())
            .get();

        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort in memory to avoid requiring a Firestore composite index
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Fetch customer name
        for (let order of results) {
            if (order.user_id) {
                const userDoc = await db.collection('users').doc(order.user_id).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    order.customer_name = userData.name;
                    order.customer_email = userData.email;
                }
            }
        }
        return results;
    }

    static async updateStatus(id, status) {
        if (!id) return null;
        await db.collection(collectionName).doc(id.toString()).update({ status });
        return this.findById(id);
    }
}

module.exports = Order;

