const admin = require('firebase-admin');
const db = require('../config/db');
const collectionName = 'products';

class Product {
    static async create(data) {
        const { shop_id, category_id, name, brand, model, description, price, discount_price, stock, condition, delivery_info, delivery_fee, is_black_friday, is_out_of_stock } = data;

        const newProduct = {
            shop_id,
            category_id,
            name,
            brand: brand || null,
            model: model || null,
            description,
            price: Number(price),
            discount_price: discount_price ? Number(discount_price) : null,
            stock: stock ? Number(stock) : 0,
            condition: condition || 'new',
            delivery_info: delivery_info || null,
            delivery_fee: delivery_fee ? Number(delivery_fee) : 0,
            is_black_friday: is_black_friday === 'true' || is_black_friday === true,
            is_out_of_stock: is_out_of_stock === 'true' || is_out_of_stock === true,
            images: data.images || [], // Store images as array in Firestore
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection(collectionName).add(newProduct);
        return this.findById(docRef.id);
    }

    static async findById(id) {
        if (!id) return null;
        const doc = await db.collection(collectionName).doc(id.toString()).get();
        if (!doc.exists) return null;

        const product = { id: doc.id, ...doc.data() };

        // Fetch referenced shop and category
        if (product.shop_id) {
            const shopDoc = await db.collection('shops').doc(product.shop_id).get();
            if (shopDoc.exists) {
                const shopData = shopDoc.data();
                product.shop_id = {
                    id: shopDoc.id,
                    _id: shopDoc.id,
                    name: shopData.name,
                    logo_url: shopData.logo_url,
                    location: shopData.location,
                    phone: shopData.phone
                };
            }
        }

        if (product.category_id) {
            const catDoc = await db.collection('categories').doc(product.category_id).get();
            if (catDoc.exists) {
                product.category_id = {
                    id: catDoc.id,
                    _id: catDoc.id,
                    name: catDoc.data().name
                };
            }
        }

        return product;
    }

    static async update(id, data) {
        if (!id) return null;
        const docRef = db.collection(collectionName).doc(id.toString());
        
        let updateData = { ...data };
        
        // Handle images append
        if (data.images && data.images.length > 0) {
            updateData.images = admin.firestore.FieldValue.arrayUnion(...data.images);
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

    static async find(query = {}, sort = {}) {
        let collectionRef = db.collection(collectionName);
        
        if (query.category_id) {
            collectionRef = collectionRef.where('category_id', '==', query.category_id.toString());
        }

        if (query.shop_id) {
            if (typeof query.shop_id === 'object' && query.shop_id.$in) {
                collectionRef = collectionRef.where('shop_id', 'in', query.shop_id.$in.map(String));
            } else {
                collectionRef = collectionRef.where('shop_id', '==', query.shop_id.toString());
            }
        }

        if (query.price && query.price.$gte) {
            collectionRef = collectionRef.where('price', '>=', Number(query.price.$gte));
        }
        if (query.price && query.price.$lte) {
            // Firestore restricts multiple inequality filters to the same field, so this is okay if only price is filtered this way.
            collectionRef = collectionRef.where('price', '<=', Number(query.price.$lte));
        }

        const snapshot = await collectionRef.get();
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // In-memory filter for search (Firestore has no LIKE %search%)
        if (query.search) {
            const lowerSearch = query.search.toLowerCase();
            results = results.filter(p => 
                (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
                (p.brand && p.brand.toLowerCase().includes(lowerSearch)) ||
                (p.description && p.description.toLowerCase().includes(lowerSearch))
            );
        }

        // Fetch relational data for results (N+1, optimize by caching or dataloader if needed, but for now just fetch)
        for (let p of results) {
            if (p.shop_id && typeof p.shop_id === 'string') {
                const shopDoc = await db.collection('shops').doc(p.shop_id).get();
                if (shopDoc.exists) {
                    const shopData = shopDoc.data();
                    p.shop_id = { id: shopDoc.id, _id: shopDoc.id, name: shopData.name, logo_url: shopData.logo_url, location: shopData.location };
                }
            }
            if (p.category_id && typeof p.category_id === 'string') {
                const catDoc = await db.collection('categories').doc(p.category_id).get();
                if (catDoc.exists) {
                    p.category_id = { id: catDoc.id, _id: catDoc.id, name: catDoc.data().name };
                }
            }
        }

        return results;
    }

    static async countDocuments() {
        const snapshot = await db.collection(collectionName).count().get();
        return snapshot.data().count;
    }

    static async decreaseStock(id, quantity) {
        if (!id) return;
        const docRef = db.collection(collectionName).doc(id.toString());
        await docRef.update({
            stock: admin.firestore.FieldValue.increment(-Number(quantity))
        });
    }
}

module.exports = Product;

