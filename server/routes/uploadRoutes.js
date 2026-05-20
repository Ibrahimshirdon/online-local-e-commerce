const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    // Allow all common image formats
    const filetypes = /jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico|heic|heif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^image\//.test(file.mimetype); // Accept any image MIME type

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { uploadToFirebase } = require('../utils/firebaseStorage');
        if (!req.file) return res.status(400).send('No image uploaded');
        const url = await uploadToFirebase(req.file, 'uploads');
        res.send(url);
    } catch (error) {
        console.error(error);
        res.status(500).send('Upload failed');
    }
});

module.exports = router;
