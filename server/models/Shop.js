const admin = require('firebase-admin');
const db = require('../config/db');
const collectionName = 'shops';

class Shop {
    static async create(data) {
        const { owner_id, name, description, location, phone, license, logo_url } = data;
        const newShop = {
            owner_id,
            name,
            description,
            location,
            phone,
            license,
            logo_url,
            status: 'pending',
            views: 0,
            created_at: new Date().toISOString()
        };
        const docRef = await db.collection(collectionName).add(newShop);
        return this.findById(docRef.id);
    }

    static async findById(id) {
        if (!id) return null;
        const doc = await db.collection(collectionName).doc(id.toString()).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findOne(query) {
        if (query.owner_id) {
            const snapshot = await db.collection(collectionName).where('owner_id', '==', query.owner_id).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
        }
        return null;
    }

    static async incrementViews(id) {
        if (!id) return;
        const docRef = db.collection(collectionName).doc(id.toString());
        await docRef.update({
            views: admin.firestore.FieldValue.increment(1)
        });

        // Daily views in a subcollection
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dailyRef = docRef.collection('daily_views').doc(today);
        
        await dailyRef.set({
            view_date: today,
            view_count: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
    }

    static async getDailyViews(shopId) {
        if (!shopId) return [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateStr = sevenDaysAgo.toISOString().split('T')[0];

        const snapshot = await db.collection(collectionName).doc(shopId.toString())
            .collection('daily_views')
            .where('view_date', '>=', dateStr)
            .orderBy('view_date', 'asc')
            .get();

        return snapshot.docs.map(doc => doc.data());
    }

    static async findByIdAndUpdate(id, data, options) {
        if (!id) return null;
        const docRef = db.collection(collectionName).doc(id.toString());
        
        let updateData = { ...data };
        
        if (data.$inc) {
            delete updateData.$inc;
            for (const [key, value] of Object.entries(data.$inc)) {
                updateData[key] = admin.firestore.FieldValue.increment(value);
            }
        }

        if (Object.keys(updateData).length > 0) {
            await docRef.update(updateData);
        }
        
        return this.findById(id);
    }

    static async findByIdAndDelete(id) {
        if (!id) return null;
        await db.collection(collectionName).doc(id.toString()).delete();
        return true;
    }

    static async find(query = {}) {
        let collectionRef = db.collection(collectionName);
        
        if (query.status) {
            collectionRef = collectionRef.where('status', '==', query.status);
        }
        
        const snapshot = await collectionRef.get();
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // In-memory filter for regex if needed (since Firestore doesn't support LIKE natively)
        if (query.location && typeof query.location === 'object' && query.location.$regex) {
            const regex = new RegExp(query.location.$regex, query.location.$options || 'i');
            results = results.filter(shop => regex.test(shop.location));
        }

        return results;
    }

    static async countDocuments() {
        const snapshot = await db.collection(collectionName).count().get();
        return snapshot.data().count;
    }
}

module.exports = Shop;

