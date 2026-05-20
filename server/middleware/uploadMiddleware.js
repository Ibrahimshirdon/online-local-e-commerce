const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    // Allow all common image formats
    const filetypes = /jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico|heic|heif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^image\//.test(file.mimetype); // Accept any image MIME type

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb('Images only!');
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
