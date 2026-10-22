const initialProducts = [
  {
    _id: "prod_water_101",
    title: "Water 200 ML. ( Clonex )",
    category: "Agro & Beverages",
    description: "Pure purified drinking water bottles in bulk packaging. Standardized 200ml bottles for commercial events, catering, and wholesale.",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&q=80&w=800",
    moq: "35 bottle",
    moqNumber: 35,
    orderMultipleNumber: 35,
    priceRange: "₹2 / bottle",
    basePrice: 2,
    unit: "bottle",
    onlinePrice: 2,
    creditPrice: 2,
    viewsCount: 6426,
    packing: "35 bottle",
    gstRate: "5%",
    gstRateNumber: 5,
    minOrder: "35 bottle",
    orderMultiple: "35 bottle",
    qualified: true,
    inStock: true,
    stockQuantity: 50000,
    tiers: [
      { qtyRange: "35 - 350 bottles", price: 2 },
      { qtyRange: "351 - 1000 bottles", price: 2 },
      { qtyRange: "> 1000 bottles", price: 1.8 }
    ],
    supplier: {
      name: "Clonex",
      location: "Surat, Gujarat",
      verified: true,
      rating: 4.95
    },
    challengeRateAvailable: true
  },
  {
    _id: "prod_1",
    title: "Premium Grade Raw Areca Nut / Whole Supari",
    category: "Supari & Agro",
    description: "Direct wholesale sourcing of dried whole areca nut from Karnataka & Assam farms. Moisture controlled < 8%. Bulk export quality.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800",
    moq: "500 Kgs",
    moqNumber: 500,
    orderMultipleNumber: 50,
    priceRange: "₹420 - ₹480 / Kg",
    basePrice: 420,
    unit: "Kg",
    onlinePrice: 420,
    creditPrice: 435,
    viewsCount: 12450,
    packing: "50 Kg HDPE Bags",
    gstRate: "5%",
    gstRateNumber: 5,
    minOrder: "500 Kgs",
    orderMultiple: "50 Kgs",
    qualified: true,
    inStock: true,
    stockQuantity: 15000,
    tiers: [
      { qtyRange: "500 - 1000 Kg", price: 480 },
      { qtyRange: "1001 - 5000 Kg", price: 450 },
      { qtyRange: "> 5000 Kg", price: 420 }
    ],
    supplier: {
      name: "Malnad Agro Producers Pvt Ltd",
      location: "Shivamogga, Karnataka",
      verified: true,
      rating: 4.9
    },
    challengeRateAvailable: true
  },
  {
    _id: "prod_2",
    title: "100% Pure Organic Bio-Fertilizer (NPK Enriched)",
    category: "Agro & Fertilizer",
    description: "Government tested eco-friendly soil enhancer for commercial crop yield boost. Packed in 50kg HDPE bags.",
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800",
    moq: "100 Bags (5 Tonnes)",
    moqNumber: 100,
    orderMultipleNumber: 10,
    priceRange: "₹650 - ₹800 / Bag",
    basePrice: 650,
    unit: "Bag",
    onlinePrice: 650,
    creditPrice: 680,
    viewsCount: 8930,
    packing: "50kg Bag",
    gstRate: "12%",
    gstRateNumber: 12,
    minOrder: "100 Bags",
    orderMultiple: "10 Bags",
    qualified: true,
    inStock: true,
    stockQuantity: 10000,
    tiers: [
      { qtyRange: "100 - 300 Bags", price: 800 },
      { qtyRange: "301 - 1000 Bags", price: 720 },
      { qtyRange: "> 1000 Bags", price: 650 }
    ],
    supplier: {
      name: "GreenEarth Fertilizer Corp",
      location: "Surat, Gujarat",
      verified: true,
      rating: 4.8
    },
    challengeRateAvailable: true
  },
  {
    _id: "prod_3",
    title: "Unstitched Premium Printed Cotton Fabric Rolls",
    category: "Textiles",
    description: "High thread count 100% combed cotton fabric for garment manufacturing. 60-inch width, vibrant fast colors.",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800",
    moq: "1,000 Meters",
    moqNumber: 1000,
    orderMultipleNumber: 100,
    priceRange: "₹95 - ₹130 / Meter",
    basePrice: 95,
    unit: "Meter",
    onlinePrice: 95,
    creditPrice: 99,
    viewsCount: 15820,
    packing: "100 Meter Roll",
    gstRate: "5%",
    gstRateNumber: 5,
    minOrder: "1000 Meters",
    orderMultiple: "100 Meters",
    qualified: true,
    inStock: true,
    stockQuantity: 40000,
    tiers: [
      { qtyRange: "1000 - 3000 Mtr", price: 130 },
      { qtyRange: "3001 - 10000 Mtr", price: 110 },
      { qtyRange: "> 10000 Mtr", price: 95 }
    ],
    supplier: {
      name: "Meridian Textile Mills",
      location: "Surat, Gujarat",
      verified: true,
      rating: 4.9
    },
    challengeRateAvailable: true
  }
];

const seedDatabase = async () => {
  try {
    const Product = require('../models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      const docsToInsert = initialProducts.map(p => {
        const { _id, ...rest } = p;
        return rest;
      });
      await Product.insertMany(docsToInsert);
      console.log('[Seed] Seeded products into MongoDB with detailed business info & Water product!');
    }
  } catch (err) {
    console.log('[Seed Note] Seeding note:', err.message);
  }
};

module.exports = { initialProducts, seedDatabase };
