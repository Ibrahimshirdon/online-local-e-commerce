const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (file, folder = 'uploads') => {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('No file provided'));

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        const stream = new Readable();
        stream.push(file.buffer);
        stream.push(null);
        stream.pipe(uploadStream);
    });
};

module.exports = { uploadToCloudinary };
