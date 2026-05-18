const db = require('../config/db');
const collectionName = 'categories';

class Category {
    static async find(query = {}) {
        const snapshot = await db.collection(collectionName).orderBy('name', 'asc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async create(data) {
        const { name, image_url, icon } = data;
        const newDoc = { 
            name, 
            image_url: image_url || null, 
            icon: icon || null 
        };
        const docRef = await db.collection(collectionName).add(newDoc);
        return { id: docRef.id, ...newDoc };
    }

    static async findOne(query) {
        if (query.name) {
            const snapshot = await db.collection(collectionName).where('name', '==', query.name).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
        }
        return null;
    }
}

module.exports = Category;


