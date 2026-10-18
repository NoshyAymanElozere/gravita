# 📦 Clinical Skincare Bundles & Product Relationships: Backend Architecture Specification & Implementation Plan

> **Target Project**: `pharmaa` (Frontend Storefront) & `gravuta-backend` (Node.js/Express/MongoDB Backend)  
> **Author**: Antigravity Technical Architecture Team  
> **Status**: Ready for Backend Implementation  
> **Language Support**: Bilingual (English `en` & Arabic `ar`)

---

## 1. Overview & Domain Understanding

In the **AURA / Pharmaa** skincare platform, **Bundles** represent curated, clinical skincare routines (such as *The Dewy Hydration Duo*, *The Ultimate Restoration Routine*, and *The Clear Skin Clarifying Set*). 

Unlike a standard single product, a **Bundle** is an intentional aggregation of 2 or more complementary formulations configured to be purchased together as a single commercial unit at a discounted package price.

### Core Value Drivers:
1. **Synergistic Clinical Care**: Products within a bundle are applied in a prescribed sequential ritual (e.g., Step 1: Cleanse $\rightarrow$ Step 2: Hydro-Infusion $\rightarrow$ Step 3: Nourish $\rightarrow$ Step 4: Shield SPF 50+).
2. **Financial Incentive**: Bundles deliver a distinct discount (e.g., 15% to 20% off the cumulative retail prices of the individual items).
3. **Cross-Sell & Upsell**: On single-product pages, any bundle that includes that product is dynamically presented to entice customers to upgrade to the full routine.

---

## 2. Bundles & Products: Relational Architecture

The relationship between **Bundles** and **Products** is fundamentally a **Many-to-Many (M:N) Relationship with Pivot/Association Metadata**.

```
+-------------------------------------------------------------+
|                           BUNDLE                            |
|-------------------------------------------------------------|
| id: bundle_hydration_duo                                    |
| slug: dewy-hydration-duo                                    |
| originalPrice: 700 AED/SAR                                  |
| bundlePrice: 595 AED/SAR (15% discount)                     |
+-------------------------------------------------------------+
                              |
                     1        | Contains
                              v
             +----------------------------------+
             |      BUNDLE ITEM / PRODUCT       |  <-- Pivot / Join Entity
             |----------------------------------|
             | stepEn: "Step 1: Hydro-Infusion" |
             | stepAr: "الخطوة 1: غمر الترطيب"  |
             | benefitEn: "Deep moisture"       |
             | benefitAr: "ترطيب فائق"          |
             | order: 1                         |
             +----------------------------------+
                              |
                     N        | References
                              v
+-------------------------------------------------------------+
|                          PRODUCT                            |
|-------------------------------------------------------------|
| id: prod_ocean_glow                                         |
| nameEn: Ocean Glow Hydra-Renewal Serum                      |
| nameAr: سيروم التجديد الساحلي الفاتن                         |
| price: 320 AED/SAR                                          |
| stockStatus: "in_stock"                                     |
+-------------------------------------------------------------+
```

### Key Relational Dimensions:

### A. Composition (Bundle $\rightarrow$ Products)
* A Bundle contains an array of `items`.
* Each item references a physical `Product` and attaches **routine-specific contextual attributes**:
  * **Step Sequence (`stepEn`, `stepAr`)**: Identifies the step order and ritual timing (e.g., "Step 1: Cleanse", "Daily Cleanse: Botanical Gel", "Weekly Detox: Marine Clay").
  * **Synergistic Benefit (`benefitEn`, `benefitAr`)**: Explains what this exact product accomplishes *within the synergy of this specific routine*.

### B. Inverse Association (Product $\rightarrow$ Bundles)
* A single product can belong to zero, one, or multiple bundles.
* **Storefront Requirement**: When a user inspects a product (`ProductDetailsView.tsx`), the frontend looks for all bundles containing that product:
  $$\text{productBundles} = \text{BUNDLES.filter}(b \Rightarrow b.\text{items}.\text{some}(\text{item} \Rightarrow \text{item}.\text{product}.\text{id} === \text{productId}))$$
* **Backend Requirement**: The backend must provide a query endpoint `GET /api/bundles/by-product/:productId` that performs a reverse lookup (`Bundle.find({ "items.product": productId })`).

### C. Financial & Pricing Mathematics
* $\text{originalPrice} = \sum (\text{individual product prices})$
* $\text{bundlePrice} = \text{originalPrice} \times (1 - \frac{\text{discountPercentage}}{100})$
* $\text{savings} = \text{originalPrice} - \text{bundlePrice}$
* In the frontend:
  * *Hydration Duo*: $320 + 380 = 700 \rightarrow$ Discount 15% $\rightarrow 595$ AED (Save 105 AED).
  * *Ultimate Restoration Routine*: $195 + 320 + 380 + 250 = 1145 \rightarrow$ Discount 20% $\rightarrow 915$ AED (Save 230 AED).
  * *Clear Skin Clarifying Set*: $195 + 280 = 475 \rightarrow$ Discount 15% $\rightarrow 400$ AED (Save 75 AED).

### D. Inventory & Stock Deductions
* A Bundle does **not** have an independent stock level; its availability depends directly on its constituent products.
* **Availability Rule**: A Bundle is `in_stock` if and only if **every** product in its `items` has $\text{stock} > 0$ and $\text{stockStatus} \ne \text{"out\_of\_stock"}$.
* **Fulfillment Rule**: When 1 unit of a bundle is purchased, the backend transaction must decrement the physical inventory of **each individual constituent product** by 1.

### E. Cart & Order Entity Representation
* In the frontend (`pharmaa`), adding a bundle invokes `convertBundleToProduct(bundle)`. This maps the bundle into a virtual product with `categorySlug: 'bundles'` and `size: 'Complete Set'`.
* In the backend (`gravuta-backend`), Cart and Order models must explicitly track `bundle` items, storing:
  * The parent `bundle` reference.
  * A snapshot of the constituent products and their prices at checkout time (for shipping labels and warehouse fulfillment).

---

## 3. Complete Key & Property Dictionary

Here is every property, key name, data type, requirement flag, and concrete value taken directly from the `pharmaa` code and data.

### 3.1. `Bundle` Entity

| Key / Property | Data Type | Required | Description | Concrete Example Value (Hydration Duo) | Concrete Example Value (Restoration Routine) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `_id` / `id` | `ObjectId` / `String` | Yes | Unique identifier for the bundle | `"bundle_hydration_duo"` | `"bundle_complete_renewal"` |
| `slug` | `String` | Yes | URL-friendly unique identifier | `"dewy-hydration-duo"` | `"ultimate-restoration-routine"` |
| `nameEn` | `String` | Yes | English primary title | `"The Dewy Hydration Duo"` | `"The Ultimate Restoration Routine"` |
| `nameAr` | `String` | Yes | Arabic primary title | `"ثنائي الترطيب المتوهج"` | `"روتين الترميم الفائق المتكامل"` |
| `subtitleEn` | `String` | Yes | English sub-headline describing the routine | `"Double-action moisture lock with Oceanic Serum & Barrier Cream"` | `"The full 4-step professional clinical routine for ultimate skin health"` |
| `subtitleAr` | `String` | Yes | Arabic sub-headline describing the routine | `"قفل ترطيب مزدوج المفعول مع سيروم المحيط وكريم حاجز البشرة"` | `"الروتين السريري المهني المتكامل من 4 خطوات لصحّة البشرة الفائقة"` |
| `descriptionEn` | `String` | Yes | Full marketing and clinical description in English | `"The ultimate skin-quenching couple. This duo works in tandem: the Hydra-Renewal Serum floods skin cells with moisture, while the Velvet Cloud Barrier Cream locks it in and seals the skin barrier for a plump, velvet finish."` | `"Transform your daily ritual with our flagship routine. Designed as a synergistic four-step process to cleanse, treat, hydrate, and shield your skin against aging elements and environmental pollutants."` |
| `descriptionAr` | `String` | Yes | Full marketing and clinical description in Arabic | `"الثنائي المثالي لترطيب وتغذية الخلايا. يعمل هذا الزوج جنباً إلى جنب: سيروم تجديد البشرة يغمر خلايا الجلد بالرطوبة الفائقة، بينما يعمل كريم الحاجز المخملي على قفل الترطيب وترميم الطبقة الدهنية الواقية."` | `"حوّلي روتينكِ اليومي مع مجموعتنا الرائدة. مصممة كعملية متكاملة تآزرية من أربع خطوات لتنظيف، علاج، ترطيب، وحماية بشرتكِ من علامات الشيخوخة والملوثات البيئية."` |
| `image` | `String` | Yes | Main banner or box image URL/path | `"/assets/images/hero_skincare_banner_1781217525355.jpg"` | `"/assets/images/product_cream_jar_1781217540516.jpg"` |
| `discountPercentage`| `Number` | Yes | Percentage discounted off original total | `15` | `20` |
| `originalPrice` | `Number` | Yes | Cumulative sum of products' base prices | `700` | `1145` |
| `bundlePrice` | `Number` | Yes | Final discounted selling price for the pack | `595` | `915` |
| `benefitsEn` | `Array<String>` | Yes | List of key clinical routine outcomes (EN) | `["Boosts skin moisture levels by 85% in 3 days", "Provides a perfect glass-skin makeup canvas", "Repairs compromised lipid barriers overnight"]` | `["Comprehensive skincare from morning cleanse to night restoration", "Fades fine lines, redness, and sun damage within 14 days", "Reinforces natural microflora and blocks UV damage"]` |
| `benefitsAr` | `Array<String>` | Yes | List of key clinical routine outcomes (AR) | `["يرفع مستويات ترطيب البشرة بنسبة 85٪ في 3 أيام", "يمنحكِ بشرة زجاجية مثالية كقاعدة للمكياج", "يرمم حاجز الدهون المتضرر طوال فترة النوم ليلاً"]` | `["عناية شاملة بالبشرة تبدأ من غسول الصباح وحتى ترميم الليل", "يخفي الخطوط الدقيقة والاحمرار وبقع الشمس في 14 يوماً", "يقوي البكتيريا الحيوية النافعة ويحجب أضرار الأشعة فوق البنفسجية"]` |
| `items` | `Array<BundleProduct>` | Yes | Array of constituent products with ritual metadata | *(See 3.2 below)* | *(See 3.2 below)* |
| `isActive` | `Boolean` | No (Default: true) | Whether bundle is actively published in store | `true` | `true` |
| `createdAt` | `Date` | Auto | Timestamp of creation | ISO Date | ISO Date |
| `updatedAt` | `Date` | Auto | Timestamp of last edit | ISO Date | ISO Date |

---

### 3.2. `BundleProduct` (Pivot Item) Entity

| Key / Property | Data Type | Required | Description | Example (Step 1 of Hydration Duo) | Example (Step 2 of Hydration Duo) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `product` | `ObjectId` / `String` | Yes | Reference to target Product document | `ObjectId("prod_ocean_glow...")` | `ObjectId("prod_velvet_cloud...")` |
| `stepEn` | `String` | Yes | English application step name | `"Step 1: Deep Hydra-Renewal"` | `"Step 2: Seal & Protect Barrier"` |
| `stepAr` | `String` | Yes | Arabic application step name | `"الخطوة 1: تجديد الترطيب العميق"` | `"الخطوة 2: قفل الترطيب وحماية الحاجز"` |
| `benefitEn` | `String` | Yes | Role of this specific product in the routine (EN) | `"Plumps skin with dual-weight hyaluronic acid molecules."` | `"Binds moisture and fills lipid voids with ceramides."` |
| `benefitAr` | `String` | Yes | Role of this specific product in the routine (AR) | `"يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن."` | `"يربط جزيئات الماء داخل الخلايا ويسد الثغرات الدهنية بالسيراميد."` |
| `quantity` | `Number` | No (Default: 1) | Quantity of this product included in the bundle | `1` | `1` |
| `order` | `Number` | No (Default: 1) | Sorting index for application sequence | `1` | `2` |

---

### 3.3. Related `Product` Entity Properties (as consumed by Bundles)

When rendering bundle details or converting a bundle to product, the following product properties are inherited or referenced:

| Product Key | Type | Use in Bundle Context |
| :--- | :--- | :--- |
| `nameEn` / `nameAr` | `String` | Shown in "Included Formulations" pills and tabs |
| `ingredientsEn` / `ingredientsAr` | `String` | Aggregated into bundle's `Ingredients Spec` tab |
| `howToUseEn` / `howToUseAr` | `String` | Combined into bundle's `Application Ritual` tab |
| `price` / `discountPrice` | `Number` | Used to validate and calculate `originalPrice` |
| `image` / `galleryImages` | `String` / `Array` | Displayed in "Meet the Products" cards inside the bundle view |
| `categorySlug` | `String` | Used for complementary pairing in dynamic bundles |
| `stockStatus` | `String` | Controls whether the bundle can be purchased |

---

## 4. Concrete Database Seed Fixtures (Raw JSON from Frontend)

The backend database can be seeded with these three real bundles currently running in the `pharmaa` frontend:

```json
[
  {
    "slug": "dewy-hydration-duo",
    "nameEn": "The Dewy Hydration Duo",
    "nameAr": "ثنائي الترطيب المتوهج",
    "subtitleEn": "Double-action moisture lock with Oceanic Serum & Barrier Cream",
    "subtitleAr": "قفل ترطيب مزدوج المفعول مع سيروم المحيط وكريم حاجز البشرة",
    "descriptionEn": "The ultimate skin-quenching couple. This duo works in tandem: the Hydra-Renewal Serum floods skin cells with moisture, while the Velvet Cloud Barrier Cream locks it in and seals the skin barrier for a plump, velvet finish.",
    "descriptionAr": "الثنائي المثالي لترطيب وتغذية الخلايا. يعمل هذا الزوج جنباً إلى جنب: سيروم تجديد البشرة يغمر خلايا الجلد بالرطوبة الفائقة، بينما يعمل كريم الحاجز المخملي على قفل الترطيب وترميم الطبقة الدهنية الواقية.",
    "image": "/assets/images/hero_skincare_banner_1781217525355.jpg",
    "discountPercentage": 15,
    "originalPrice": 700,
    "bundlePrice": 595,
    "benefitsEn": [
      "Boosts skin moisture levels by 85% in 3 days",
      "Provides a perfect glass-skin makeup canvas",
      "Repairs compromised lipid barriers overnight"
    ],
    "benefitsAr": [
      "يرفع مستويات ترطيب البشرة بنسبة 85٪ في 3 أيام",
      "يمنحكِ بشرة زجاجية مثالية كقاعدة للمكياج",
      "يرمم حاجز الدهون المتضرر طوال فترة النوم ليلاً"
    ],
    "items": [
      {
        "productSlug": "ocean-glow-hydra-serum",
        "stepEn": "Step 1: Deep Hydra-Renewal",
        "stepAr": "الخطوة 1: تجديد الترطيب العميق",
        "benefitEn": "Plumps skin with dual-weight hyaluronic acid molecules.",
        "benefitAr": "يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن."
      },
      {
        "productSlug": "velvet-cloud-barrier-moisturizer",
        "stepEn": "Step 2: Seal & Protect Barrier",
        "stepAr": "الخطوة 2: قفل الترطيب وحماية الحاجز",
        "benefitEn": "Binds moisture and fills lipid voids with ceramides.",
        "benefitAr": "يربط جزيئات الماء داخل الخلايا ويسد الثغرات الدهنية بالسيراميد."
      }
    ]
  },
  {
    "slug": "ultimate-restoration-routine",
    "nameEn": "The Ultimate Restoration Routine",
    "nameAr": "روتين الترميم الفائق المتكامل",
    "subtitleEn": "The full 4-step professional clinical routine for ultimate skin health",
    "subtitleAr": "الروتين السريري المهني المتكامل من 4 خطوات لصحّة البشرة الفائقة",
    "descriptionEn": "Transform your daily ritual with our flagship routine. Designed as a synergistic four-step process to cleanse, treat, hydrate, and shield your skin against aging elements and environmental pollutants.",
    "descriptionAr": "حوّلي روتينكِ اليومي مع مجموعتنا الرائدة. مصممة كعملية متكاملة تآزرية من أربع خطوات لتنظيف، علاج، ترطيب، وحماية بشرتكِ من علامات الشيخوخة والملوثات البيئية.",
    "image": "/assets/images/product_cream_jar_1781217540516.jpg",
    "discountPercentage": 20,
    "originalPrice": 1145,
    "bundlePrice": 915,
    "benefitsEn": [
      "Comprehensive skincare from morning cleanse to night restoration",
      "Fades fine lines, redness, and sun damage within 14 days",
      "Reinforces natural microflora and blocks UV damage"
    ],
    "benefitsAr": [
      "عناية شاملة بالبشرة تبدأ من غسول الصباح وحتى ترميم الليل",
      "يخفي الخطوط الدقيقة والاحمرار وبقع الشمس في 14 يوماً",
      "يقوي البكتيريا الحيوية النافعة ويحجب أضرار الأشعة فوق البنفسجية"
    ],
    "items": [
      {
        "productSlug": "botanical-gel-pure-cleanser",
        "stepEn": "Step 1: Cleanse",
        "stepAr": "الخطوة 1: التنظيف اللطيف",
        "benefitEn": "Purifies skin of pollutants without stripping natural moisture.",
        "benefitAr": "ينظف البشرة بلطف من الملوثات والأتربة مع الحفاظ على ترطيبها."
      },
      {
        "productSlug": "ocean-glow-hydra-serum",
        "stepEn": "Step 2: Hydro-Infusion",
        "stepAr": "الخطوة 2: غمر الترطيب السيرومي",
        "benefitEn": "Provides rich oceanic seaweed nutrients and deep moisture.",
        "benefitAr": "يمنح البشرة عناصر الطحالب البحرية المغذية وترطيباً فائقاً."
      },
      {
        "productSlug": "velvet-cloud-barrier-moisturizer",
        "stepEn": "Step 3: Nourish & Rebuild",
        "stepAr": "الخطوة 3: التغذية وإعادة البناء",
        "benefitEn": "Delivers ceramides and squalane to repair skin lipids.",
        "benefitAr": "يغذي طبقات الجلد بالسيراميد والسكوالين لإعادة بناء الدهون."
      },
      {
        "productSlug": "solar-shield-uv-fluid",
        "stepEn": "Step 4: Shield SPF 50+",
        "stepAr": "الخطوة 4: درع الحماية SPF 50+",
        "benefitEn": "Invisible mineral shield blocking UVA/UVB photo-aging.",
        "benefitAr": "درع معدني غير مرئي يحمي من أضرار الشمس والشيخوخة الضوئية."
      }
    ]
  },
  {
    "slug": "clear-skin-clarifying-set",
    "nameEn": "The Clear Skin Clarifying Set",
    "nameAr": "مجموعة تنقية وتصفية البشرة",
    "subtitleEn": "Weekly detoxifying and balancing duo for clear, dynamic skin",
    "subtitleAr": "ثنائي أسبوعي لتنقية السموم وتصفية وتوازن إفراز دهون البشرة",
    "descriptionEn": "Perfect for skin prone to congestion or excessive oiliness. The prebiotic cleanser keeps daily sebum balanced, while the Glacial Marine Clay Mask acts as a weekly vacuum to clean pores and restore clarity.",
    "descriptionAr": "مثالي للبشرة المعرضة لانسداد المسام أو الإفرازات الدهنية الزائدة. يحافظ غسول البريبايوتك على توازن الدهون اليومي، بينما يعمل قناع الطين الكندي كمكنسة لتنقية المسام واستعادة إشراقة وجهكِ.",
    "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    "discountPercentage": 15,
    "originalPrice": 475,
    "bundlePrice": 400,
    "benefitsEn": [
      "Cleanses blackheads and reduces visible pore size",
      "Controls excessive midday oil production",
      "Provides weekly spa-grade colloidal mud purification"
    ],
    "benefitsAr": [
      "ينظف الرؤوس السوداء ويقلل من القطر المرئي للمسامات الواسعة",
      "يتحكم في إفرازات الزيوت والدهون المزعجة في منتصف النهار",
      "يوفر تنقية أسبوعية احترافية بـقوة الطين الغرواني البحري"
    ],
    "items": [
      {
        "productSlug": "botanical-gel-pure-cleanser",
        "stepEn": "Daily Cleanse: Botanical Gel",
        "stepAr": "تنظيف يومي: جل نباتي متوازن",
        "benefitEn": "Maintains prebiotic defense skin flora and extracts debris.",
        "benefitAr": "يحافظ على البكتيريا الدفاعية المفيدة ويزيل الأتربة اليومية."
      },
      {
        "productSlug": "glacial-clay-mask",
        "stepEn": "Weekly Detox: Marine Clay",
        "stepAr": "تقشير أسبوعي: قناع الطين البحري",
        "benefitEn": "Vacuums dead cells and tightens skin surfaces.",
        "benefitAr": "يسحب الخلايا الميتة والسموم ويشد المسامات المرتخية."
      }
    ]
  }
]
```

---

## 5. Mongoose Schema Architecture for `gravuta-backend`

To match the existing structure in `gravuta-backend/models/Product.js`, here is the exact schema definition for `Bundle.js`:

### 5.1. File: `gravuta-backend/models/Bundle.js`

```javascript
const mongoose = require('mongoose');

// Item within a bundle linking to a Product
const bundleProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'معرف المنتج مطلوب في الباقة (product reference is required)']
    },
    stepEn: {
        type: String,
        required: [true, 'خطوة الاستخدام بالإنجليزية مطلوبة (stepEn is required)'],
        trim: true
    },
    stepAr: {
        type: String,
        required: [true, 'خطوة الاستخدام بالعربية مطلوبة (stepAr is required)'],
        trim: true
    },
    benefitEn: {
        type: String,
        required: [true, 'فائدة المنتج في الباقة بالإنجليزية مطلوبة (benefitEn is required)'],
        trim: true
    },
    benefitAr: {
        type: String,
        required: [true, 'فائدة المنتج في الباقة بالعربية مطلوبة (benefitAr is required)'],
        trim: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'كمية المنتج يجب أن تكون 1 على الأقل']
    },
    order: {
        type: Number,
        default: 1
    }
}, { _id: false });

// Bundle Schema
const bundleSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'الاسم اللطيف للباقة مطلوب (slug is required)'],
        unique: true,
        trim: true,
        lowercase: true
    },
    nameEn: {
        type: String,
        required: [true, 'اسم الباقة بالإنجليزية مطلوب (nameEn is required)'],
        trim: true
    },
    nameAr: {
        type: String,
        required: [true, 'اسم الباقة بالعربية مطلوب (nameAr is required)'],
        trim: true
    },
    subtitleEn: {
        type: String,
        required: [true, 'العنوان الفرعي بالإنجليزية مطلوب (subtitleEn is required)'],
        trim: true
    },
    subtitleAr: {
        type: String,
        required: [true, 'العنوان الفرعي بالعربية مطلوب (subtitleAr is required)'],
        trim: true
    },
    descriptionEn: {
        type: String,
        required: [true, 'وصف الباقة بالإنجليزية مطلوب (descriptionEn is required)'],
        trim: true
    },
    descriptionAr: {
        type: String,
        required: [true, 'وصف الباقة بالعربية مطلوب (descriptionAr is required)'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'صورة الباقة مطلوبة (image is required)'],
        default: ''
    },
    items: {
        type: [bundleProductSchema],
        validate: {
            validator: function(items) {
                return Array.isArray(items) && items.length >= 2;
            },
            message: 'الباقة يجب أن تحتوي على منتجين على الأقل (Bundle must contain at least 2 products)'
        }
    },
    discountPercentage: {
        type: Number,
        required: [true, 'نسبة الخصم مطلوبة (discountPercentage is required)'],
        min: [1, 'نسبة الخصم يجب أن تكون 1% على الأقل'],
        max: [99, 'نسبة الخصم لا يمكن أن تتعدى 99%']
    },
    originalPrice: {
        type: Number,
        required: [true, 'السعر الأصلي للباقة مطلوب (originalPrice is required)'],
        min: [0, 'السعر الأصلي لا يمكن أن يكون سالباً']
    },
    bundlePrice: {
        type: Number,
        required: [true, 'سعر الباقة بعد الخصم مطلوب (bundlePrice is required)'],
        min: [0, 'سعر الباقة لا يمكن أن يكون سالباً']
    },
    benefitsEn: {
        type: [String],
        default: []
    },
    benefitsAr: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for Calculated Savings
bundleSchema.virtual('savings').get(function() {
    return this.originalPrice - this.bundlePrice;
});

// Indexing for rapid queries
bundleSchema.index({ slug: 1 });
bundleSchema.index({ 'items.product': 1 });
bundleSchema.index({ isActive: 1 });

module.exports = mongoose.model('Bundle', bundleSchema);
```

---

### 5.2. Updates to `Cart.js` & `Order.js`

To gracefully handle both individual products and bundles, the Cart item and Order item schemas should be enhanced:

#### File: `gravuta-backend/models/Cart.js` (Enhanced)
```javascript
const cartItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ['product', 'bundle'],
        default: 'product'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: function() { return this.itemType === 'product'; }
    },
    bundle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle',
        required: function() { return this.itemType === 'bundle'; }
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'الكمية يجب أن تكون 1 على الأقل']
    },
    selectedSize: {
        type: String,
        default: 'Standard' // For bundles: "Complete Set"
    }
}, { _id: false });
```

---

## 6. Joi Validation Schemas

Following the existing pattern in `gravuta-backend/validations/`:

### File: `gravuta-backend/validations/bundle.validation.js`
```javascript
const Joi = require('joi');

const bundleItemSchema = Joi.object({
    product: Joi.string().hex().length(24).required().messages({
        'string.length': 'معرف المنتج يجب أن يكون معرف صالح (24 hex characters)',
        'any.required': 'معرف المنتج مطلوب'
    }),
    stepEn: Joi.string().required(),
    stepAr: Joi.string().required(),
    benefitEn: Joi.string().required(),
    benefitAr: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
    order: Joi.number().integer().min(1).default(1)
});

const createBundleSchema = Joi.object({
    slug: Joi.string().trim().lowercase().required(),
    nameEn: Joi.string().trim().min(3).required(),
    nameAr: Joi.string().trim().min(3).required(),
    subtitleEn: Joi.string().trim().required(),
    subtitleAr: Joi.string().trim().required(),
    descriptionEn: Joi.string().trim().required(),
    descriptionAr: Joi.string().trim().required(),
    discountPercentage: Joi.number().min(1).max(99).required(),
    originalPrice: Joi.number().positive().required(),
    bundlePrice: Joi.number().positive().less(Joi.ref('originalPrice')).required().messages({
        'number.less': 'سعر الباقة المخفض يجب أن يكون أقل من السعر الأصلي'
    }),
    benefitsEn: Joi.array().items(Joi.string()).min(1).required(),
    benefitsAr: Joi.array().items(Joi.string()).min(1).required(),
    items: Joi.array().items(bundleItemSchema).min(2).required().messages({
        'array.min': 'يجب أن تحتوي الباقة على منتجين على الأقل'
    }),
    isActive: Joi.boolean().default(true)
});

const updateBundleSchema = Joi.object({
    slug: Joi.string().trim().lowercase(),
    nameEn: Joi.string().trim().min(3),
    nameAr: Joi.string().trim().min(3),
    subtitleEn: Joi.string().trim(),
    subtitleAr: Joi.string().trim(),
    descriptionEn: Joi.string().trim(),
    descriptionAr: Joi.string().trim(),
    discountPercentage: Joi.number().min(1).max(99),
    originalPrice: Joi.number().positive(),
    bundlePrice: Joi.number().positive(),
    benefitsEn: Joi.array().items(Joi.string()),
    benefitsAr: Joi.array().items(Joi.string()),
    items: Joi.array().items(bundleItemSchema).min(2),
    isActive: Joi.boolean()
}).min(1);

module.exports = {
    createBundleSchema,
    updateBundleSchema
};
```

---

## 7. RESTful API Endpoints Specification

### 7.1. Public Client Routes (`/api/bundles`)

#### 1. `GET /api/bundles`
* **Purpose**: List all active skincare bundles for the bundles listing page (`BundlesListingView.tsx`).
* **Query Parameters**:
  * `page` (Default: 1): Current page.
  * `limit` (Default: 10): Items per page.
  * `sort` (e.g. `bundlePrice`, `-discountPercentage`, `-createdAt`).
* **Response**:
```json
{
  "success": true,
  "count": 3,
  "pagination": { "page": 1, "limit": 10, "totalPages": 1 },
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
      "image": "/assets/images/hero_skincare_banner_1781217525355.jpg",
      "items": [
        {
          "product": {
            "_id": "661...",
            "nameEn": "Ocean Glow Hydra-Renewal Serum",
            "nameAr": "سيروم التجديد الساحلي الفاتن",
            "price": 320,
            "image": "/assets/images/hero_skincare_banner_1781217525355.jpg"
          },
          "stepEn": "Step 1: Deep Hydra-Renewal",
          "stepAr": "الخطوة 1: تجديد الترطيب العميق",
          "benefitEn": "Plumps skin with dual-weight hyaluronic acid molecules.",
          "benefitAr": "يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن."
        }
      ]
    }
  ]
}
```

#### 2. `GET /api/bundles/:slugOrId`
* **Purpose**: Retrieve full details of a specific bundle for the bundle details view (`ProductDetailsView.tsx`).
* **Logic**: Populates each `item.product` with its full fields (ingredients, howToUse, benefits, galleryImages, stockStatus).

#### 3. `GET /api/bundles/by-product/:productId`
* **Purpose**: Powers the *"Featured Bundles Including This Product"* slider at the bottom of the single product page.
* **Database Query**: `Bundle.find({ isActive: true, 'items.product': req.params.productId }).populate('items.product')`

---

### 7.2. Admin Management Routes (`/api/admin/bundles`)
*(Protected by `verifyToken` and `isAdmin` middlewares)*

#### 1. `POST /api/admin/bundles`
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`, `Content-Type: multipart/form-data`
* **Middleware**: `upload.single('image')`, `validate(createBundleSchema)`
* **Function**: Uploads banner image, verifies all product IDs exist in DB, validates financial calculations, and creates the bundle document.

#### 2. `PUT /api/admin/bundles/:id`
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`, `Content-Type: multipart/form-data` or `application/json`
* **Function**: Updates prices, included products, steps, or replaces the banner image.

#### 3. `DELETE /api/admin/bundles/:id`
* **Function**: Deactivates (`isActive = false`) or removes the bundle document.

---

## 8. Business Logic & Validation Rules

When building this module in Express/Mongoose:

1. **Constituent Product Validation**:
   * Before saving a bundle, the controller must query `Product.find({ _id: { $in: productIds } })` to ensure every referenced product exists and is active.
2. **Auto-Recalculate or Sanity-Check Pricing**:
   * Ensure that:
     $$\text{bundlePrice} = \text{originalPrice} \times (1 - \frac{\text{discountPercentage}}{100})$$
   * Prevent saving any bundle where `bundlePrice >= originalPrice`.
3. **Availability & Stock Guard**:
   * If any product has `stockStatus === 'out_of_stock'`, the bundle response can include an `isAvailable: false` flag.
4. **Order Processing Transaction**:
   * When an order contains a bundle, use a MongoDB Session / Transaction (`mongoose.startSession()`):
     ```javascript
     for (const item of bundle.items) {
       await Product.findByIdAndUpdate(item.product, {
         $inc: { stock: -1 * orderItem.quantity }
       }, { session });
     }
     ```

---

## 9. Backend Implementation Plan (Step-by-Step)

The following steps integrate the Bundles module directly into `gravuta-backend`:

| Step | Action | Files to Create / Modify |
| :---: | :--- | :--- |
| **Step 1** | **Create Model** | Create `gravuta-backend/models/Bundle.js` using the schema defined in Section 5. |
| **Step 2** | **Create Joi Validator** | Create `gravuta-backend/validations/bundle.validation.js` with validation rules for items and pricing. |
| **Step 3** | **Create Controller** | Create `gravuta-backend/controllers/bundle.controller.js` with functions: `getBundles`, `getBundleByIdOrSlug`, `getBundlesByProduct`, `createBundle`, `updateBundle`, `deleteBundle`. |
| **Step 4** | **Create Routes** | Create `gravuta-backend/routes/bundle.routes.js` (public) and `gravuta-backend/routes/admin.bundle.routes.js` (admin CRUD). |
| **Step 5** | **Register in Express Server** | Update `gravuta-backend/index.js` to mount `/api/bundles` and `/api/admin/bundles`. |
| **Step 6** | **Cart & Order Integration** | Update `models/Cart.js`, `routes/cart.routes.js`, and `routes/order.routes.js` to support bundle items and multi-product stock decrementing. |
| **Step 7** | **Seed Database** | Create `gravuta-backend/scripts/seedBundles.js` to populate the 3 mock bundles with their relations to products in the database. |

---

## 10. Summary Matrix for Developers

```
+-------------------------------------------------------------------------------------------------------------+
| Entity       | Slug                           | Items Count | Retail (Original) | Bundle Price | Savings    |
+-------------------------------------------------------------------------------------------------------------+
| Hydration    | dewy-hydration-duo             | 2 products  | 700 AED           | 595 AED      | 105 AED    |
| Restoration  | ultimate-restoration-routine   | 4 products  | 1145 AED          | 915 AED      | 230 AED    |
| Clear Skin   | clear-skin-clarifying-set      | 2 products  | 475 AED           | 400 AED      | 75 AED     |
+-------------------------------------------------------------------------------------------------------------+
```
This specification contains everything required to implement the Bundles backend logic, models, controllers, and database relationships in Node.js, Express, and MongoDB.
