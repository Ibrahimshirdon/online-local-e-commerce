const db = require('../config/db');
const collectionName = 'activity_logs';

class ActivityLog {
    static async create(data) {
        const { user_id, action, details } = data;
        await db.collection(collectionName).add({
            user_id: user_id ? user_id.toString() : null,
            action,
            details,
            created_at: new Date().toISOString()
        });
    }

    static async find() {
        const snapshot = await db.collection(collectionName).orderBy('created_at', 'desc').get();
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        for (let log of results) {
            if (log.user_id) {
                const userDoc = await db.collection('users').doc(log.user_id).get();
                if (userDoc.exists) {
                    const uData = userDoc.data();
                    log.user_id = { id: userDoc.id, name: uData.name, email: uData.email };
                }
            }
        }
        return results;
    }
}

module.exports = ActivityLog;

