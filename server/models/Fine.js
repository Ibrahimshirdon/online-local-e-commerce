const db = require('../config/db');
const collectionName = 'fines';

class Fine {
    static async create(data) {
        const { shop_id, amount, reason } = data;
        await db.collection(collectionName).add({
            shop_id: shop_id ? shop_id.toString() : null,
            amount: Number(amount),
            reason,
            created_at: new Date().toISOString()
        });
    }

    static async find(query) {
        if (query.shop_id) {
            const snapshot = await db.collection(collectionName)
                .where('shop_id', '==', query.shop_id.toString())
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return [];
    }
}

module.exports = Fine;

