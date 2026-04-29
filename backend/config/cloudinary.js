//Update allowed file types in image upload: include WEBP format

const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error('Only JPG, JPEG, PNG, and WEBP files are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const uploadImageBuffer = (fileBuffer) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'uniformity_products',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });

module.exports = { cloudinary, upload, uploadImageBuffer };
