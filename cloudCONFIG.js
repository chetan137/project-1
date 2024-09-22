const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log('Current Directory:', process.cwd());

cloudinary.config({
    cloud_name:'dw4ad1fxw',
    api_key:797979248379637,
    api_secret:'hIqdOvRByZc4D8sSDNfZbjwn3-0',
});
console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'KAJWA_NEW',
        allowedFormats: ['png', 'jpg', 'jpeg', 'pdf', 'mp4', 'mov'],
    },
});

const multer = require('multer');
const upload = multer({ storage });
const uploadImages = upload.array('images', 30); // Limit to 30 images
const uploadVideo = upload.single('video'); // For single video upload

module.exports = {
    cloudinary,
    storage,
    uploadImages,
    uploadVideo,
};
