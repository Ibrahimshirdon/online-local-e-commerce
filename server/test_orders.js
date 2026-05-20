require('dotenv').config();
const db = require('./config/db');

async function run() {
    console.log("Fetching orders...");
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    
    console.log(`Found ${orders.length} total orders in database.`);
    
    orders.forEach(order => {
        console.log(`Order ID: ${order.id} | User ID: ${order.user_id} | Shop ID: ${order.shop_id}`);
    });
    
    // Also fetch one user to see their ID
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (!usersSnapshot.empty) {
        console.log(`Example User ID: ${usersSnapshot.docs[0].id}`);
    }

    process.exit(0);
}

run().catch(console.error);
