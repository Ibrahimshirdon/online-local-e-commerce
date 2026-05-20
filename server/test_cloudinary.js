require('dotenv').config();
const { uploadToCloudinary } = require('./utils/cloudinary');
const fs = require('fs');

async function test() {
    try {
        console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
        console.log("API Key:", process.env.CLOUDINARY_API_KEY);
        // Create a dummy buffer
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const file = { buffer, originalname: 'test.png', mimetype: 'image/png' };
        
        console.log("Starting upload...");
        const url = await uploadToCloudinary(file, 'test_folder');
        console.log("Upload Success! URL:", url);
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
