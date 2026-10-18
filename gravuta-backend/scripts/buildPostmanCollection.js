require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { execSync } = require('child_process');

const Category = require('../models/Category');
const Product = require('../models/Product');
const Bundle = require('../models/Bundle');
const User = require('../models/User');

(async () => {
    try {
        console.log('⏳ Connecting to MongoDB at', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB!');

        // Fetch real documents from DB
        const cat = await Category.findOne();
        const prods = await Product.find().limit(2);
        const bundle = await Bundle.findOne({ slug: 'dewy-hydration-duo' }) || await Bundle.findOne();
        const user = await User.findOne({ role: 'user' });

        const categoryId = cat ? cat._id.toString() : '6ad53e71ce5be60fa6318c9c';
        const productId1 = prods[0] ? prods[0]._id.toString() : '6ad53e72ce5be60fa6318ca1';
        const productId2 = prods[1] ? prods[1]._id.toString() : '6ad53e72ce5be60fa6318ca2';
        const bundleId = bundle ? bundle._id.toString() : '6ad53e7229f647c88e8a422f';
        const bundleSlug = bundle ? bundle.slug : 'dewy-hydration-duo';
        const userId = user ? user._id.toString() : '6ad53e7129f647c88e8a422e';

        console.log('📊 Real Database IDs:', {
            categoryId,
            productId1,
            productId2,
            bundleId,
            bundleSlug,
            userId
        });

        // Load the original validated Postman collection from Git HEAD
        const origRaw = execSync('git show HEAD:gravuta-backend/postman/learn_nodejs.postman_collection.json').toString();
        const collection = JSON.parse(origRaw);

        // Replace placeholders in existing collection with real IDs and variable names
        let collectionStr = JSON.stringify(collection);
        collectionStr = collectionStr.replace(/REPLACE_WITH_CATEGORY_ID/g, categoryId);
        collectionStr = collectionStr.replace(/REPLACE_WITH_PRODUCT_ID/g, productId1);
        collectionStr = collectionStr.replace(/"CATEGORY_ID"/g, `"${categoryId}"`);
        collectionStr = collectionStr.replace(/"PRODUCT_ID"/g, `"${productId1}"`);
        collectionStr = collectionStr.replace(/"USER_ID"/g, `"${userId}"`);

        const updated = JSON.parse(collectionStr);

        // Helper: bearer auth object matching the original collection exactly
        const bearerAuth = {
            type: "bearer",
            bearer: [
                {
                    key: "token",
                    value: "{{token}}",
                    type: "string"
                }
            ]
        };

        // 1. Add "Bundles" folder to "User APIs"
        const userApis = updated.item.find(i => i.name === 'User APIs');
        if (userApis) {
            // Find insertion point right after Products
            const bundlesFolder = {
                name: "Bundles",
                item: [
                    {
                        name: "Get All Active Bundles",
                        request: {
                            method: "GET",
                            header: [],
                            url: {
                                raw: "{{base_url}}/api/bundles?page=1&limit=10",
                                host: ["{{base_url}}"],
                                path: ["api", "bundles"],
                                query: [
                                    { key: "page", value: "1" },
                                    { key: "limit", value: "10" }
                                ]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Get Bundle By Slug",
                        request: {
                            method: "GET",
                            header: [],
                            url: {
                                raw: `{{base_url}}/api/bundles/${bundleSlug}`,
                                host: ["{{base_url}}"],
                                path: ["api", "bundles", bundleSlug]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Get Bundle By ID",
                        request: {
                            method: "GET",
                            header: [],
                            url: {
                                raw: `{{base_url}}/api/bundles/${bundleId}`,
                                host: ["{{base_url}}"],
                                path: ["api", "bundles", bundleId]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Get Bundles By Product ID (Upsell)",
                        request: {
                            method: "GET",
                            header: [],
                            url: {
                                raw: `{{base_url}}/api/bundles/by-product/${productId1}`,
                                host: ["{{base_url}}"],
                                path: ["api", "bundles", "by-product", productId1]
                            }
                        },
                        response: []
                    }
                ]
            };

            // Remove existing Bundles folder if any, then insert right after Products
            userApis.item = userApis.item.filter(f => f.name !== 'Bundles');
            const prodIdx = userApis.item.findIndex(f => f.name === 'Products');
            userApis.item.splice(prodIdx + 1, 0, bundlesFolder);

            // 2. Add Bundle operations to Cart folder
            const cartFolder = userApis.item.find(f => f.name === 'Cart');
            if (cartFolder) {
                // Remove any previous bundle endpoints
                cartFolder.item = cartFolder.item.filter(req => !req.name.toLowerCase().includes('bundle'));

                cartFolder.item.push(
                    {
                        name: "Add Bundle to Cart",
                        request: {
                            auth: bearerAuth,
                            method: "POST",
                            header: [],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify({
                                    bundleId: bundleId,
                                    quantity: 1
                                }, null, 4),
                                options: {
                                    raw: {
                                        language: "json"
                                    }
                                }
                            },
                            url: {
                                raw: "{{base_url}}/api/cart/bundles",
                                host: ["{{base_url}}"],
                                path: ["api", "cart", "bundles"]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Update Bundle Quantity in Cart",
                        request: {
                            auth: bearerAuth,
                            method: "PUT",
                            header: [],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify({
                                    bundleId: bundleId,
                                    quantity: 2
                                }, null, 4),
                                options: {
                                    raw: {
                                        language: "json"
                                    }
                                }
                            },
                            url: {
                                raw: "{{base_url}}/api/cart/bundles",
                                host: ["{{base_url}}"],
                                path: ["api", "cart", "bundles"]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Remove Bundle from Cart",
                        request: {
                            auth: bearerAuth,
                            method: "DELETE",
                            header: [],
                            url: {
                                raw: `{{base_url}}/api/cart/bundles/${bundleId}`,
                                host: ["{{base_url}}"],
                                path: ["api", "cart", "bundles", bundleId]
                            }
                        },
                        response: []
                    }
                );
            }
        }

        // 3. Add "Bundle Management" to "Admin APIs"
        const adminApis = updated.item.find(i => i.name === 'Admin APIs');
        if (adminApis) {
            adminApis.item = adminApis.item.filter(f => f.name !== 'Bundle Management');

            const bundleAdminFolder = {
                name: "Bundle Management",
                item: [
                    {
                        name: "Get All Bundles (Admin)",
                        request: {
                            auth: bearerAuth,
                            method: "GET",
                            header: [],
                            url: {
                                raw: "{{base_url}}/api/admin/bundles?page=1&limit=10",
                                host: ["{{base_url}}"],
                                path: ["api", "admin", "bundles"],
                                query: [
                                    { key: "page", value: "1" },
                                    { key: "limit", value: "10" }
                                ]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Create Bundle",
                        request: {
                            auth: bearerAuth,
                            method: "POST",
                            header: [],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify({
                                    slug: "custom-glow-set",
                                    nameEn: "Custom Glow Set",
                                    nameAr: "مجموعة التوهج المخصصة",
                                    subtitleEn: "Hydrating serum and restorative cream pair",
                                    subtitleAr: "ثنائي السيروم المرطب وكريم الترميم",
                                    descriptionEn: "A high-performance two-step daily clinical ritual.",
                                    descriptionAr: "روتين سريري يومي من خطوتين عالي الفعالية.",
                                    discountPercentage: 15,
                                    bundlePrice: 595,
                                    benefitsEn: ["Deep hydration", "Repairs lipid barrier"],
                                    benefitsAr: ["ترطيب عميق", "ترميم حاجز البشرة"],
                                    items: [
                                        {
                                            product: productId1,
                                            stepEn: "Step 1: Hydrate",
                                            stepAr: "الخطوة 1: الترطيب الفائق",
                                            benefitEn: "Deep moisture reservoir",
                                            benefitAr: "تغذية عميقة بمخازن الرطوبة",
                                            quantity: 1,
                                            order: 1
                                        },
                                        {
                                            product: productId2,
                                            stepEn: "Step 2: Seal",
                                            stepAr: "الخطوة 2: قفل الترطيب",
                                            benefitEn: "Locks hydration with ceramides",
                                            benefitAr: "يحبس الترطيب بالسيراميد",
                                            quantity: 1,
                                            order: 2
                                        }
                                    ]
                                }, null, 4),
                                options: {
                                    raw: {
                                        language: "json"
                                    }
                                }
                            },
                            url: {
                                raw: "{{base_url}}/api/admin/bundles",
                                host: ["{{base_url}}"],
                                path: ["api", "admin", "bundles"]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Update Bundle",
                        request: {
                            auth: bearerAuth,
                            method: "PUT",
                            header: [],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify({
                                    discountPercentage: 20
                                }, null, 4),
                                options: {
                                    raw: {
                                        language: "json"
                                    }
                                }
                            },
                            url: {
                                raw: `{{base_url}}/api/admin/bundles/${bundleId}`,
                                host: ["{{base_url}}"],
                                path: ["api", "admin", "bundles", bundleId]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Recalculate Bundle Prices",
                        request: {
                            auth: bearerAuth,
                            method: "PATCH",
                            header: [],
                            url: {
                                raw: `{{base_url}}/api/admin/bundles/${bundleId}/recalculate`,
                                host: ["{{base_url}}"],
                                path: ["api", "admin", "bundles", bundleId, "recalculate"]
                            }
                        },
                        response: []
                    },
                    {
                        name: "Delete Bundle",
                        request: {
                            auth: bearerAuth,
                            method: "DELETE",
                            header: [],
                            url: {
                                raw: `{{base_url}}/api/admin/bundles/${bundleId}`,
                                host: ["{{base_url}}"],
                                path: ["api", "admin", "bundles", bundleId]
                            }
                        },
                        response: []
                    }
                ]
            };

            const prodAdminIdx = adminApis.item.findIndex(f => f.name === 'Product Management');
            adminApis.item.splice(prodAdminIdx + 1, 0, bundleAdminFolder);
        }

        // 4. Update collection variables
        updated.variable = [
            { key: "base_url", value: "http://localhost:3000", type: "string" },
            { key: "token", value: "", type: "string" },
            { key: "category_id", value: categoryId, type: "string" },
            { key: "product_id", value: productId1, type: "string" },
            { key: "bundle_id", value: bundleId, type: "string" },
            { key: "bundle_slug", value: bundleSlug, type: "string" },
            { key: "user_id", value: userId, type: "string" }
        ];

        // Format as standard JSON string
        const finalJson = JSON.stringify(updated, null, "\t");

        // Save to postman/learn_nodejs.postman_collection.json
        const file1 = path.join(__dirname, '../postman/learn_nodejs.postman_collection.json');
        fs.writeFileSync(file1, finalJson, 'utf8');

        // Also save to postman/pharmaa_gravuta.postman_collection.json
        const file2 = path.join(__dirname, '../postman/pharmaa_gravuta.postman_collection.json');
        fs.writeFileSync(file2, finalJson, 'utf8');

        console.log('✅ Successfully wrote validated Postman collection to:');
        console.log('   - ' + file1);
        console.log('   - ' + file2);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error building postman collection:', err);
        process.exit(1);
    }
})();
