const db = require('../config/db');
const collectionName = 'reports';

class Report {
    static async create(data) {
        const { reporter_id, shop_id, reason, description } = data;
        await db.collection(collectionName).add({
            reporter_id: reporter_id ? reporter_id.toString() : null,
            shop_id: shop_id ? shop_id.toString() : null,
            reason,
            description,
            status: 'pending',
            created_at: new Date().toISOString()
        });
    }

    static async find() {
        const snapshot = await db.collection(collectionName).orderBy('created_at', 'desc').get();
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (let r of results) {
            if (r.reporter_id) {
                const userDoc = await db.collection('users').doc(r.reporter_id).get();
                if (userDoc.exists) {
                    const uData = userDoc.data();
                    r.reporter_id = { id: userDoc.id, name: uData.name, email: uData.email };
                }
            }
            if (r.shop_id) {
                const shopDoc = await db.collection('shops').doc(r.shop_id).get();
                if (shopDoc.exists) {
                    r.shop_id = { id: shopDoc.id, name: shopDoc.data().name };
                }
            }
        }
        return results;
    }

    static async findByIdAndUpdate(id, data, options) {
        if (!id) return null;
        const docRef = db.collection(collectionName).doc(id.toString());
        if (data.status) {
            await docRef.update({ status: data.status });
        }
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    static async countDocuments(query) {
        let collectionRef = db.collection(collectionName);
        if (query.shop_id) {
            collectionRef = collectionRef.where('shop_id', '==', query.shop_id.toString());
        }
        if (query.status) {
            collectionRef = collectionRef.where('status', '==', query.status);
        }
        const snapshot = await collectionRef.count().get();
        return snapshot.data().count;
    }
}

module.exports = Report;

