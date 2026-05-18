const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        console.log('Connecting to Firestore...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        const adminEmail = 'admin@gmail.com';
        
        // Check if admin exists
        const snapshot = await db.collection('users').where('email', '==', adminEmail).get();
        
        if (!snapshot.empty) {
            console.log('Admin user exists, updating password...');
            const docId = snapshot.docs[0].id;
            await db.collection('users').doc(docId).update({
                password: hashedPassword,
                role: 'admin'
            });
        } else {
            console.log('Creating admin user...');
            await db.collection('users').add({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                created_at: new Date().toISOString()
            });
        }
        console.log('Admin user ready: admin@gmail.com / 123456');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        process.exit();
    }
};

createAdmin();
