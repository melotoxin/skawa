import type { Product } from './types'
import { attachModels } from './lib/productModels'

/** Live skawafight.com catalog + retained shorts + PRD §7 category products (quote-led until pricing confirmed). */
const catalog: Product[] = [
  {
    "id": 1,
    "sourceId": 2593,
    "slug": "bjj-gi",
    "name": "BJJ GI",
    "category": "GIs",
    "price": "$10.00",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOMIZE",
    "image": "/images/products/bjj-gi-1.png?v=cut6",
    "secondaryImage": "/images/products/bjj-gi-1.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi"
    ],
    "material": "BJJ gi fabric",
    "availability": "Custom order",
    "colors": [
      "#111111",
      "#e2232a",
      "#f5f5f2"
    ],
    "sizes": [
      "K00",
      "K0",
      "K1",
      "K2",
      "K3",
      "K4",
      "A0",
      "A1",
      "A2",
      "A3",
      "A4",
      "A5",
      "A6"
    ],
    "description": "Create the Gi of your dreams for a one off order, or design for your entire academy or School!"
  },
  {
    "id": 2,
    "sourceId": 2594,
    "slug": "fight-short",
    "name": "Fight Short",
    "category": "Fight Shorts",
    "price": "$15.00",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOMIZE",
    "image": "/images/products/fight-short-1.png?v=cut6",
    "secondaryImage": "/images/products/fight-short-1.png?v=cut6",
    "sports": [
      "MMA",
      "BJJ",
      "No-Gi"
    ],
    "material": "Performance fight short shell",
    "availability": "Custom order",
    "colors": [
      "#111111",
      "#c9a048",
      "#e2232a"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXlarge",
      "XXXLarge",
      "XXXXLarge"
    ],
    "description": "Custom MMA/ No-Gi BJJ Shorts &nbsp;"
  },
  {
    "id": 3,
    "sourceId": 2592,
    "slug": "full-sleeves",
    "name": "Full Sleeves",
    "category": "Rash Guards",
    "price": "$10.00 – $20.00",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOMIZE",
    "image": "/images/products/full-sleeves-1.png?v=cut6",
    "secondaryImage": "/images/products/full-sleeves-1.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "No-Gi"
    ],
    "material": "Performance rash guard knit",
    "availability": "Custom order",
    "colors": [
      "#111111",
      "#e2232a",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "Create the Full Sleeves Rash Guard of your dreams for a one off order, or design for your entire academy or School!!"
  },
  {
    "id": 4,
    "sourceId": 2704,
    "slug": "ranked-rashguard-black-belt",
    "name": "Ranked Rashguard – Black Belt",
    "category": "Rash Guards",
    "price": "$50.00",
    "color": "#0a0a0a",
    "accent": "#111111",
    "custom": false,
    "wholesale": false,
    "tag": "READY TO ORDER",
    "image": "/images/products/ranked-rashguard-black-belt-1.png?v=cut6",
    "secondaryImage": "/images/products/ranked-rashguard-black-belt-2.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi",
      "No-Gi",
      "MMA"
    ],
    "material": "Moisture-wicking performance knit",
    "availability": "In stock",
    "colors": [
      "#0a0a0a",
      "#222222",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "✅ DISCOVER THE ULTIMATE BJJ RANKED RASHGUARD FOR ATHLETES: Designed by jiu-jitsu Black Belt, this breathable men's rash guard is ideal for BJJ Gi and No Gi Jiu-Jitsu, and MMA. ✅ KEEP YOUR BODY COOL DURING INTENSE TRAINING SESSIONS: The advanced, moisture-wicking technology will keep moisture away from your skin while ensuring that your body remains cool and comfortable – even after hours of rollin"
  },
  {
    "id": 5,
    "sourceId": 2685,
    "slug": "ranked-rashy-blue-belt",
    "name": "Ranked Rashguard – Blue Belt",
    "category": "Rash Guards",
    "price": "$30.00",
    "color": "#1c4f9c",
    "accent": "#0a2f6b",
    "custom": false,
    "wholesale": false,
    "tag": "READY TO ORDER",
    "image": "/images/products/ranked-rashy-blue-belt-1.png?v=cut6",
    "secondaryImage": "/images/products/ranked-rashy-blue-belt-2.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi",
      "No-Gi",
      "MMA"
    ],
    "material": "Moisture-wicking performance knit",
    "availability": "In stock",
    "colors": [
      "#1c4f9c",
      "#0a2f6b",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "✅ DISCOVER THE ULTIMATE BJJ RANKED RASHGUARD FOR ATHLETES: Designed by jiu-jitsu Black Belt, this breathable men's rash guard is ideal for BJJ Gi and No Gi Jiu-Jitsu, and MMA. ✅ KEEP YOUR BODY COOL DURING INTENSE TRAINING SESSIONS: The advanced, moisture-wicking technology will keep moisture away from your skin while ensuring that your body remains cool and comfortable – even after hours of rollin"
  },
  {
    "id": 6,
    "sourceId": 2703,
    "slug": "ranked-rashguard-brown-belt",
    "name": "Ranked Rashguard – Brown Belt",
    "category": "Rash Guards",
    "price": "$5.00 – $50.00",
    "color": "#6b3b1f",
    "accent": "#3d2110",
    "custom": false,
    "wholesale": false,
    "tag": "READY TO ORDER",
    "image": "/images/products/ranked-rashguard-brown-belt-1.png?v=cut6",
    "secondaryImage": "/images/products/ranked-rashguard-brown-belt-2.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi",
      "No-Gi",
      "MMA"
    ],
    "material": "Moisture-wicking performance knit",
    "availability": "In stock",
    "colors": [
      "#6b3b1f",
      "#3d2110",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "✅ DISCOVER THE ULTIMATE BJJ RANKED RASHGUARD FOR ATHLETES: Designed by jiu-jitsu Black Belt, this breathable men's rash guard is ideal for BJJ Gi and No Gi Jiu-Jitsu, and MMA. ✅ KEEP YOUR BODY COOL DURING INTENSE TRAINING SESSIONS: The advanced, moisture-wicking technology will keep moisture away from your skin while ensuring that your body remains cool and comfortable – even after hours of rollin"
  },
  {
    "id": 7,
    "sourceId": 2702,
    "slug": "ranked-rashguard-purple-belt",
    "name": "Ranked Rashguard – Purple Belt",
    "category": "Rash Guards",
    "price": "$50.00",
    "color": "#5b2d8e",
    "accent": "#2f114f",
    "custom": false,
    "wholesale": false,
    "tag": "READY TO ORDER",
    "image": "/images/products/ranked-rashguard-purple-belt-1.png?v=cut6",
    "secondaryImage": "/images/products/ranked-rashguard-purple-belt-2.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi",
      "No-Gi",
      "MMA"
    ],
    "material": "Moisture-wicking performance knit",
    "availability": "In stock",
    "colors": [
      "#5b2d8e",
      "#2f114f",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "✅ DISCOVER THE ULTIMATE BJJ RANKED RASHGUARD FOR ATHLETES: Designed by jiu-jitsu Black Belt, this breathable men's rash guard is ideal for BJJ Gi and No Gi Jiu-Jitsu, and MMA. ✅ KEEP YOUR BODY COOL DURING INTENSE TRAINING SESSIONS: The advanced, moisture-wicking technology will keep moisture away from your skin while ensuring that your body remains cool and comfortable – even after hours of rollin"
  },
  {
    "id": 8,
    "sourceId": 2690,
    "slug": "ranked-rashguard-white-belt",
    "name": "Ranked Rashguard – White Belt",
    "category": "Rash Guards",
    "price": "$30.00",
    "color": "#f2f2f0",
    "accent": "#111111",
    "custom": false,
    "wholesale": false,
    "tag": "READY TO ORDER",
    "image": "/images/products/ranked-rashguard-white-belt-1.png?v=cut6",
    "secondaryImage": "/images/products/ranked-rashguard-white-belt-2.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi",
      "No-Gi",
      "MMA"
    ],
    "material": "Moisture-wicking performance knit",
    "availability": "In stock",
    "colors": [
      "#f2f2f0",
      "#111111",
      "#c9a048"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "✅ DISCOVER THE ULTIMATE BJJ RANKED RASHGUARD FOR ATHLETES: Designed by jiu-jitsu Black Belt, this breathable men's rash guard is ideal for BJJ Gi and No Gi Jiu-Jitsu, and MMA. ✅ KEEP YOUR BODY COOL DURING INTENSE TRAINING SESSIONS: The advanced, moisture-wicking technology will keep moisture away from your skin while ensuring that your body remains cool and comfortable – even after hours of rollin"
  },
  {
    "id": 9,
    "sourceId": 2666,
    "slug": "samurai-rashguard",
    "name": "Samurai Rashguard – Men",
    "category": "Rash Guards",
    "price": "$10.00",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": false,
    "wholesale": false,
    "tag": "READY TO ORDER",
    "image": "/images/products/samurai-rashguard-1.png?v=cut6",
    "secondaryImage": "/images/products/samurai-rashguard-2.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi",
      "No-Gi",
      "MMA"
    ],
    "material": "Moisture-wicking performance knit",
    "availability": "In stock",
    "colors": [
      "#111111",
      "#c9a048",
      "#e2232a"
    ],
    "sizes": [
      "XS",
      "XX Large"
    ],
    "description": "Show off your Samurai Spirit with Skawa Fight's High Quality Men-Yoroi"
  },
  {
    "id": 10,
    "sourceId": 2590,
    "slug": "short-sleeves",
    "name": "Short Sleeves",
    "category": "Rash Guards",
    "price": "$10.00",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOMIZE",
    "image": "/images/products/short-sleeves-1.png?v=cut6",
    "secondaryImage": "/images/products/short-sleeves-1.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "No-Gi"
    ],
    "material": "Performance rash guard knit",
    "availability": "Custom order",
    "colors": [
      "#111111",
      "#e2232a",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge",
      "XXXXLarge",
      "WXS",
      "WSmall",
      "WMedium",
      "WLarge",
      "WXL",
      "WXXL",
      "WXXXL"
    ],
    "description": "Create the Short Sleeves Rash Guard of your dreams for a one off order, or design for your entire academy or School!"
  },
  {
    "id": 11,
    "sourceId": 0,
    "slug": "elite-fight-shorts",
    "name": "Elite Fight Shorts",
    "category": "Fight Shorts",
    "price": "$49.00",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/shorts-gold-cut.png?v=cut6",
    "secondaryImage": "/images/products/shorts-white-cut.png?v=cut6",
    "sports": ["MMA", "Muay Thai"],
    "material": "Micro-stretch",
    "availability": "Custom order",
    "colors": ["#111111", "#c9a048", "#eeeae2"],
    "sizes": ["YXS", "YS", "YM", "YL", "YXL", "XS", "Small", "Medium", "Large", "XLarge", "XXlarge", "XXXLarge", "XXXXLarge"],
    "description": "Championship-ready custom fight shorts with gold accent detailing for MMA and Muay Thai."
  },
  {
    "id": 12,
    "sourceId": 0,
    "slug": "shadow-series",
    "name": "Shadow Series",
    "category": "Fight Shorts",
    "price": "$49.00",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/shorts-red-cut.png?v=cut6",
    "secondaryImage": "/images/products/shorts-camo-cut.png?v=cut6",
    "sports": ["MMA", "Boxing"],
    "material": "Micro-stretch",
    "availability": "Custom order",
    "colors": ["#111111", "#e2232a", "#f5f5f2"],
    "sizes": ["YXS", "YS", "YM", "YL", "YXL", "XS", "Small", "Medium", "Large", "XLarge", "XXlarge", "XXXLarge", "XXXXLarge"],
    "description": "Black and fight-red custom shorts built for hard rounds and unrestricted movement."
  },
  {
    "id": 13,
    "sourceId": 0,
    "slug": "reign-fight-shorts",
    "name": "Reign Fight Shorts",
    "category": "Fight Shorts",
    "price": "$49.00",
    "color": "#eeeae2",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "LIGHTWEIGHT",
    "image": "/images/products/shorts-white-cut.png?v=cut6",
    "secondaryImage": "/images/products/shorts-gold-cut.png?v=cut6",
    "sports": ["Muay Thai", "Kickboxing"],
    "material": "Fight satin",
    "availability": "Custom order",
    "colors": ["#eeeae2", "#c9a048", "#111111"],
    "sizes": ["YXS", "YS", "YM", "YL", "YXL", "XS", "Small", "Medium", "Large", "XLarge", "XXlarge", "XXXLarge", "XXXXLarge"],
    "description": "Lightweight corner-white fight shorts with championship gold accents."
  },
  {
    "id": 14,
    "sourceId": 0,
    "slug": "stealth-pro",
    "name": "Stealth Pro",
    "category": "Fight Shorts",
    "price": "$49.00",
    "color": "#252525",
    "accent": "#e5e5e2",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/shorts-camo-cut.png?v=cut6",
    "secondaryImage": "/images/products/shorts-red-cut.png?v=cut6",
    "sports": ["MMA", "Grappling"],
    "material": "Micro-stretch",
    "availability": "Custom order",
    "colors": ["#252525", "#e5e5e2", "#26384a"],
    "sizes": ["YXS", "YS", "YM", "YL", "YXL", "XS", "Small", "Medium", "Large", "XLarge", "XXlarge", "XXXLarge", "XXXXLarge"],
    "description": "Stealth camo pro-grade shorts for MMA and grappling programs."
  },
  {
    "id": 15,
    "sourceId": 0,
    "slug": "academy-gold-shorts",
    "name": "Academy Gold Shorts",
    "category": "Teamwear",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "TEAM PROGRAM",
    "image": "/images/products/shorts-gold-cut.png?v=cut6",
    "secondaryImage": "/images/academy-team.webp",
    "sports": ["Academy", "MMA"],
    "material": "Program selection",
    "availability": "Quote review",
    "colors": ["#111111", "#c9a048", "#e2232a"],
    "sizes": ["YXS", "YS", "YM", "YL", "YXL", "XS", "Small", "Medium", "Large", "XLarge", "XXlarge", "XXXLarge", "XXXXLarge"],
    "description": "Academy team shorts for coordinated wholesale collections and recurring reorders."
  },
  {
    "id": 16,
    "sourceId": 0,
    "slug": "crimson-training-shorts",
    "name": "Crimson Training Shorts",
    "category": "Training",
    "price": "$45.00",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": false,
    "tag": "CUSTOM READY",
    "image": "/images/products/shorts-red-cut.png?v=cut6",
    "secondaryImage": "/images/products/shorts-white-cut.png?v=cut6",
    "sports": ["Training", "Boxing"],
    "material": "Technical weave",
    "availability": "Custom order",
    "colors": ["#111111", "#e2232a", "#f5f5f2"],
    "sizes": ["YXS", "YS", "YM", "YL", "YXL", "XS", "Small", "Medium", "Large", "XLarge", "XXlarge", "XXXLarge", "XXXXLarge"],
    "description": "Custom-ready training shorts for daily practice and boxing sessions."
  },

  {
    "id": 17,
    "sourceId": 0,
    "slug": "kids-bjj-gi",
    "name": "Kids BJJ Gi",
    "category": "GIs",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/kids-bjj-gi.png?v=cut6",
    "secondaryImage": "/images/products/kids-bjj-gi.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi"
    ],
    "material": "Pearl weave / ripstop options",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#f5f5f2",
      "#1c4f9c"
    ],
    "sizes": [
      "K00",
      "K0",
      "K1",
      "K2",
      "K3",
      "K4"
    ],
    "description": "Youth Brazilian Jiu-Jitsu gi for academies and private-label kids programs. Custom embroidery, patches and academy branding available.",
    "gsm": "Confirmed with Skawa",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Embroidery",
      "Patches",
      "Labels"
    ],
    "customizableAreas": [
      "Back",
      "Shoulder",
      "Pants",
      "Labels"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 18,
    "sourceId": 0,
    "slug": "grappling-shorts",
    "name": "Grappling Shorts",
    "category": "Fight Shorts",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/grappling-shorts.png?v=cut6",
    "secondaryImage": "/images/products/grappling-shorts.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "No-Gi",
      "Grappling"
    ],
    "material": "Four-way stretch performance shell",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#c9a048",
      "#e2232a",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge"
    ],
    "description": "No-gi grappling shorts for BJJ and MMA training. Built for custom sublimation, academy marks and wholesale team runs.",
    "gsm": "Confirmed with Skawa",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Sublimation",
      "Screen print"
    ],
    "customizableAreas": [
      "Front panels",
      "Back panels",
      "Side panels",
      "Waistband"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 19,
    "sourceId": 0,
    "slug": "jiu-jitsu-belts",
    "name": "Jiu Jitsu Belts",
    "category": "Belts",
    "price": "Quote only",
    "color": "#f5f5f2",
    "accent": "#111111",
    "custom": true,
    "wholesale": true,
    "tag": "WHOLESALE",
    "image": "/images/products/jiu-jitsu-belts.png?v=cut6",
    "secondaryImage": "/images/products/jiu-jitsu-belts.png?v=cut6",
    "sports": [
      "BJJ",
      "Gi"
    ],
    "material": "Cotton belt weave",
    "availability": "Quote review",
    "colors": [
      "#f5f5f2",
      "#1c4f9c",
      "#5b2d8e",
      "#6b3b1f",
      "#0a0a0a"
    ],
    "sizes": [
      "A0",
      "A1",
      "A2",
      "A3",
      "A4",
      "A5"
    ],
    "description": "Rank belts for academy programs with optional center-bar embroidery and private-label packaging.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Embroidery",
      "Labels"
    ],
    "customizableAreas": [
      "Center bar",
      "End bar",
      "Label"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 20,
    "sourceId": 0,
    "slug": "mouth-guard",
    "name": "Mouth Guard",
    "category": "Protective Gear",
    "price": "Quote only",
    "color": "#3c8bdd",
    "accent": "#111111",
    "custom": false,
    "wholesale": true,
    "tag": "PROTECTIVE",
    "image": "/images/products/mouth-guard.png?v=cut6",
    "secondaryImage": "/images/products/mouth-guard.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "Boxing",
      "Muay Thai"
    ],
    "material": "Boil-and-bite / custom-fit options",
    "availability": "Quote review",
    "colors": [
      "#3c8bdd",
      "#e2232a",
      "#111111",
      "#f5f5f2"
    ],
    "sizes": [
      "One size"
    ],
    "description": "Protective mouth guards for combat sports. Available for retail kits and academy bulk programs.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Branded packaging"
    ],
    "customizableAreas": [
      "Case",
      "Packaging"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 21,
    "sourceId": 0,
    "slug": "spats-compression-pants",
    "name": "Spats / Compression Pants",
    "category": "Spats",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/spats-compression-pants.png?v=cut6",
    "secondaryImage": "/images/products/spats-compression-pants.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "No-Gi",
      "Grappling"
    ],
    "material": "Compression knit",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#e2232a",
      "#1c4f9c",
      "#f5f5f2"
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL",
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge"
    ],
    "description": "Full-length spats and compression pants for no-gi training. Sublimation-ready for academy and private-label artwork.",
    "gsm": "Confirmed with Skawa",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Sublimation"
    ],
    "customizableAreas": [
      "Front",
      "Back",
      "Legs"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 22,
    "sourceId": 0,
    "slug": "sports-bags",
    "name": "Sports Bags",
    "category": "Bags",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/sports-bags.png?v=cut6",
    "secondaryImage": "/images/products/sports-bags.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "Boxing",
      "Academy"
    ],
    "material": "Durable nylon / polyester",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#e2232a",
      "#c9a048"
    ],
    "sizes": [
      "Standard",
      "Large"
    ],
    "description": "Training sports bags for athletes and academies. Custom logos, colors and private-label packaging supported.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Screen print",
      "Embroidery",
      "Labels"
    ],
    "customizableAreas": [
      "Front panel",
      "End panels",
      "Labels"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 23,
    "sourceId": 0,
    "slug": "boxing-gloves",
    "name": "Boxing Gloves",
    "category": "Gloves",
    "price": "Quote only",
    "color": "#e2232a",
    "accent": "#111111",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/boxing-gloves.png?v=cut6",
    "secondaryImage": "/images/products/boxing-gloves.png?v=cut6",
    "sports": [
      "Boxing",
      "Muay Thai",
      "Fitness"
    ],
    "material": "Synthetic / leather options",
    "availability": "Quote review",
    "colors": [
      "#e2232a",
      "#111111",
      "#f5f5f2",
      "#c9a048"
    ],
    "sizes": [
      "8oz",
      "10oz",
      "12oz",
      "14oz",
      "16oz"
    ],
    "description": "Custom boxing gloves for retail, gym programs and private-label fightwear brands. Confirm materials and ounce ranges with Skawa before production.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Logo print",
      "Embroidery",
      "Labels"
    ],
    "customizableAreas": [
      "Wrist",
      "Back of hand",
      "Label"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 24,
    "sourceId": 0,
    "slug": "mma-gloves",
    "name": "MMA Gloves",
    "category": "Gloves",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/mma-gloves.png?v=cut6",
    "secondaryImage": "/images/products/mma-gloves.png?v=cut6",
    "sports": [
      "MMA",
      "Grappling"
    ],
    "material": "Open-palm fight glove construction",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#e2232a",
      "#f5f5f2"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "MMA gloves for sparring and competition programs. Custom branding available for academies and private-label lines.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Logo print",
      "Labels"
    ],
    "customizableAreas": [
      "Wrist",
      "Back of hand"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 25,
    "sourceId": 0,
    "slug": "shin-pads",
    "name": "Shin Pads",
    "category": "Protective Gear",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "PROTECTIVE",
    "image": "/images/products/shin-pads.png?v=cut6",
    "secondaryImage": "/images/products/shin-pads.png?v=cut6",
    "sports": [
      "Muay Thai",
      "Kickboxing",
      "MMA"
    ],
    "material": "Padded strike protection",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#e2232a",
      "#f5f5f2"
    ],
    "sizes": [
      "S/M",
      "L/XL"
    ],
    "description": "Shin pads for striking sports. Available for custom academy kits and wholesale protective packages.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Logo print",
      "Labels"
    ],
    "customizableAreas": [
      "Front panel",
      "Strap branding"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 26,
    "sourceId": 0,
    "slug": "focus-mitts",
    "name": "Focus Mitts / Focus Pads",
    "category": "Training Equipment",
    "price": "Quote only",
    "color": "#c9a048",
    "accent": "#111111",
    "custom": true,
    "wholesale": true,
    "tag": "TRAINING",
    "image": "/images/products/focus-mitts.png?v=cut6",
    "secondaryImage": "/images/products/focus-mitts.png?v=cut6",
    "sports": [
      "Boxing",
      "Muay Thai",
      "MMA",
      "Fitness"
    ],
    "material": "Padded coaching mitts",
    "availability": "Quote review",
    "colors": [
      "#c9a048",
      "#e2232a",
      "#111111"
    ],
    "sizes": [
      "One size"
    ],
    "description": "Focus mitts and pads for coaches and academy programs. Custom colors and logos available on qualifying orders.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Logo print",
      "Labels"
    ],
    "customizableAreas": [
      "Face panel",
      "Wrist"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 27,
    "sourceId": 0,
    "slug": "hand-wraps",
    "name": "Hand Wraps",
    "category": "Accessories",
    "price": "Quote only",
    "color": "#f5f5f2",
    "accent": "#111111",
    "custom": true,
    "wholesale": true,
    "tag": "ACCESSORY",
    "image": "/images/products/hand-wraps.png?v=cut6",
    "secondaryImage": "/images/products/hand-wraps.png?v=cut6",
    "sports": [
      "Boxing",
      "MMA",
      "Muay Thai"
    ],
    "material": "Elastic / cotton wrap options",
    "availability": "Quote review",
    "colors": [
      "#f5f5f2",
      "#111111",
      "#e2232a",
      "#c9a048"
    ],
    "sizes": [
      "180 in",
      "210 in"
    ],
    "description": "Hand wraps for striking athletes. Retail and academy bulk packaging available; branding options confirmed per order.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Branded packaging",
      "End labels"
    ],
    "customizableAreas": [
      "Packaging",
      "Closure"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 28,
    "sourceId": 0,
    "slug": "boxing-trunks",
    "name": "Boxing Trunks",
    "category": "Boxing Apparel",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#e2232a",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/boxing-trunks.png?v=cut6",
    "secondaryImage": "/images/products/boxing-trunks.png?v=cut6",
    "sports": [
      "Boxing"
    ],
    "material": "Satin / stretch fight trunk options",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#e2232a",
      "#f5f5f2",
      "#c9a048"
    ],
    "sizes": [
      "XS",
      "Small",
      "Medium",
      "Large",
      "XLarge",
      "XXLarge",
      "XXXLarge"
    ],
    "description": "Custom boxing trunks for athletes, gyms and private-label brands. Sublimation and placement artwork supported.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Sublimation",
      "Screen print"
    ],
    "customizableAreas": [
      "Front",
      "Back",
      "Sides",
      "Waistband"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 29,
    "sourceId": 0,
    "slug": "karate-uniform",
    "name": "Karate Uniform",
    "category": "Uniforms",
    "price": "Quote only",
    "color": "#f5f5f2",
    "accent": "#111111",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/karate-uniform.png?v=cut6",
    "secondaryImage": "/images/products/karate-uniform.png?v=cut6",
    "sports": [
      "Karate"
    ],
    "material": "Karate canvas / student and competition weights",
    "availability": "Quote review",
    "colors": [
      "#f5f5f2",
      "#111111"
    ],
    "sizes": [
      "000",
      "00",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7"
    ],
    "description": "Karate uniforms for schools and academies. Embroidery, patches and private-label packaging available.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Embroidery",
      "Patches",
      "Labels"
    ],
    "customizableAreas": [
      "Chest",
      "Back",
      "Sleeve",
      "Pants"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 30,
    "sourceId": 0,
    "slug": "judo-uniform",
    "name": "Judo Uniform",
    "category": "Uniforms",
    "price": "Quote only",
    "color": "#f5f5f2",
    "accent": "#3c8bdd",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/judo-uniform.png?v=cut6",
    "secondaryImage": "/images/products/judo-uniform.png?v=cut6",
    "sports": [
      "Judo"
    ],
    "material": "Single / double weave judo fabric",
    "availability": "Quote review",
    "colors": [
      "#f5f5f2",
      "#111111",
      "#1c4f9c"
    ],
    "sizes": [
      "K00",
      "K0",
      "K1",
      "K2",
      "K3",
      "K4",
      "A0",
      "A1",
      "A2",
      "A3",
      "A4",
      "A5",
      "A6"
    ],
    "description": "Judo uniforms for clubs and competition programs. Custom badges, embroidery and wholesale sizing runs supported.",
    "gsm": "Confirmed with Skawa",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Embroidery",
      "Patches",
      "Labels"
    ],
    "customizableAreas": [
      "Back",
      "Shoulder",
      "Pants",
      "Labels"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  },
  {
    "id": 31,
    "sourceId": 0,
    "slug": "gear-bags",
    "name": "Gear Bags",
    "category": "Bags",
    "price": "Quote only",
    "color": "#111111",
    "accent": "#c9a048",
    "custom": true,
    "wholesale": true,
    "tag": "CUSTOM READY",
    "image": "/images/products/gear-bags.png?v=cut6",
    "secondaryImage": "/images/products/gear-bags.png?v=cut6",
    "sports": [
      "BJJ",
      "MMA",
      "Boxing",
      "Academy"
    ],
    "material": "Heavy-duty gear-bag construction",
    "availability": "Quote review",
    "colors": [
      "#111111",
      "#e2232a",
      "#26384a"
    ],
    "sizes": [
      "Standard",
      "XL"
    ],
    "description": "Dedicated gear bags for fight kits and academy programs. Larger capacity than standard sports bags, with custom branding options.",
    "moq": "Confirmed with Skawa",
    "productionTime": "Estimated after artwork approval and deposit",
    "sampleAvailability": "Sample kit and product samples available on qualifying orders",
    "customizationMethods": [
      "Screen print",
      "Embroidery",
      "Labels"
    ],
    "customizableAreas": [
      "Front panel",
      "Side panels",
      "Labels"
    ],
    "packagingOptions": [
      "Standard polybag",
      "Custom labels",
      "Branded packaging on qualifying orders"
    ],
    "shippingEstimate": "Confirmed with order destination and quantity",
    "quantityTiers": "10–24 · 25–49 · 50–99 · 100–249 · 250+"
  }

]

export const products = attachModels(catalog)

export const steps = ['Concept', 'Customization', 'Sample', 'Quote', 'Design approval', 'Production', 'Quality control', 'Shipping', 'Reorder']
