/**
 * دالة مساعدة لتطبيق نظام الصفحات (Pagination Helper)
 * @param {Object} model - نموذج Mongoose المراد البحث فيه (Model)
 * @param {Object} query - استعلام التصفية لقاعدة البيانات (e.g. { user: userId })
 * @param {Object} reqQuery - متغيرات الاستعلام من الرابط (req.query)
 * @param {Array|String|Object} populateOptions - خيارات جلب البيانات المرتبطة (Populate)
 * @param {String} selectFields - الحقول المطلوبة أو المستبعدة (e.g. '-password')
 * @param {Object|String} sort - ترتيب النتائج (e.g. { createdAt: -1 })
 * @returns {Promise<{results: Array, pagination: Object}>}
 */
const paginate = async (model, query = {}, reqQuery = {}, populateOptions = '', selectFields = '', sort = null) => {
    // 1. تحديد الصفحة الحالية والحد الأقصى للعناصر في الصفحة (بحد أقصى 100 عنصر)
    const page = Math.max(parseInt(reqQuery.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(reqQuery.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    // 2. حساب إجمالي العناصر والصفحات المتاحة الاستعلام
    const totalItems = await model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // 3. بناء طلب جلب البيانات مع تطبيق Sort و Skip و Limit والـ Populate
    let dbQuery = model.find(query);

    if (sort) {
        dbQuery = dbQuery.sort(sort);
    }

    dbQuery = dbQuery.skip(skip).limit(limit);

    if (selectFields) {
        dbQuery = dbQuery.select(selectFields);
    }

    if (populateOptions) {
        dbQuery = dbQuery.populate(populateOptions);
    }

    const results = await dbQuery;

    // 4. بناء كائن تفاصيل الصفحات (Pagination Metadata)
    const pagination = {
        currentPage: page,
        totalPages: totalPages || 1,
        totalItems,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };

    return {
        results,
        pagination
    };
};

module.exports = paginate;
