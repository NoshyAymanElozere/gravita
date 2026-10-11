import { Category, Product, Review, Coupon, Bundle } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat_cleansers',
    slug: 'cleansers',
    nameEn: 'Cleansers',
    nameAr: 'منظفات البشرة',
    descriptionEn: 'Purify, refresh and prepare your skin canvas without stripping moisture.',
    descriptionAr: 'نظفي بشرتكِ، وأعيدي لها الحيوية والنعومة مع الحفاظ على ترطيبها الأساسي.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat_serums',
    slug: 'serums',
    nameEn: 'Serums & Elixirs',
    nameAr: 'السيروم والإكسير',
    descriptionEn: 'Potent concentrations of active ingredients focused on deep renewal.',
    descriptionAr: 'تركيبات حيوية مركزة لحل مشاكل البشرة العميقة وتحفيز تجديد الخلايا.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat_moisturizers',
    slug: 'moisturizers',
    nameEn: 'Moisturizers & Creams',
    nameAr: 'المرطبات والكريمات',
    descriptionEn: 'Rich infusions to lock in deep hydration, rebuilding the lipid barrier.',
    descriptionAr: 'تركيبات غنية لحبس الترطيب داخل خلايا البشرة وإعادة بناء حاجز الحماية الطبيعي.',
    image: '/assets/images/product_cream_jar_1781217540516.jpg'
  },
  {
    id: 'cat_sunscreens',
    slug: 'sunscreens',
    nameEn: 'Sunscreens & UV Protection',
    nameAr: 'واقيات الشمس والحماية',
    descriptionEn: 'Invisible shields guarding against aging UVB/UVA rays and environmental stressors.',
    descriptionAr: 'دروع غير مرئية تحمي بشرتكِ من علامات الشيخوخة والشوارد الضارة للأشعة فوق البنفسجية.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat_facemasks',
    slug: 'face-masks',
    nameEn: 'Face Masks & Peels',
    nameAr: 'الأقنعة والتقشير',
    descriptionEn: 'Weekly spa-grade treatments targeting intense nourishment and purification.',
    descriptionAr: 'علاجات أسبوعية تمنحكِ تجربة السبا الفاخرة لتغذية مكثفة وتنقية فائقة للبشرة.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat_eyecare',
    slug: 'eye-care',
    nameEn: 'Eye & Micro-Zone Care',
    nameAr: 'العناية بمنطقة العين',
    descriptionEn: 'Ultra-gentle balms and serums to firm and awaken the delicate eye contour.',
    descriptionAr: 'بلسم وسيروم لطيف للغاية لشد وتفتيح الهالات وتقليل الانتفاخات حول محيط العينين.',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod_ocean_glow',
    slug: 'ocean-glow-hydra-serum',
    nameEn: 'Ocean Glow Hydra-Renewal Serum',
    nameAr: 'سيروم التجديد الساحلي الفاتن',
    subtitleEn: 'Intense hydration complex with seaweed extract and dual-weight hyaluronic acid',
    subtitleAr: 'مركب ترطيب فائق مع مستخلص الطحالب البحرية وحمض الهيالورونيك ثنائي الوزن',
    descriptionEn: 'Our multi-dimensional formulation delivers instant, dew-like radiance. Designed to plunge beneath the surface to establish rich moisture reservoirs. Fine lines look visibly plumped, and the skin barrier recovers its natural springiness within days.',
    descriptionAr: 'تركيبتنا متعددة الأبعاد تمنحكِ إشراقة فورية شبيهة بقطرات الندى. مصممة لتتغلغل تحت سطح البشرة لتأسيس خزانات رطوبة عميقة. تبدو الخطوط الدقيقة ممتلئة بشكل ملحوظ، ويستعيد حاجز البشرة مرونته الطبيعية في غضون أيام.',
    ingredientsEn: 'Pure Oceanic Seaweed Ferment, Sodium Hyaluronate (Dual Weight), Organic Aloe Barbadensis Leaf Extract, Panthenol, Glycerin, Centella Asiatica Extract, Distilled Water.',
    ingredientsAr: 'خميرة الأعشاب البحرية النقية، هيالورونات الصوديوم (ثنائي الوزن)، مستخلص أوراق الصبار العضوي، البانثينول، الجلسرين، مستخلص سنتيلا أسياتيكا، مياه مقطرة.',
    skinTypeEn: 'Dry, Dehydrated, Sensitive',
    skinTypeAr: 'الجافة، الفاقدة للترطيب، الحساسة',
    benefitsEn: [
      'Up to 72 hours of deep moisture retention',
      'Transforms dull, dry texture into a silky visual canvas',
      'Minimizes redness and soothes irritated skin layers'
    ],
    benefitsAr: [
      'ترطيب عميق يدوم حتى 72 ساعة متواصلة',
      'يحول البشرة الباهتة والجافة إلى ملمس حريري جذاب',
      'يقلل من الاحمرار ويهدئ طبقات الجلد المتهيجة'
    ],
    howToUseEn: 'Dispense 3-4 drops onto cleansed, slightly damp skin. Path gently in upward circular motions. For optimal luxury, allow 1 minute to melt into the skin before styling with creams.',
    howToUseAr: 'ضعي 3-4 قطرات على بشرة نظيفة ورطبة قليلاً. دلكي بلطف بحركات دائرية لأعلى. للحصول على أقصى درجات الفخامة، اتركي السيروم لمدة دقيقة واحدة ليمتزج بذكاء مع البشرة قبل وضع الكريمات.',
    price: 320,
    discountPrice: 275,
    rating: 4.9,
    reviewCount: 148,
    size: '50ml',
    image: '/assets/images/hero_skincare_banner_1781217525355.jpg',
    galleryImages: [
      '/assets/images/hero_skincare_banner_1781217525355.jpg',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80'
    ],
    isBestSeller: true,
    isNew: false,
    stockStatus: 'in_stock',
    categorySlug: 'serums'
  },
  {
    id: 'prod_velvet_cloud',
    slug: 'velvet-cloud-barrier-moisturizer',
    nameEn: 'Velvet Cloud Lipid-Barrier Moisturizer',
    nameAr: 'كريم مرطب حاجز مخملي دافئ',
    subtitleEn: 'Rich replenishing emulsion packed with ceramides, squalane, and shea butter',
    subtitleAr: 'مستحلب مغذي غني بالسيراميد، السكوالين العضوي، وزبدة الشيا الفاخرة',
    descriptionEn: 'A luxury, soufflé-textured cream that envelopes dry or suffering skin in ultimate absolute comfort. Formulated with key skin-identical lipids to repair micro-voids in the stratum corneum, creating a protective cashmere-soft barrier that lasts all night.',
    descriptionAr: 'كريم فاخر بقوام السوفليه يغلف البشرة الجافة أو المجهدة براحة مطلقة. مركب من دهون مطابقة للمكونات الطبيعية للبشرة لترميم الثقوب الدقيقة في الطبقة القرنية، مما يخلق حاجزًا واقيًا ناعمًا كالكشمير يدوم طوال الليل.',
    ingredientsEn: 'Ceramides NP & AP, Plant-Derived Squalane (15%), Organic Shea Butter, Niacinamide (4%), Vitamin E (Tocopherol), Jojoba Seed Oil, Hydrolyzed Oat Protein.',
    ingredientsAr: 'سيراميد ن ب و أ ب، سكوالين نباتي (15٪)، زبدة الشيا العضوية، نياسيناميد (4٪)، فيتامين هـ (توكوفيرول)، زيت بذور الجوجوبا، بروتين الشوفان المحلل.',
    skinTypeEn: 'Dry, Normal, Sensitive, Mature',
    skinTypeAr: 'الجافة، العادية، الحساسة، والمتقدمة في السن',
    benefitsEn: [
      'Reconstructs a damaged skin lipid barrier',
      'Prevents transepidermal water loss (TEWL) during sleep',
      'Creates a smooth, flawless base for cosmetics'
    ],
    benefitsAr: [
      'يعيد بناء حاجز الدهون التالف للبشرة المتضررة',
      'يمنع فقدان الماء عبر البشرة أثناء النوم',
      'يخلق قاعدة ناعمة وخالية من العيوب لمستحضرات التجميل'
    ],
    howToUseEn: 'Warm a pea-sized amount between clean fingertips and press gently into the face and neck in a lifting massage pattern. Best leveraged morning and night.',
    howToUseAr: 'دلكي كمية صغيرة بحجم حبة البازلاء بين أطراف أصابعك النظيفة واضغطي بلطف على الوجه والرقبة بحركات لرفع البشرة. يفضل كعلاج يومي صباحاً ومساءً.',
    price: 380,
    rating: 4.8,
    reviewCount: 92,
    size: '100ml',
    image: '/assets/images/product_cream_jar_1781217540516.jpg',
    galleryImages: [
      '/assets/images/product_cream_jar_1781217540516.jpg',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
    ],
    isBestSeller: true,
    isNew: true,
    stockStatus: 'in_stock',
    categorySlug: 'moisturizers'
  },
  {
    id: 'prod_botanical_gel',
    slug: 'botanical-gel-pure-cleanser',
    nameEn: 'Botanical Harmony Pure Prebiotic Cleanser',
    nameAr: 'منظف البريبايوتك هرموني نباتي',
    subtitleEn: 'pH-balanced foaming gel clearing environmental debris and makeup without tightness',
    subtitleAr: 'جل رغوي متوازن الحموضة ينقي الوجه من الأوساخ والمكياج دون جفاف',
    descriptionEn: 'A soothing prebiotic surfactant system that binds perfectly to impurities while respecting skin microflora. Enriched with chamomile water and green tea polyphenols to calm inflammation, leaving the face completely purified, dynamic, and refreshed.',
    descriptionAr: 'نظام من المكونات النباتية المهدئة للبريبايوتك يرتبط بكفاءة بالشوائب مع احترام الفلورا الحيوية الدقيقة للبشرة. غني بمياه البابونج وبوليفينول الشاي الأخضر لتهدئة الاحتقان، مما يترك البشرة نقية وحيوية ورطبة.',
    ingredientsEn: 'Organic Chamomile Hydrosol, Green Tea Extract, Prebiotic Inulin Co-Factor, Cocamidopropyl Betaine (Sugar derived), Allantoin, White Willow Bark Extract, Citric Acid.',
    ingredientsAr: 'هيدروسول البابونج العضوي، مستخلص الشاي الأخضر، عامل مكمل للبريبايوتك، كوكاميدوبروبيل بيتين (مشتق من السكر)، ألانتوين، مستخلص لحاء الصفصاف الأبيض، حمض الستريك.',
    skinTypeEn: 'Combination, Oily, Acne-Prone',
    skinTypeAr: 'المختلطة، الدهنية، والمعرضة لحب الشباب',
    benefitsEn: [
      'Superb deep pore purification without skin irritation',
      'Balances oil and sebum production while respecting natural pH',
      'Contains prebiotics to support a strong skin defense flora'
    ],
    benefitsAr: [
      'تنقية فائقة للمسامات العميقة دون تهيج للجلد والوجه',
      'يوازن إفراز الدهون والزيوت مع احترام درجة الحموضة الطبيعية',
      'يحتوي على البريبايوتكس لتعزيز بكتيريا البشرة النافعة والدفاعية'
    ],
    howToUseEn: 'Lather between damp palms and massage gently onto wet skin for 60 seconds. Rinse thoroughly with lukewarm water. Use before applying AURA serums.',
    howToUseAr: 'رغي كمية كافية بين راحتي يديك الرطبتين ودلكي بشرتك المبللة بحركات رقيقة لمدة 60 ثانية. اشطفي وجهكِ جيداً بالماء الفاتر. استخدميه قبل وضع سيروم أورا.',
    price: 195,
    discountPrice: 160,
    rating: 4.7,
    reviewCount: 220,
    size: '150ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80'
    ],
    isBestSeller: false,
    isNew: false,
    stockStatus: 'in_stock',
    categorySlug: 'cleansers'
  },
  {
    id: 'prod_solar_shield',
    slug: 'solar-shield-uv-fluid',
    nameEn: 'Solar Shield Invisible SPF50+ Defense',
    nameAr: 'واقي شمسي درع الشمس غير المرئي SPF50+',
    subtitleEn: 'Broad-spectrum mineral protectant with non-greasy cashmere finishing',
    subtitleAr: 'واقي معدني واسع الطيف بفرش مخملي غير دهني شفاف تماماً للضوء',
    descriptionEn: 'An ultra-refined fluid that melts instantly with zero white cast. Uses non-nano zinc oxide to form a reliable physical UV filter alongside antioxidants like Vitamin C and Pinus Pinaster extract to fight solar-induced pigmentation and skin photodamage.',
    descriptionAr: 'سائل فائق النقاء يمتزج فوراً بالبشرة دون ترك أي رواسب بيضاء. يستخدم أكسيد الزنك غير النانوي لتشكيل مرشح حماية طبيعي ضد الأشعة فوق البنفسجية بجانب مضادات الأكسدة مثل فيتامين سي لـعلاج البقع والتصبغات الناتجة عن الشمس.',
    ingredientsEn: 'Zinc Oxide (Non-Nano 18%), Pine Bark Extract, Ascorbyl Palmitate (Vitamin C Stable), Grape Seed Oil, Hyaluronic Acid, Organic Jojoba Esters.',
    ingredientsAr: 'أكسيد الزنك (غير نانوي 18٪)، مستخلص لحاء الصنوبر، بالميتات أسكوربيل (فيتامين سي المستقر)، زيت بذور العنب، حمض الهيالورونيك، إسترات الجوجوبا العضوية.',
    skinTypeEn: 'All Skin Types, Oily, Sensitive',
    skinTypeAr: 'جميع أنواع البشرة، الدهنية، الحساسة',
    benefitsEn: [
      'Broad spectrum UVA & UVB protection (SPF 50+, PA++++)',
      'Extremely light finish - makes skin glow non-greasily',
      'Reef-safe, botanical and 100% conscious formulation'
    ],
    benefitsAr: [
      'حماية واسعة الطيف ضد أشعة UVA و UVB (SPF 50+ ، PA++++)',
      'ملمس خفيف للغاية - يمنح البشرة توهجًا دافئًا دون لمعان دهني',
      'تركيبة نباتية صديقة للشعاب المرجانية والبيئة 100٪ دون أي كيماويات'
    ],
    howToUseEn: 'Shake vigorously before use. Apply two finger-lengths of the fluid evenly across face, ears and neck 15 minutes before sun exposure.',
    howToUseAr: 'رجي العبوة جيداً قبل الاستخدام. وزعي كمية بطول إصبعين بالتساوي على الوجه والأذنين والرقبة قبل 15 دقيقة من التعرض لأشعة الشمس.',
    price: 250,
    rating: 4.9,
    reviewCount: 382,
    size: '50ml',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
    ],
    isBestSeller: true,
    isNew: false,
    stockStatus: 'in_stock',
    categorySlug: 'sunscreens'
  },
  {
    id: 'prod_glacial_clay',
    slug: 'glacial-clay-mask',
    nameEn: 'Glacial Marine Clay Detox Mask',
    nameAr: 'قناع الطين البحري الجليدي الفاخر لتنقية السموم',
    subtitleEn: 'British Columbian glacial clay enriched with salicylic acid and Canadian willowherb',
    subtitleAr: 'طين جليدي غني بحمض الساليسيليك ونبتة الصفصاف الكندية المنعشة لشد البشرة',
    descriptionEn: 'Treat skin once a week with pure colloidal clay to sweep debris from congested pores, vacuuming away blackheads and dead surface cells. Its creamy texture refines rough skin blocks, instigating pristine microcirculation and visible glowing clarity.',
    descriptionAr: 'عالجي بشرتك وتألقها مرة واحدة أسبوعياً بالطين الغرواني النقي لإزالة الأوساخ من المسام المحتقنة، وشفط الرؤوس السوداء والخلايا الميتة. ملمسه الكريمي الفريد يرفع من نعومة البشرة وينشط الدورة الدموية الدقيقة للحصول على إشراقة نقية وجذابة.',
    ingredientsEn: 'Colloidal Canadian Glacial Clay, Salicylic Acid (BHA 1%), Canadian Willowherb Extract, Honey Ferment, Zinc PCA, Organic Chamomile Extract, French Green Clay.',
    ingredientsAr: 'طين جليدي كندي غرواني، حمض الساليسيليك (BHA 1٪)، مستخلص نبتة الصفصاف الكندية، عسل مخمر، حمض الزنك PCA، مستخلص البابونج العضوي، الطين الأخضر الفرنسي.',
    skinTypeEn: 'Oily, Combination, Congested, Acne-Prone',
    skinTypeAr: 'الدهنية، المختلطة، ذات المسام المزدحمة، والمعرضة لحب الشباب',
    benefitsEn: [
      'Pulls out microscopic impurities, excess sebum, and toxins',
      'Refines pores and minimizes their physical visual diameter',
      'Does not leave skin dry or flaky due to hydrating ferment oils'
    ],
    benefitsAr: [
      'يسحب الشوائب المجهرية والدقيقة والدهون الزائدة والسموم بكفاءة',
      'يصفي المسامات ويقلل من قطرها وعمقها المرئي بشكل ملحوظ',
      'لا يترك البشرة جافة أو متقشرة بفض الزيوت المخمرة المرطبة'
    ],
    howToUseEn: 'Apply an even layer over dry facial skin, steering clear of eye areas. Feel the cooling pulse as it dries for 10-12 minutes. Clean thoroughly with warm water.',
    howToUseAr: 'ضعي طبقة متساوية على بشرة الوجه الجافة مع تجنب منطقة العين. اشعري بالنبض البارد المنعش أثناء جفافه لمدة 10-12 دقيقة، ثم اغسليه جيداً بماء دافئ.',
    price: 280,
    discountPrice: 220,
    rating: 4.6,
    reviewCount: 77,
    size: '120g',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80'
    ],
    isBestSeller: false,
    isNew: true,
    stockStatus: 'in_stock',
    categorySlug: 'face-masks'
  },
  {
    id: 'prod_caffeine_eye',
    slug: 'caffeine-eye-sculpt-balm',
    nameEn: 'Caffeine & Peptide Micro-Sculpt Eye Balm',
    nameAr: 'بلسم نحت محيط العين بالكافيين والببتيدات النادرة',
    subtitleEn: 'Targeted cooling balm to reduce puffiness, brighten dark circles, and lift fine wrinkles',
    subtitleAr: 'بلسم تبريد مركّز للحد من الانتفاخات الفورية وتفتيح الهالات السوداء حول مقلة العين',
    descriptionEn: 'A luxury microdevice-grade cream that delivers high doses of direct cell stimulants and multi-peptides. Awakens fatigue, blocks fluid accumulation beneath the eyes, and triggers cellular collagen levels to restore youthfulness and structural lift.',
    descriptionAr: 'كريم مجهري فاخر يمنحكِ جرعات عالية من محفزات الخلايا النشطة والببتيدات المتعددة. يوقظ البشرة المجهدة والهالات المظلمة، ويمنع تراكم السوائل تحت العين، ويحفز الكولاجين الطبيعي لاستعادة تماسك ورفع محيط العينين.',
    ingredientsEn: 'Siberian Caffeine Powder (4%), Acetyl Quadrapeptide-5, Haloxyl Complex, Green Tea Polyphenols, Organic Avocado Butter, Squalane, Hyaluronic Acid.',
    ingredientsAr: 'مسحوق الكافيين السيبيري (4٪)، أسيتيل كوادرا ببتيد-5، مركب هالوكسيل لتبييض الهالات، بوليفينول الشاي الأخضر، زبدة الأفوكادو العضوية، سكوالين، حمض الهيالورونيك.',
    skinTypeEn: 'All Skin Types, Mature, Fatigued',
    skinTypeAr: 'جميع أنواع البشرة، البشرة المتقدمة في السن والمجهدة والمترهلة',
    benefitsEn: [
      'Rapidly drains fluid under the eye to stop morning puffy eyes',
      'Dissolves dark circles via blood-pigment micro-clearing',
      'Reduces appearance of crow’s feet wrinkles in fine zones'
    ],
    benefitsAr: [
      'يصرف السوائل المحتبسة تحت العين بسرعة للتخلص من الانتفاخات الصباحية',
      'يفتت الهالات السوداء حول العينين من خلال تنشيط الدورة الدموية',
      'يقلل من التجاعيد والخطوط التعبيرية الدقيقة حول زوايا العينين'
    ],
    howToUseEn: 'Dab a tiny dot of cream and pat gently under and around both eyes using your ring finger. Start from inner corners and work outward to support proper lymphatic drainage.',
    howToUseAr: 'ضعي نقطة صغيرة جداً من بلسم العين وطبطبي بلطف تحت وحول كلتا العينين باستخدام إصبع البنصر. ابدئي من الزوايا الداخلية باتجاه الخارج لتنشيط الدورة اللمفاوية وسحب السموم.',
    price: 310,
    rating: 4.8,
    reviewCount: 114,
    size: '15ml',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
    ],
    isBestSeller: false,
    isNew: false,
    stockStatus: 'in_stock',
    categorySlug: 'eye-care'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    author: 'Serene Al-Ghamdi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2026-05-18',
    commentEn: 'Absolute perfection. The Ocean Hydra Serum revived my dehydrated combination skin in just one week. I live in Dubai with intense AC dry environments, and this is the only thing that works. It leaves a gorgeous, non-oily morning glow!',
    commentAr: 'كمال مطلق في زجاجة. سيروم أوشن هيدرا أعاد الحياة لبشرتي المختلطة والفاقدة للرطوبة في غضون أسبوع واحد فقط. أعيش في دبي حيث التكييف شديد الجفاف للبشرة، وهذا هو المستحضر الوحيد الذي أنقذ وريّح خلايا وجهي دون أي دهون!',
    productNameEn: 'Ocean Glow Hydra-Renewal Serum',
    productNameAr: 'سيروم التجديد الساحلي الفاتن',
    verified: true,
    helpfulCount: 42
  },
  {
    id: 'rev_2',
    author: 'Victoria Sterling',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2026-06-02',
    commentEn: 'Using the Velvet Cloud cream alongside the SPF50 fluid. My skin barrier feels stronger and looks like actual silk under makeup. You can immediately feel the quality of these natural formulations - the smell and premium thick texture are pure heaven!',
    commentAr: 'أستخدم كريم فيلفيت كلاود بجانب واقي الشمس والنتيجة مبهرة. أصبح حاجز حماية بشرتي قوياً وتبدو ناعمة كالحرير تحت المكياج. تشعرين على الفور بالجودة الفائقة لهذه التركيبات المغذية - الرائحة والنعومة سحر حقيقي!',
    productNameEn: 'Velvet Cloud Lipid-Barrier Moisturizer',
    productNameAr: 'كريم مرطب حاجز مخملي دافئ',
    verified: true,
    helpfulCount: 19
  },
  {
    id: 'rev_3',
    author: 'Faris Abdel-Malek',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    date: '2026-06-08',
    commentEn: 'Clean, simple, non-stripping prebiotic cleanser. Finally a gel that effectively dissolves sun defense and city residue without tightening my dry sensitive areas. Strongly recommended for luxury-minded people looking for serious skin health.',
    commentAr: 'منظف البريبايوتك الرقيق. أخيراً غسول جل يذيب واقيات الشمس والأتربة بشكل فعال وممتاز دون شد أو تهيج للمناطق الجافة والحساسة في وجهي. أنصح به بشدة لكل شخص يبحث عن جودة وأمان لصحّة جلود وجهه.',
    productNameEn: 'Botanical Harmony Pure Prebiotic Cleanser',
    productNameAr: 'منظف البريبايوتك هرموني نباتي',
    verified: true,
    helpfulCount: 11
  },
  {
    id: 'rev_4',
    author: 'Amina Al-Mansour',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2026-06-15',
    commentEn: 'Combine the Botanical Cleanser with the Ocean Hyaluronic Serum. My acne-prone skin cleared out, clogged pores resolved, and hyperpigmentation faded. Truly medical grade luxury!',
    commentAr: 'جمعت بين الغسول النباتي وسيروم الهيالورونيك، والنتيجة خرافية! صَفَت الحبوب من بشرتي وتلاشت التصبغات تماماً. فعلاً مستحضرات علاجية فاخرة!',
    productNameEn: 'Prebiotic Botanical Gel Cleanser',
    productNameAr: 'غسول الجل النباتي الحيوي المقوي للبشرة',
    verified: true,
    helpfulCount: 27
  }
];

export const COUPONS: Coupon[] = [
  {
    code: 'AURA20',
    discountType: 'percentage',
    value: 20,
    minOrderAmount: 150,
    expiresAt: '2026-12-31',
    descriptionEn: 'Receive 20% off your entire luxurious skincare routine. Min order 150 AED/SAR.',
    descriptionAr: 'خصم 20٪ على كامل طلبيتكِ الفاخرة لروتين العناية بالبشرة. الحد الأدنى للطلب 150 ريال/درهم.'
  },
  {
    code: 'SAVE50',
    discountType: 'fixed',
    value: 50,
    minOrderAmount: 300,
    expiresAt: '2026-12-31',
    descriptionEn: 'Get a flat 50 AED/SAR off when you stock up above 300 AED/SAR.',
    descriptionAr: 'وفر 50 ريال/درهم فورياً عند شرائكِ لمنتجات بقيمة تفوق 300 ريال/درهم.'
  },
  {
    code: 'GLOWGLOW',
    discountType: 'percentage',
    value: 10,
    minOrderAmount: 0,
    expiresAt: '2026-10-15',
    descriptionEn: 'Special newcomer offer! Save 10% on any individual skin elixir.',
    descriptionAr: 'عرض خاص للعملاء الجدد! وفري 10٪ على أي منتج إكسير بشرة فردي.'
  }
];

export const BUNDLES: Bundle[] = [
  {
    id: 'bundle_hydration_duo',
    slug: 'dewy-hydration-duo',
    nameEn: 'The Dewy Hydration Duo',
    nameAr: 'ثنائي الترطيب المتوهج',
    subtitleEn: 'Double-action moisture lock with Oceanic Serum & Barrier Cream',
    subtitleAr: 'قفل ترطيب مزدوج المفعول مع سيروم المحيط وكريم حاجز البشرة',
    descriptionEn: 'The ultimate skin-quenching couple. This duo works in tandem: the Hydra-Renewal Serum floods skin cells with moisture, while the Velvet Cloud Barrier Cream locks it in and seals the skin barrier for a plump, velvet finish.',
    descriptionAr: 'الثنائي المثالي لترطيب وتغذية الخلايا. يعمل هذا الزوج جنباً إلى جنب: سيروم تجديد البشرة يغمر خلايا الجلد بالرطوبة الفائقة، بينما يعمل كريم الحاجز المخملي على قفل الترطيب وترميم الطبقة الدهنية الواقية.',
    image: '/assets/images/hero_skincare_banner_1781217525355.jpg',
    discountPercentage: 15,
    originalPrice: 700,
    bundlePrice: 595,
    benefitsEn: [
      'Boosts skin moisture levels by 85% in 3 days',
      'Provides a perfect glass-skin makeup canvas',
      'Repairs compromised lipid barriers overnight'
    ],
    benefitsAr: [
      'يرفع مستويات ترطيب البشرة بنسبة 85٪ في 3 أيام',
      'يمنحكِ بشرة زجاجية مثالية كقاعدة للمكياج',
      'يرمم حاجز الدهون المتضرر طوال فترة النوم ليلاً'
    ],
    items: [
      {
        product: PRODUCTS[0],
        stepEn: 'Step 1: Deep Hydra-Renewal',
        stepAr: 'الخطوة 1: تجديد الترطيب العميق',
        benefitEn: 'Plumps skin with dual-weight hyaluronic acid molecules.',
        benefitAr: 'يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن.'
      },
      {
        product: PRODUCTS[1],
        stepEn: 'Step 2: Seal & Protect Barrier',
        stepAr: 'الخطوة 2: قفل الترطيب وحماية الحاجز',
        benefitEn: 'Binds moisture and fills lipid voids with ceramides.',
        benefitAr: 'يربط جزيئات الماء داخل الخلايا ويسد الثغرات الدهنية بالسيراميد.'
      }
    ]
  },
  {
    id: 'bundle_complete_renewal',
    slug: 'ultimate-restoration-routine',
    nameEn: 'The Ultimate Restoration Routine',
    nameAr: 'روتين الترميم الفائق المتكامل',
    subtitleEn: 'The full 4-step professional clinical routine for ultimate skin health',
    subtitleAr: 'الروتين السريري المهني المتكامل من 4 خطوات لصحّة البشرة الفائقة',
    descriptionEn: 'Transform your daily ritual with our flagship routine. Designed as a synergistic four-step process to cleanse, treat, hydrate, and shield your skin against aging elements and environmental pollutants.',
    descriptionAr: 'حوّلي روتينكِ اليومي مع مجموعتنا الرائدة. مصممة كعملية متكاملة تآزرية من أربع خطوات لتنظيف، علاج، ترطيب، وحماية بشرتكِ من علامات الشيخوخة والملوثات البيئية.',
    image: '/assets/images/product_cream_jar_1781217540516.jpg',
    discountPercentage: 20,
    originalPrice: 1145,
    bundlePrice: 915,
    benefitsEn: [
      'Comprehensive skincare from morning cleanse to night restoration',
      'Fades fine lines, redness, and sun damage within 14 days',
      'Reinforces natural microflora and blocks UV damage'
    ],
    benefitsAr: [
      'عناية شاملة بالبشرة تبدأ من غسول الصباح وحتى ترميم الليل',
      'يخفي الخطوط الدقيقة والاحمرار وبقع الشمس في 14 يوماً',
      'يقوي البكتيريا الحيوية النافعة ويحجب أضرار الأشعة فوق البنفسجية'
    ],
    items: [
      {
        product: PRODUCTS[2],
        stepEn: 'Step 1: Cleanse',
        stepAr: 'الخطوة 1: التنظيف اللطيف',
        benefitEn: 'Purifies skin of pollutants without stripping natural moisture.',
        benefitAr: 'ينظف البشرة بلطف من الملوثات والأتربة مع الحفاظ على ترطيبها.'
      },
      {
        product: PRODUCTS[0],
        stepEn: 'Step 2: Hydro-Infusion',
        stepAr: 'الخطوة 2: غمر الترطيب السيرومي',
        benefitEn: 'Provides rich oceanic seaweed nutrients and deep moisture.',
        benefitAr: 'يمنح البشرة عناصر الطحالب البحرية المغذية وترطيباً فائقاً.'
      },
      {
        product: PRODUCTS[1],
        stepEn: 'Step 3: Nourish & Rebuild',
        stepAr: 'الخطوة 3: التغذية وإعادة البناء',
        benefitEn: 'Delivers ceramides and squalane to repair skin lipids.',
        benefitAr: 'يغذي طبقات الجلد بالسيراميد والسكوالين لإعادة بناء الدهون.'
      },
      {
        product: PRODUCTS[3],
        stepEn: 'Step 4: Shield SPF 50+',
        stepAr: 'الخطوة 4: درع الحماية SPF 50+',
        benefitEn: 'Invisible mineral shield blocking UVA/UVB photo-aging.',
        benefitAr: 'درع معدني غير مرئي يحمي من أضرار الشمس والشيخوخة الضوئية.'
      }
    ]
  },
  {
    id: 'bundle_clear_skin',
    slug: 'clear-skin-clarifying-set',
    nameEn: 'The Clear Skin Clarifying Set',
    nameAr: 'مجموعة تنقية وتصفية البشرة',
    subtitleEn: 'Weekly detoxifying and balancing duo for clear, dynamic skin',
    subtitleAr: 'ثنائي أسبوعي لتنقية السموم وتصفية وتوازن إفراز دهون البشرة',
    descriptionEn: 'Perfect for skin prone to congestion or excessive oiliness. The prebiotic cleanser keeps daily sebum balanced, while the Glacial Marine Clay Mask acts as a weekly vacuum to clean pores and restore clarity.',
    descriptionAr: 'مثالي للبشرة المعرضة لانسداد المسام أو الإفرازات الدهنية الزائدة. يحافظ غسول البريبايوتك على توازن الدهون اليومي، بينما يعمل قناع الطين الكندي كمكنسة لتنقية المسام واستعادة إشراقة وجهكِ.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    discountPercentage: 15,
    originalPrice: 475,
    bundlePrice: 400,
    benefitsEn: [
      'Cleanses blackheads and reduces visible pore size',
      'Controls excessive midday oil production',
      'Provides weekly spa-grade colloidal mud purification'
    ],
    benefitsAr: [
      'ينظف الرؤوس السوداء ويقلل من القطر المرئي للمسامات الواسعة',
      'يتحكم في إفرازات الزيوت والدهون المزعجة في منتصف النهار',
      'يوفر تنقية أسبوعية احترافية بـقوة الطين الغرواني البحري'
    ],
    items: [
      {
        product: PRODUCTS[2],
        stepEn: 'Daily Cleanse: Botanical Gel',
        stepAr: 'تنظيف يومي: جل نباتي متوازن',
        benefitEn: 'Maintains prebiotic defense skin flora and extracts debris.',
        benefitAr: 'يحافظ على البكتيريا الدفاعية المفيدة ويزيل الأتربة اليومية.'
      },
      {
        product: PRODUCTS[4],
        stepEn: 'Weekly Detox: Marine Clay',
        stepAr: 'تقشير أسبوعي: قناع الطين البحري',
        benefitEn: 'Vacuums dead cells and tightens skin surfaces.',
        benefitAr: 'يسحب الخلايا الميتة والسموم ويشد المسامات المرتخية.'
      }
    ]
  }
];

