const db = require('../config/db');
const collectionName = 'favorites';

class Favorite {
    static async findOne(query) {
        const { user_id, product_id } = query;
        if (!user_id || !product_id) return null;
        const snapshot = await db.collection(collectionName)
            .where('user_id', '==', user_id.toString())
            .where('product_id', '==', product_id.toString())
            .limit(1).get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    static async create(data) {
        const { user_id, product_id } = data;
        const docRef = await db.collection(collectionName).add({
            user_id: user_id.toString(),
            product_id: product_id.toString(),
            created_at: new Date().toISOString()
        });
        return { id: docRef.id, user_id, product_id };
    }

    static async findByIdAndDelete(id) {
        if (!id) return;
        await db.collection(collectionName).doc(id.toString()).delete();
    }

    static async find(query) {
        if (query.user_id) {
            const snapshot = await db.collection(collectionName)
                .where('user_id', '==', query.user_id.toString())
                .get();
                
            let results = [];
            for (let doc of snapshot.docs) {
                const favData = doc.data();
                
                // Fetch product
                const productSnap = await db.collection('products').doc(favData.product_id).get();
                if (productSnap.exists) {
                    const productData = productSnap.data();
                    let shopData = {};
                    
                    if (productData.shop_id) {
                        const shopSnap = await db.collection('shops').doc(productData.shop_id).get();
                        if (shopSnap.exists) {
                            shopData = shopSnap.data();
                        }
                    }

                    results.push({
                        _id: doc.id,
                        product_id: {
                            id: productSnap.id,
                            _id: productSnap.id,
                            name: productData.name,
                            price: productData.price,
                            description: productData.description,
                            shop_id: { name: shopData.name, logo_url: shopData.logo_url },
                            images: productData.images || []
                        }
                    });
                }
            }
            return results;
        }
        return [];
    }
}

module.exports = Favorite;

