const db = require('../config/db');
const collectionName = 'users';

class User {
    static async create({ name, email, password, phone, role, profile_image }) {
        const newUser = {
            name,
            email,
            password,
            phone: phone || null,
            role: role || 'user',
            profile_image: profile_image || null,
            created_at: new Date().toISOString()
        };
        const docRef = await db.collection(collectionName).add(newUser);
        return { id: docRef.id, name, email, role: newUser.role };
    }

    static async findByEmail(email) {
        const snapshot = await db.collection(collectionName).where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async findByEmailOrName(identifier) {
        // Firestore doesn't support OR queries across different fields easily without composite indexes or client side merge.
        // We'll query both and merge.
        const emailSnap = await db.collection(collectionName).where('email', '==', identifier).limit(1).get();
        if (!emailSnap.empty) {
            const doc = emailSnap.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        
        const nameSnap = await db.collection(collectionName).where('name', '==', identifier).limit(1).get();
        if (!nameSnap.empty) {
            const doc = nameSnap.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        
        return null;
    }

    static async findById(id) {
        if (!id) return null;
        const doc = await db.collection(collectionName).doc(id.toString()).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findByIdAndUpdate(id, updateData) {
        if (!id) return null;
        const docRef = db.collection(collectionName).doc(id.toString());
        await docRef.update(updateData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    static async findByIdAndDelete(id) {
        if (!id) return null;
        await db.collection(collectionName).doc(id.toString()).delete();
        return true;
    }

    static async countDocuments() {
        // Firestore count query (available in recent SDKs)
        const snapshot = await db.collection(collectionName).count().get();
        return snapshot.data().count;
    }

    static async find() {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

module.exports = User;

