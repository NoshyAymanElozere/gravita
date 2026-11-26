const mongoose = require('mongoose');

// إعدادات الموقع العامة (مستند واحد فقط key = 'site')
// الشعار يُحفظ داخل قاعدة البيانات كـ data URL حتى لا يضيع عند إعادة نشر السيرفر
// (ملفات مجلد uploads على Railway تُحذف مع كل deploy)
const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'site' },
    logo: { type: String, default: '' } // data:image/...;base64,... أو رابط http(s) — فارغ = الشعار الافتراضي
}, {
    timestamps: true
});

settingSchema.statics.getSite = async function () {
    let doc = await this.findOne({ key: 'site' });
    if (!doc) doc = await this.create({ key: 'site' });
    return doc;
};

module.exports = mongoose.model('Setting', settingSchema);
