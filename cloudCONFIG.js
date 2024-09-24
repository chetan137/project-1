const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dw4ad1fxw',
    api_key: '797979248379637',
    api_secret: 'hIqdOvRByZc4D8sSDNfZbjwn3-0',
});

// Define storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'KAJWA_NEW';
        let resourceType = 'image'; // Default resource type
        const allowedImageFormats = ['image/png', 'image/jpg', 'image/jpeg'];
        const allowedVideoFormats = ['video/mp4', 'video/quicktime']; // MOV files are handled as 'quicktime'

        // Check file type and set resource type accordingly
        if (allowedVideoFormats.includes(file.mimetype)) {
            resourceType = 'video';
        }

        return {
            folder: folder,
            resource_type: resourceType, // Dynamically set resource type (image or video)
            allowed_formats: ['png', 'jpg', 'jpeg', 'mp4', 'mov'], // Allowed formats
        };
    },
});

// File filter to validate format
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'video/mp4', 'video/quicktime'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PNG, JPG, JPEG, MP4, and MOV are allowed.'), false); // Reject the file
    }
};

// Configure multer with the Cloudinary storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 100, // Limit to 100MB for videos and images
    },
});





module.exports = {
    cloudinary,
    storage,
    upload // Export the 'upload' to use in other routes
};
