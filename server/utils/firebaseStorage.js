const admin = require('firebase-admin');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadToFirebase = async (file, folder = 'uploads') => {
    if (!file) return null;

    try {
        const bucket = admin.storage().bucket();
        const extension = path.extname(file.originalname);
        const filename = `${folder}/${uuidv4()}${extension}`;
        
        const fileUpload = bucket.file(filename);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (error) => {
                console.error('Firebase Storage Upload Error:', error);
                reject(error);
            });

            stream.on('finish', async () => {
                // Make the file publicly accessible
                await fileUpload.makePublic();
                
                // Get the public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
                resolve(publicUrl);
            });

            stream.end(file.buffer);
        });
    } catch (error) {
        console.error('Error in uploadToFirebase:', error);
        throw error;
    }
};

module.exports = { uploadToFirebase };
