# 📦 دليل التوثيق الشامل لنظام الباقات (Bundles API Documentation)

دليل مطوري الباك إند والواجهة الأمامية الخاص بنظام **باقات العناية (Bundles & Skincare Routines)** وعلاقتها بـ **المنتجات (Products)**، **العربة (Cart)**، و**الطلبات (Orders)** في مشروع `gravuta-backend`.

---

## 📌 جدول المحتويات
1. [مفهوم الباقة والعلاقة مع المنتجات (Concept & Relations)](#1-مفهوم-الباقة-والعلاقة-مع-المنتجات)
2. [قاموس الحقول والخصائص (Fields & Properties Dictionary)](#2-قاموس-الحقول-والخصائص)
3. [بيانات الباقات الجاهزة (Production Mock Data)](#3-بيانات-الباقات-الجاهزة)
4. [دليل مسارات الـ API العامة (Public Endpoints)](#4-دليل-مسارات-الـ-api-العامة)
5. [دليل مسارات الإدارة (Admin Endpoints)](#5-دليل-مسارات-الإدارة)
6. [تكامل العربة والطلبات (Cart & Checkout Integration)](#6-تكامل-العربة-والطلبات)
7. [طريقة التشغيل والتهيئة (Seeding & Running)](#7-طريقة-التشغيل-والتهيئة)

---

## 1. مفهوم الباقة والعلاقة مع المنتجات

الباقة (**Bundle**) في النظام هي **روتين عناية سريري متكامل** يجمع منتجين أو أكثر معاً ليباعوا كوحدة واحدة بسعر مخفض.

### طبيعة العلاقة (Many-to-Many with Metadata):
```
+-------------------------------------------------------------+
|                           BUNDLE                            |
|  - id: ObjectId                                             |
|  - slug: "dewy-hydration-duo"                               |
|  - bundlePrice: 595 (السعر المخفض للروتين)                  |
|  - originalPrice: 700 (مجموع أسعار المنتجات منفردة)          |
+-------------------------------------------------------------+
                              |
                              | 1:N
                              v
             +----------------------------------+
             |         BUNDLE ITEM              |  (Pivot / جدول وسيط)
             |  - product: ObjectId (Ref Product|
             |  - stepEn: "Step 1: Cleanse"     |  (ترتيب وخطوة الاستخدام)
             |  - stepAr: "الخطوة 1: التنظيف"    |
             |  - benefitEn: "Deep Purify"      |  (دور المنتج في الروتين)
             |  - benefitAr: "تنظيف عميق"       |
             |  - quantity: 1                   |
             |  - order: 1                      |
             +----------------------------------+
                              |
                              | N:1
                              v
+-------------------------------------------------------------+
|                          PRODUCT                            |
|  - _id: ObjectId                                            |
|  - name: "Botanical Harmony Pure Prebiotic Cleanser"        |
|  - price: 195                                               |
|  - image: "/uploads/..."                                    |
|  - category: ObjectId (Ref Category)                        |
+-------------------------------------------------------------+
```

### القواعد الحسابية والمنطقية:
* **حساب السعر الأصلي**: $\text{originalPrice} = \sum (\text{product.price} \times \text{item.quantity})$
* **حساب سعر الباقة**: $\text{bundlePrice} = \text{originalPrice} \times (1 - \frac{\text{discountPercentage}}{100})$
* **قيمة التوفير (Virtual field)**: $\text{savings} = \text{originalPrice} - \text{bundlePrice}$
* **حماية التلاعب بالأسعار**: يتم حساب `originalPrice` و `bundlePrice` حصرياً في السيرفر بناءً على أسعار المنتجات الموثقة في قاعدة البيانات.

---

## 2. قاموس الحقول والخصائص

### 2.1. كائن الباقة الرئيسي (`Bundle Schema`)

| الحقل (Key) | النوع (Type) | إجباري | الوصف | مثال لقيمة الحقل (Example Value) |
| :--- | :---: | :---: | :--- | :--- |
| `_id` | `ObjectId` | نعم (آلي) | المعرف الفريد للباقة في MongoDB | `"661b2e4f8d9a1c0012345678"` |
| `slug` | `String` | نعم | الاسم اللطيف والفريد في الروابط | `"dewy-hydration-duo"` |
| `nameEn` | `String` | نعم | اسم الباقة بالإنجليزية | `"The Dewy Hydration Duo"` |
| `nameAr` | `String` | نعم | اسم الباقة بالعربية | `"ثنائي الترطيب المتوهج"` |
| `subtitleEn` | `String` | لا | عنوان فرعي توضيحي (EN) | `"Double-action moisture lock with Oceanic Serum & Barrier Cream"` |
| `subtitleAr` | `String` | لا | عنوان فرعي توضيحي (AR) | `"قفل ترطيب مزدوج المفعول مع سيروم المحيط وكريم حاجز البشرة"` |
| `descriptionEn` | `String` | نعم | الشرح التفصيلي للروتين بالإنجليزية | `"The ultimate skin-quenching couple. This duo works in tandem..."` |
| `descriptionAr` | `String` | نعم | الشرح التفصيلي للروتين بالعربية | `"الثنائي المثالي لترطيب وتغذية الخلايا. يعمل هذا الزوج جنباً إلى جنب..."` |
| `image` | `String` | لا | مسار أو رابط الصورة الرئيسية للباقة | `"/uploads/1713456789-bundle.jpg"` |
| `items` | `Array<Item>`| نعم | قائمة المنتجات وخطوات الروتين (منتجين على الأقل) | *انظر تفاصيل العنصر بالجدول أدناه* |
| `discountPercentage`| `Number` | نعم | نسبة الخصم (1 إلى 99%) | `15` (تعني خصم 15%) |
| `originalPrice` | `Number` | نعم (آلي) | مجموع أسعار المنتجات منفردة | `700` |
| `bundlePrice` | `Number` | نعم (آلي) | سعر الباقة المخفض بعد تطبيق الخصم | `595` |
| `savings` | `Number` | افتراضي (Virtual) | قيمة المبلغ الموفر للعميل | `105` |
| `benefitsEn` | `Array<String>` | لا | الفوائد والنتائج السريرية بالإنجليزية | `["Boosts skin moisture levels by 85%", ...]` |
| `benefitsAr` | `Array<String>` | لا | الفوائد والنتائج السريرية بالعربية | `["يرفع مستويات ترطيب البشرة بنسبة 85٪", ...]` |
| `isActive` | `Boolean` | لا (افتراضي true) | حالة النشر (نشطة وتظهر في المتجر أم مؤرشفة) | `true` |
| `createdAt` | `Date` | آلي | تاريخ ووقت الإنشاء | `"2026-10-19T00:00:00.000Z"` |
| `updatedAt` | `Date` | آلي | تاريخ ووقت آخر تعديل | `"2026-10-19T00:00:00.000Z"` |

---

### 2.2. عنصر المنتج داخل الباقة (`BundleItem Schema`)

| الحقل (Key) | النوع (Type) | إجباري | الوصف | مثال لقيمة الحقل |
| :--- | :---: | :---: | :--- | :--- |
| `product` | `ObjectId` | نعم | المعرف الخاص بالمنتج (مرجع لنموذج Product) | `"661b2e4f8d9a1c0099887766"` |
| `stepEn` | `String` | نعم | خطوة وتوقيت التطبيق بالإنجليزية | `"Step 1: Deep Hydra-Renewal"` |
| `stepAr` | `String` | نعم | خطوة وتوقيت التطبيق بالعربية | `"الخطوة 1: تجديد الترطيب العميق"` |
| `benefitEn` | `String` | نعم | الدور السريري للمنتج ضمن هذا الروتين (EN) | `"Plumps skin with dual-weight hyaluronic acid molecules."` |
| `benefitAr` | `String` | نعم | الدور السريري للمنتج ضمن هذا الروتين (AR) | `"يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن."` |
| `quantity` | `Number` | لا (افتراضي 1) | عدد العبوات المتضمنة من هذا المنتج | `1` |
| `order` | `Number` | لا (افتراضي 1) | ترتيب الخطوة (1, 2, 3...) لعرض الخطوات بالتسلسل | `1` |

---

## 3. بيانات الباقات الجاهزة

تم تضمين الباقات المعتمدة في متجر `pharmaa` وتجهيزها في سكريبت الـ Seeding:

### باقة 1: ثنائي الترطيب المتوهج (The Dewy Hydration Duo)
* **الـ Slug**: `dewy-hydration-duo`
* **نسبة الخصم**: `15%`
* **السعر الأصلي**: `700 ريال` | **سعر الباقة**: `595 ريال` | **التوفير**: `105 ريال`
* **المكونات (2 منتجات)**:
  1. *Ocean Glow Hydra-Renewal Serum* (سعر: 320) - خطوة 1: تجديد الترطيب العميق.
  2. *Velvet Cloud Lipid-Barrier Moisturizer* (سعر: 380) - خطوة 2: قفل الترطيب وحماية الحاجز.

### باقة 2: روتين الترميم الفائق المتكامل (The Ultimate Restoration Routine)
* **الـ Slug**: `ultimate-restoration-routine`
* **نسبة الخصم**: `20%`
* **السعر الأصلي**: `1145 ريال` | **سعر الباقة**: `915 ريال` | **التوفير**: `230 ريال`
* **المكونات (4 منتجات)**:
  1. *Botanical Harmony Pure Prebiotic Cleanser* (سعر: 195) - خطوة 1: التنظيف اللطيف.
  2. *Ocean Glow Hydra-Renewal Serum* (سعر: 320) - خطوة 2: غمر الترطيب السيرومي.
  3. *Velvet Cloud Lipid-Barrier Moisturizer* (سعر: 380) - خطوة 3: التغذية وإعادة البناء.
  4. *Solar Shield Invisible SPF50+ Defense* (سعر: 250) - خطوة 4: درع الحماية SPF 50+.

### باقة 3: مجموعة تنقية وتصفية البشرة (The Clear Skin Clarifying Set)
* **الـ Slug**: `clear-skin-clarifying-set`
* **نسبة الخصم**: `15%`
* **السعر الأصلي**: `475 ريال` | **سعر الباقة**: `400 ريال` | **التوفير**: `75 ريال`
* **المكونات (2 منتجات)**:
  1. *Botanical Harmony Pure Prebiotic Cleanser* (سعر: 195) - تنظيف يومي: جل نباتي متوازن.
  2. *Glacial Marine Clay Detox Mask* (سعر: 280) - تقشير أسبوعي: قناع الطين البحري.

---

## 4. دليل مسارات الـ API العامة

المسارات المتاحة للجمهور والواجهة الأمامية بدون الحاجة لتسجيل دخول.

### 4.1. جلب قائمة الباقات النشطة
* **الرابط**: `GET /api/bundles`
* **المعاملات الاختيارية (Query Params)**:
  * `page`: رقم الصفحة (افتراضي `1`).
  * `limit`: عدد الباقات في الصفحة (افتراضي `10`).
* **شكل الاستجابة (Response 200 OK)**:
```json
{
  "status": "success",
  "count": 3,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": [
    {
      "_id": "662...",
      "slug": "dewy-hydration-duo",
      "nameEn": "The Dewy Hydration Duo",
      "nameAr": "ثنائي الترطيب المتوهج",
      "subtitleEn": "Double-action moisture lock with Oceanic Serum & Barrier Cream",
      "subtitleAr": "قفل ترطيب مزدوج المفعول مع سيروم المحيط وكريم حاجز البشرة",
      "originalPrice": 700,
      "bundlePrice": 595,
      "savings": 105,
      "discountPercentage": 15,
      "image": "/uploads/hero_skincare_banner.jpg",
      "benefitsEn": ["Boosts skin moisture levels by 85% in 3 days"],
      "benefitsAr": ["يرفع مستويات ترطيب البشرة بنسبة 85٪ في 3 أيام"],
      "items": [
        {
          "product": {
            "_id": "661...",
            "name": "Ocean Glow Hydra-Renewal Serum",
            "price": 320,
            "image": "/uploads/serum.jpg",
            "category": { "_id": "660...", "name": "Serums & Elixirs" }
          },
          "stepEn": "Step 1: Deep Hydra-Renewal",
          "stepAr": "الخطوة 1: تجديد الترطيب العميق",
          "benefitEn": "Plumps skin with dual-weight hyaluronic acid molecules.",
          "benefitAr": "يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن.",
          "quantity": 1,
          "order": 1
        }
      ]
    }
  ]
}
```

---

### 4.2. جلب تفاصيل باقة معينة بالـ ID أو بالـ Slug
* **الرابط**: `GET /api/bundles/:idOrSlug`
* **أمثلة**:
  * `GET /api/bundles/dewy-hydration-duo`
  * `GET /api/bundles/6620f3d9b4c8a1e2f789abcd`
* **شكل الاستجابة (Response 200 OK)**:
```json
{
  "status": "success",
  "data": {
    "_id": "662...",
    "slug": "dewy-hydration-duo",
    "nameEn": "The Dewy Hydration Duo",
    "nameAr": "ثنائي الترطيب المتوهج",
    "originalPrice": 700,
    "bundlePrice": 595,
    "savings": 105,
    "discountPercentage": 15,
    "items": [ ... ]
  }
}
```

---

### 4.3. البحث العكسي: جلب الباقات التي تحتوي على منتج معين
يستخدم هذا المسار في صفحة تفاصيل المنتج لتغذية شريط العروض المقترحة (*"باقات تشمل هذا المستحضر"*):
* **الرابط**: `GET /api/bundles/by-product/:productId`
* **مثال**: `GET /api/bundles/by-product/661a1b2c3d4e5f6a7b8c9d0e`
* **شكل الاستجابة (Response 200 OK)**:
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "_id": "662...",
      "slug": "dewy-hydration-duo",
      "nameEn": "The Dewy Hydration Duo",
      "bundlePrice": 595,
      "savings": 105,
      "items": [ ... ]
    },
    {
      "_id": "663...",
      "slug": "ultimate-restoration-routine",
      "nameEn": "The Ultimate Restoration Routine",
      "bundlePrice": 915,
      "savings": 230,
      "items": [ ... ]
    }
  ]
}
```

---

## 5. دليل مسارات الإدارة (Admin Endpoints)

> **تنبيه**: جميع هذه المسارات تتطلب إرسال هيدر التوثيق:
> `Authorization: Bearer <ADMIN_JWT_TOKEN>`

### 5.1. إضافة باقة جديدة
* **الرابط**: `POST /api/admin/bundles`
* **نوع الطلب (Content-Type)**: `multipart/form-data` (في حال رفع صورة) أو `application/json`.
* **جسم الطلب (JSON Payload Example)**:
```json
{
  "slug": "glowing-radiance-duo",
  "nameEn": "Glowing Radiance Duo",
  "nameAr": "ثنائي النضارة والإشراق",
  "subtitleEn": "Intense vitamin boost routine",
  "subtitleAr": "روتين مكثف بالفيتامينات لإشراقة البشرة",
  "descriptionEn": "Combines a pure cleanser and serum for an immediate glow.",
  "descriptionAr": "يجمع بين غسول نقي وسيروم فعال للحصول على إشراقة فورية.",
  "discountPercentage": 15,
  "bundlePrice": 435,
  "benefitsEn": ["Instant healthy glow", "Smoother texture"],
  "benefitsAr": ["إشراقة صحية فورية", "ملمس ناعم كالحرير"],
  "items": [
    {
      "product": "661b2e4f8d9a1c0099887711",
      "stepEn": "Step 1: Cleanse",
      "stepAr": "الخطوة 1: التنظيف",
      "benefitEn": "Removes impurities",
      "benefitAr": "يزيل الشوائب بلطف",
      "quantity": 1,
      "order": 1
    },
    {
      "product": "661b2e4f8d9a1c0099887722",
      "stepEn": "Step 2: Serum",
      "stepAr": "الخطوة 2: السيروم",
      "benefitEn": "Infuses active nutrients",
      "benefitAr": "يغذي البشرة بالعناصر الفعالة",
      "quantity": 1,
      "order": 2
    }
  ]
}
```

---

### 5.2. تعديل بيانات باقة
* **الرابط**: `PUT /api/admin/bundles/:id`
* **الوظيفة**: تعديل أي حقل من حقول الباقة مع إمكانية رفع صورة جديدة وإعادة احتساب الأسعار آلياً إذا تم تغيير المنتجات أو نسبة الخصم.

---

### 5.3. إعادة مزامنة وحساب أسعار الباقة
* **الرابط**: `PATCH /api/admin/bundles/:id/recalculate`
* **الفائدة**: إذا قام الأدمن بتعديل سعر منتج فردي (مثلاً زاد سعر السيروم من 300 إلى 350)، يمكن استدعاء هذا المسار ليقوم السيرفر فوراً بإعادة حساب `originalPrice` و `bundlePrice` للباقة تلقائياً دون الحاجة لتعديلها يدوياً.

---

### 5.4. حذف باقة
* **الرابط**: `DELETE /api/admin/bundles/:id`
* **الاستجابة (200 OK)**:
```json
{
  "status": "success",
  "message": "🗑️ تم حذف الباقة بنجاح!"
}
```

---

## 6. تكامل العربة والطلبات

### 6.1. إضافة باقة إلى عربة التسوق
* **الرابط**: `POST /api/cart/bundles`
* **الهيدر**: `Authorization: Bearer <USER_JWT_TOKEN>`
* **جسم الطلب**:
```json
{
  "bundleId": "6620f3d9b4c8a1e2f789abcd",
  "quantity": 1
}
```
* **الاستجابة**: ترجع كائن العربة كاملاً مع تعبئة (`populate`) للمنتج الأصلي أو الباقة ومكوناتها.

---

### 6.2. تعديل كمية باقة في العربة
* **الرابط**: `PUT /api/cart/bundles`
```json
{
  "bundleId": "6620f3d9b4c8a1e2f789abcd",
  "quantity": 2
}
```

---

### 6.3. حذف باقة من العربة
* **الرابط**: `DELETE /api/cart/bundles/:bundleId`

---

### 6.4. إنشاء الطلب (Checkout)
* **الرابط**: `POST /api/orders`
* **آلية المعالجة في السيرفر**:
  1. يقوم السيرفر بقراءة عناصر العربة (سواء كانت منتجات فردية أو باقات).
  2. للباقات: يتم التحقق من أن الباقة ما زالت مفعلة في المتجر ولم يتم حذف أي منتج من منتجاتها.
  3. يتم احتساب `totalPrice` بسعر الباقة المخفض `bundle.bundlePrice`.
  4. يتم حفظ لقطة تاريخية (`bundleSnapshot`) بداخل الطلب تحتوي على أسماء المنتجات وكمياتها وقت الشراء لضمان دقة الفاتورة حتى لو تم تعديل الباقة مستقبلاً.

---

## 7. طريقة التشغيل والتهيئة

### 7.1. تشغيل سكريبت تهيئة الباقات
لإدخال الفئات والمنتجات والباقات الثلاث الأساسية تلقائياً في قاعدة البيانات:
```bash
npm run seed:bundles
```
*السكريبت آمن ويدعم الـ Upsert، بحيث يمكن تشغيله أكثر من مرة دون تكرار البيانات.*

### 7.2. تشغيل السيرفر في وضع التطوير
```bash
npm run dev
```

---

**جاهز للاستخدام والتكامل المباشر مع واجهة `pharmaa`! 🚀**
