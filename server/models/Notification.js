const db = require('../config/db');
const collectionName = 'notifications';

class Notification {
    static async create(data) {
        const { user_id, message } = data;
        await db.collection(collectionName).add({
            user_id: user_id ? user_id.toString() : null,
            message,
            is_read: false,
            created_at: new Date().toISOString()
        });
    }

    static async find(query) {
        if (query.user_id) {
            const snapshot = await db.collection(collectionName)
                .where('user_id', '==', query.user_id.toString())
                .orderBy('created_at', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return [];
    }

    static async findByIdAndUpdate(id, data) {
        if (!id) return;
        if (data.is_read) {
            await db.collection(collectionName).doc(id.toString()).update({ is_read: true });
        }
    }

    static async countDocuments(query) {
        if (query.user_id && query.is_read === false) {
            const snapshot = await db.collection(collectionName)
                .where('user_id', '==', query.user_id.toString())
                .where('is_read', '==', false)
                .count().get();
            return snapshot.data().count;
        }
        return 0;
    }
}

module.exports = Notification;

