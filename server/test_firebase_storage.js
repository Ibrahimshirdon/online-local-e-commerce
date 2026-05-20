const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, 'firebase-adminsdk.json');
const credential = admin.credential.cert(require(serviceAccountPath));

admin.initializeApp({
    credential,
    storageBucket: 'list-veiwer-7481b.appspot.com'
});

async function test() {
    try {
        const bucket = admin.storage().bucket();
        console.log('Bucket name:', bucket.name);
        const fileUpload = bucket.file('test.txt');
        const stream = fileUpload.createWriteStream({
            metadata: { contentType: 'text/plain' }
        });
        stream.on('error', (err) => console.error('Upload Error:', err));
        stream.on('finish', async () => {
            await fileUpload.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/test.txt`;
            console.log('Upload Success!', publicUrl);
            process.exit(0);
        });
        stream.end(Buffer.from('Hello Firebase Storage!'));
    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
}
test();
