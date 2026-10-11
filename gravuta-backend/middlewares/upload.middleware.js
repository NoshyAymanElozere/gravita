const multer = require('multer');
const path = require('path');
const fs = require('fs');

// التأكد من وجود مجلد uploads في مسار المشروع الرئيسي
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات مكان حفظ الملفات وتسميتها
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // حفظ الملف في مجلد uploads
    },
    filename: (req, file, cb) => {
        // توليد اسم فريد لكل ملف باستخدام الوقت العشوائي وامتداد الملف الأصلي
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// تصفية الملفات لقبول الصور فقط (JPEG, JPG, PNG, GIF, WEBP)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('عذراً، يجب أن يكون الملف المرفوع صورة فقط (jpeg, jpg, png, gif, webp)'), false);
    }
};

// إعداد Multer النهائي
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // الحد الأقصى لحجم الملف هو 5 ميجابايت
    fileFilter: fileFilter
});

module.exports = upload;
