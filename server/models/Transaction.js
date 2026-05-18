const db = require('../config/db');
const collectionName = 'transactions';

class Transaction {
    static async create(data) {
        const { shop_id, amount, type, description } = data;
        await db.collection(collectionName).add({
            shop_id: shop_id ? shop_id.toString() : null,
            amount: Number(amount),
            type,
            description,
            created_at: new Date().toISOString()
        });
    }

    static async find(query = {}) {
        const snapshot = await db.collection(collectionName).orderBy('created_at', 'desc').get();
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        for (let t of results) {
            if (t.shop_id) {
                const shopDoc = await db.collection('shops').doc(t.shop_id).get();
                if (shopDoc.exists) {
                    t.shop_id = { id: shopDoc.id, name: shopDoc.data().name };
                }
            }
        }
        return results;
    }
}

module.exports = Transaction;

