const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    // Accept any image MIME type, regardless of the file extension
    const mimetype = /^image\//.test(file.mimetype);

    if (mimetype) {
        return cb(null, true);
    }
    cb(new Error('Images only!'));
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
