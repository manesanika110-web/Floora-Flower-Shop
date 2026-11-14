/**
 * Floora Curated Catalog of Real Flowers & Bouquets
 * High-resolution original photography generated and curated for Floora
 */

export const INDIAN_FLOWERS = [
  'Marigold',
  'Jasmine (Mogra)',
  'Lotus',
  'Hibiscus',
  'Tuberose (Rajnigandha)',
  'Chrysanthemum'
];

export const INTERNATIONAL_FLOWERS = [
  'Roses',
  'Tulips',
  'Lilies',
  'Orchids',
  'Sunflowers',
  'Carnations',
  'Gerberas',
  'Hydrangeas'
];

export const BOUQUET_TYPES = [
  'Rose Bouquets',
  'Mixed Flower Bouquets',
  'Premium Bouquets',
  'Mini Bouquets',
  'Luxury Bouquets'
];

export const SHOP_BY_COLOR = [
  { name: 'Pink Flowers', value: 'Pink', hex: '#E88EAA' },
  { name: 'Red Flowers', value: 'Red', hex: '#D62828' },
  { name: 'White Flowers', value: 'White', hex: '#FFFFFF', border: '#D0C4B8' },
  { name: 'Yellow Flowers', value: 'Yellow', hex: '#F4B942' },
  { name: 'Purple Flowers', value: 'Purple', hex: '#7950F2' },
  { name: 'Peach Flowers', value: 'Peach', hex: '#F4A261' },
  { name: 'Orange Flowers', value: 'Orange', hex: '#E76F51' },
  { name: 'Cream Flowers', value: 'Cream', hex: '#FFF1D0', border: '#D0C4B8' },
  { name: 'Lavender Flowers', value: 'Lavender', hex: '#B5A6C9' }
];

export const OCCASIONS = [
  'Birthday',
  'Wedding',
  'Anniversary',
  "Valentine's Day",
  "Mother's Day",
  'Get Well Soon',
  'Congratulations',
  'Sympathy / Funeral',
  'Housewarming',
  'Corporate / Events'
];

export const CATEGORIES = [
  { 
    id: 'marigold', 
    name: 'Marigold', 
    count: 2,
    image: '/categories/marigold_flower.png'
  },
  { 
    id: 'jasmine', 
    name: 'Jasmine (Mogra)', 
    count: 2,
    image: '/categories/jasmine_mogra_flower.png'
  },
  { 
    id: 'lotus', 
    name: 'Lotus', 
    count: 2,
    image: '/categories/lotus_flower.png'
  },
  { 
    id: 'tuberose', 
    name: 'Tuberose', 
    count: 2,
    image: '/categories/tuberose_flower.png'
  },
  { 
    id: 'chrysanthemum', 
    name: 'Chrysanthemum', 
    count: 2,
    image: '/categories/chrysanthemum_flower.png'
  },
  { 
    id: 'roses', 
    name: 'Roses', 
    count: 6,
    image: '/categories/roses_flower.png'
  },
  { 
    id: 'lilies', 
    name: 'Lilies', 
    count: 4,
    image: '/categories/lilies_flower.png'
  },
  { 
    id: 'sunflowers', 
    name: 'Sunflowers', 
    count: 4,
    image: '/categories/sunflowers_flower.png'
  },
  { 
    id: 'orchids', 
    name: 'Orchids', 
    count: 4,
    image: '/categories/orchids_flower.png'
  },
  { 
    id: 'bouquets', 
    name: 'Bouquets', 
    count: 8,
    image: '/categories/bouquets_flower.png'
  }
];

export const PRODUCTS = [
  // ================= 1. FEATURED & INTERNATIONAL ROSES =================
  {
    id: 'fl-mock-01',
    occasions: ["Anniversary","Valentine's Day"],
    name: 'Red Rose Bouquet',
    category: 'Roses',
    categorySlug: 'roses',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Rose Bouquets',
    colors: ['Red'],
    price: 799,
    oldPrice: 999,
    discountBadge: '-20%',
    rating: 4.8,
    reviewsCount: '1.2k',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/red_rose_bouquet.jpg',
    gallery: [
      '/flowers/red_rose_bouquet.jpg',
      '/flowers/pink_rose_bouquet.jpg',
      '/flowers/white_rose_bouquet.jpg'
    ],
    description: 'A classic romantic bouquet of fresh hand-picked red roses wrapped in signature natural kraft paper, perfect for expressing deep love, romance and heartfelt appreciation.',
    highlights: [
      'Fresh Farm-Grown Roses',
      'Express 2-4 Hours Delivery',
      'Ceramic Vase Included'
    ]
  },
  {
    id: 'fl-mock-08',
    occasions: ["Birthday","Valentine's Day","Mother's Day"],
    name: 'Pink Rose Bouquet',
    category: 'Roses',
    categorySlug: 'roses',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Rose Bouquets',
    colors: ['Pink', 'Peach'],
    price: 799,
    oldPrice: 999,
    discountBadge: '-20%',
    rating: 4.8,
    reviewsCount: '1.2k',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/pink_rose_bouquet.jpg',
    gallery: [
      '/flowers/pink_rose_bouquet.jpg',
      '/flowers/red_rose_bouquet.jpg',
      '/flowers/white_rose_bouquet.jpg'
    ],
    description: 'A beautiful bouquet of fresh pink roses, perfect for expressing love and gratitude. Arranged with delicate babyâ€™s breath in artisanal wrap.',
    highlights: [
      'Fresh Flowers Guaranteed',
      'Delivery in 2-4 hrs',
      'Vase Included'
    ]
  },
  {
    id: 'fl-mock-06',
    occasions: ["Wedding","Sympathy / Funeral"],
    name: 'Royal White Rose Bouquet',
    category: 'Roses',
    categorySlug: 'roses',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Rose Bouquets',
    colors: ['White', 'Cream'],
    price: 799,
    oldPrice: 999,
    discountBadge: '-20%',
    rating: 4.9,
    reviewsCount: '620',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/white_rose_bouquet.jpg',
    gallery: [
      '/flowers/white_rose_bouquet.jpg',
      '/flowers/pink_rose_bouquet.jpg'
    ],
    description: 'Pristine, velvety Avalanche white roses symbolizing pure peace, reverence, and new beginnings. Hand-tied with elegant silk ribbon.',
    highlights: [
      'Pure White Avalanche Roses',
      'Long Stems with Dewdrops',
      'Vase Included'
    ]
  },

  // ================= 2. INTERNATIONAL LILIES & SUNFLOWERS =================
  {
    id: 'fl-mock-02',
    occasions: ["Mother's Day","Congratulations"],
    name: 'Pink Lily Bouquet',
    category: 'Lilies',
    categorySlug: 'lilies',
    origin: 'International',
    flowerType: 'Lilies',
    bouquetType: 'Premium Bouquets',
    colors: ['Pink', 'White'],
    price: 849,
    oldPrice: 999,
    discountBadge: '-15%',
    rating: 4.5,
    reviewsCount: '760',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/pink_lily_bouquet.jpg',
    gallery: [
      '/flowers/pink_lily_bouquet.jpg',
      '/flowers/mix_flower_bouquet.jpg'
    ],
    description: 'Exotic star-shaped fragrant pink oriental lilies paired with lush eucalyptus foliage. Famous for an intoxicating natural floral aroma that fills your entire living space.',
    highlights: [
      'Long-Lasting 10-Day Stems',
      'Express 2-4 Hours Delivery',
      'Delivered in Fresh Hydration Wrap'
    ]
  },
  {
    id: 'fl-mock-03',
    occasions: ["Birthday","Get Well Soon","Congratulations"],
    name: 'Sunflower Bunch',
    category: 'Mini Bouquets',
    categorySlug: 'mini-bouquets',
    origin: 'International',
    flowerType: 'Sunflowers',
    bouquetType: 'Mini Bouquets',
    colors: ['Yellow'],
    price: 749,
    oldPrice: 999,
    discountBadge: '-25%',
    rating: 4.6,
    reviewsCount: '740',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/sunflower_bunch.jpg',
    gallery: [
      '/flowers/sunflower_bunch.jpg',
      '/flowers/mix_flower_bouquet.jpg'
    ],
    description: 'A radiant bunch of cheerful golden sunflowers with rich chocolate centers, harvested directly from sunny farms to bring instant warmth and optimism.',
    highlights: [
      '100% Farm Fresh Sunflowers',
      'Same-Day Delivery Available',
      'Artisanal Kraft Wrapping'
    ]
  },

  // ================= 3. INTERNATIONAL ORCHIDS & TULIPS =================
  {
    id: 'fl-mock-04',
    occasions: ["Corporate / Events"],
    name: 'Exotic Purple Orchid Plant',
    category: 'Orchids',
    categorySlug: 'orchids',
    origin: 'International',
    flowerType: 'Orchids',
    bouquetType: null,
    colors: ['Purple', 'Lavender'],
    price: 1349,
    oldPrice: 1499,
    discountBadge: '-10%',
    rating: 4.6,
    reviewsCount: '540',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/orchid_plant.jpg',
    gallery: [
      '/flowers/orchid_plant.jpg'
    ],
    description: 'A magnificent blooming purple Dendrobium orchid in a minimalist modern matte ceramic pot. Known for its sophisticated beauty and 3+ weeks blooming duration.',
    highlights: [
      'Exotic Hydroponic Bloom',
      'Includes Ceramic Planter',
      'Super Easy Care Guide'
    ]
  },
  {
    id: 'fl-mock-07',
    occasions: ["Mother's Day","Get Well Soon"],
    name: 'Spring Fresh Dutch Tulips',
    category: 'Tulips',
    categorySlug: 'tulips',
    origin: 'International',
    flowerType: 'Tulips',
    bouquetType: 'Premium Bouquets',
    colors: ['Pink', 'Peach'],
    price: 959,
    oldPrice: 1199,
    discountBadge: '-20%',
    rating: 4.8,
    reviewsCount: '480',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/tulip_bouquet.jpg',
    gallery: [
      '/flowers/tulip_bouquet.jpg'
    ],
    description: 'A fresh spring collection of imported pink and coral Dutch tulips with slender green leaves that bloom open into velvety cups.',
    highlights: [
      'Direct Dutch Import',
      'Cold-Chain Safe Delivery',
      'Fresh Bloom Guarantee'
    ]
  },

  // ================= 4. INDIAN FLOWERS (ALL MENU ITEMS - PRICE RANGE â‚¹150 - â‚¹350) =================
  {
    id: 'fl-ind-01',
    occasions: ["Housewarming"],
    name: 'Golden Marigold Garland (Genda)',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Marigold',
    bouquetType: null,
    colors: ['Orange', 'Yellow'],
    price: 199,
    oldPrice: 299,
    discountBadge: '-33%',
    rating: 4.9,
    reviewsCount: '890',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/marigold_flowers.jpg',
    gallery: [
      '/flowers/marigold_flowers.jpg'
    ],
    description: 'Fresh sunrise-harvested orange and golden yellow Indian Marigold (Genda) blooms strung with auspicious mango leaf accents for home entry, welcoming and festivities.',
    highlights: [
      'Fresh Dawn Harvest',
      'Morning 6-8 AM Delivery',
      'Natural Banana Leaf Wrap'
    ]
  },
  {
    id: 'fl-ind-02',
    occasions: ["Housewarming"],
    name: 'Fragrant Madurai Jasmine (Mogra)',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Jasmine (Mogra)',
    bouquetType: null,
    colors: ['White', 'Cream'],
    price: 249,
    oldPrice: 349,
    discountBadge: '-28%',
    rating: 5.0,
    reviewsCount: '1.4k',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/madurai_jasmine_mogra.jpg',
    gallery: [
      '/flowers/madurai_jasmine_mogra.jpg'
    ],
    description: 'Pristine fragrant white Mogra buds sourced directly from Madurai. Infuses heavenly natural floral fragrance that stays fresh and fragrant for up to 48 hours.',
    highlights: [
      'GI-Tagged Authentic Madurai Mogra',
      'Dew-Fresh Dawn Plucking',
      'Aroma-Preserving Chilled Pack'
    ]
  },
  {
    id: 'fl-ind-03',
    occasions: [],
    name: 'Sacred Pink Lotus Bloom (Kamal)',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Lotus',
    bouquetType: null,
    colors: ['Pink'],
    price: 299,
    oldPrice: 399,
    discountBadge: '-25%',
    rating: 4.9,
    reviewsCount: '450',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/sacred_pink_lotus.jpg',
    gallery: [
      '/flowers/sacred_pink_lotus.jpg'
    ],
    description: 'Magnificent fresh sacred pink blooming lotuses (Kamal) with serene dewdrops, radiating divine elegance, purity, and spiritual grace.',
    highlights: [
      'Fresh Pond Harvest',
      'Hydrated Stem Capsules',
      'Express Same-Day Delivery'
    ]
  },
  {
    id: 'fl-ind-04',
    occasions: [],
    name: 'Crimson Velvet Hibiscus Bloom',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Hibiscus',
    bouquetType: null,
    colors: ['Red'],
    price: 189,
    oldPrice: 289,
    discountBadge: '-35%',
    rating: 4.7,
    reviewsCount: '310',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/red_hibiscus.jpg',
    gallery: [
      '/flowers/red_hibiscus.jpg'
    ],
    description: 'Deep velvet crimson red fresh hibiscus blossoms with vibrant natural pollen stamens, symbolic of devotion, power, and natural wellness.',
    highlights: [
      'Plucked Fresh at Dawn',
      'Preserved Petal Integrity',
      'Free Customized Greeting Note'
    ]
  },
  {
    id: 'fl-ind-05',
    occasions: ["Sympathy / Funeral"],
    name: 'Fragrant Tuberose (Rajnigandha) Stalks',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Tuberose (Rajnigandha)',
    bouquetType: null,
    colors: ['White', 'Cream'],
    price: 279,
    oldPrice: 379,
    discountBadge: '-26%',
    rating: 4.8,
    reviewsCount: '620',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/tuberose.png',
    gallery: [
      '/flowers/tuberose.png'
    ],
    description: 'Long elegant stalks of starry white Rajnigandha (Tuberose) florets renowned for rich, sweet perfume that blooms and intensifies each evening.',
    highlights: [
      'Rich Evening Fragrance',
      'Long-Lasting 7-Day Bloom',
      'Delivered in Fresh Stem Sleeves'
    ]
  },
  {
    id: 'fl-ind-03b',
    occasions: [],
    name: 'Auspicious Sacred Lotus Trio (3 Stems)',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Lotus',
    bouquetType: null,
    colors: ['White', 'Yellow'],
    price: 349,
    oldPrice: 449,
    discountBadge: '-22%',
    rating: 4.9,
    reviewsCount: '320',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/sacred_lotus_trio.jpg',
    gallery: [
      '/flowers/sacred_lotus_trio.jpg'
    ],
    description: 'Set of divine fresh sacred blooming lotuses with pristine serene petals and golden aura, ideal for spiritual rituals and sanctified altar decor.',
    highlights: [
      'Dewy Fresh Pond Stems',
      'Stem Moisture Vials Included',
      'Sacred Ritual Grade'
    ]
  },
  {
    id: 'fl-ind-06b',
    occasions: [],
    name: 'Sunny Yellow Shevanti Festival Bunch',
    category: 'Indian Flowers',
    categorySlug: 'indian-flowers',
    origin: 'Indian',
    flowerType: 'Chrysanthemum',
    bouquetType: null,
    colors: ['Yellow', 'Orange'],
    price: 189,
    oldPrice: 269,
    discountBadge: '-29%',
    rating: 4.7,
    reviewsCount: '380',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/sunny_shevanti_bunch.jpg',
    gallery: [
      '/flowers/sunny_shevanti_bunch.jpg'
    ],
    description: 'Bright golden and yellow Chrysanthemum heads with hardy flower structure and long vase life, perfect for welcoming decor.',
    highlights: [
      '10+ Days Bloom Life',
      'Vibrant Festive Shades',
      'Direct Farm Harvest'
    ]
  },

  // ================= 5. MORE INTERNATIONAL FLOWERS =================
  {
    id: 'fl-int-08',
    occasions: ["Get Well Soon"],
    name: 'Cheerful Sunny Gerbera Bunch',
    category: 'Mini Bouquets',
    categorySlug: 'mini-bouquets',
    origin: 'International',
    flowerType: 'Gerberas',
    bouquetType: 'Mini Bouquets',
    colors: ['Yellow'],
    price: 699,
    oldPrice: 849,
    discountBadge: '-18%',
    rating: 4.7,
    reviewsCount: '410',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/cheerful_gerbera_bunch.jpg',
    gallery: [
      '/flowers/cheerful_gerbera_bunch.jpg'
    ],
    description: 'Big cheerful gerbera daisy blooms in warm sunset hues of peach, golden yellow, and orange, tied with rustic woven ribbon.',
    highlights: [
      'Vibrant Sunset Colors',
      'Stem Reinforcing Straws Included',
      'Same-Day 2-Hour Delivery'
    ]
  },

  // ================= 6. BOUQUET SPECIALS =================
  {
    id: 'fl-bq-04',
    occasions: ["Mother's Day","Congratulations"],
    name: 'Pastel Mixed Flower Bouquet',
    category: 'Bouquets',
    categorySlug: 'bouquets',
    origin: 'International',
    flowerType: 'Carnations',
    bouquetType: 'Mixed Flower Bouquets',
    colors: ['Pink', 'Orange', 'Yellow'],
    price: 849,
    oldPrice: 999,
    discountBadge: '-15%',
    rating: 4.7,
    reviewsCount: '890',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/mix_flower_bouquet.jpg',
    gallery: [
      '/flowers/mix_flower_bouquet.jpg',
      '/flowers/pink_rose_bouquet.jpg'
    ],
    description: 'A colorful celebration of pink carnations, orange spray roses, cheerful daisies, and white gypsophila tied with artisanal ribbon in French paper wrap.',
    highlights: [
      'Multi-Flower Variety',
      '2-Hour Express Delivery',
      'Free Greeting Card Included'
    ]
  },

  // ================= 7. FLOWER POTS & POTTED PLANTS =================
  {
    id: 'fl-pot-01',
    occasions: ["Congratulations","Corporate / Events"],
    name: 'Exotic Purple Orchid Ceramic Pot',
    category: 'Flower Pots',
    categorySlug: 'flower-pots',
    origin: 'International',
    flowerType: 'Orchids',
    bouquetType: null,
    colors: ['Purple', 'Magenta'],
    price: 1299,
    oldPrice: 1599,
    discountBadge: '-19%',
    rating: 4.9,
    reviewsCount: '340',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/flowers/purple_orchid_pot.jpg',
    gallery: [
      '/flowers/purple_orchid_pot.jpg'
    ],
    description: 'A magnificent blooming purple Dendrobium orchid nestled in a hand-crafted white ceramic planter pot. Low-maintenance and blooms for over 4 weeks.',
    highlights: [
      'Blooms for 4+ Weeks',
      'Ceramic Planter Included',
      'Plant Care Card Included'
    ]
  },
  {
    id: 'fl-pot-02',
    occasions: ["Housewarming","Corporate / Events"],
    name: 'White Orchid Flowers With Pink Pot',
    category: 'Flower Pots',
    categorySlug: 'flower-pots',
    origin: 'International',
    flowerType: 'Orchids',
    bouquetType: null,
    colors: ['White', 'Pink'],
    price: 1199,
    oldPrice: 1499,
    discountBadge: '-20%',
    rating: 4.8,
    reviewsCount: '280',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/white_orchid_pink_pot.jpg',
    gallery: [
      '/flowers/white_orchid_pink_pot.jpg'
    ],
    description: 'Graceful blooming white Phalaenopsis orchids with delicate golden-yellow centers potted in an embossed pastel pink designer ceramic pot. Perfect for dining and bedside tables.',
    highlights: [
      'Pure White Orchid Blooms',
      'Designer Pastel Pink Pot',
      'Low Maintenance & Long Lasting'
    ]
  },
  {
    id: 'fl-pot-03',
    occasions: ["Get Well Soon"],
    name: 'Vibrant Blooming Pot Of Flowers',
    category: 'Flower Pots',
    categorySlug: 'flower-pots',
    origin: 'International',
    flowerType: 'Gerberas & Daisies',
    bouquetType: null,
    colors: ['Red', 'Yellow', 'Pink', 'Orange'],
    price: 899,
    oldPrice: 1099,
    discountBadge: '-18%',
    rating: 4.8,
    reviewsCount: '240',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    image: '/flowers/vibrant_blooming_pot.jpg',
    gallery: [
      '/flowers/vibrant_blooming_pot.jpg'
    ],
    description: 'Vibrant blooming pot with colorful multi-hue daisies and gerberas in a cheerful red pot, bringing joyful floral energy into any room or workspace.',
    highlights: [
      'Multi-Colored Fresh Blooms',
      'Glossy Red Ceramic Planter',
      'Perfect for Desk & Home Decor'
    ]
  },
  {
    id: 'fl-pot-04',
    occasions: ["Housewarming","Corporate / Events"],
    name: 'Artificial Flower Pot for Home Decor',
    category: 'Flower Pots',
    categorySlug: 'flower-pots',
    origin: 'International',
    flowerType: 'Gerberas',
    bouquetType: null,
    colors: ['Red', 'White'],
    price: 999,
    oldPrice: 1299,
    discountBadge: '-23%',
    rating: 4.8,
    reviewsCount: '195',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    image: '/flowers/artificial_flower_pot.jpg',
    gallery: [
      '/flowers/artificial_flower_pot.jpg'
    ],
    description: 'Vibrant botanical red gerbera and daisy blooms accented with lush greenery in an elegant white fluted ceramic bowl pot, ideal for coffee tables, shelves, and home decor.',
    highlights: [
      'Everlasting Fresh Look',
      'Fluted White Ceramic Pot',
      'Zero Maintenance Decor'
    ]
  },
    // ================= 8. BIRTHDAY SPECIAL PRODUCTS =================
  {
    id: 'fl-bday-01',
    occasions: ["Birthday"],
    name: 'Birthday Special Flower Bouquet with Greeting Card',
    category: 'Bouquets',
    categorySlug: 'bouquets',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Premium Bouquets',
    colors: ['Red', 'Pink', 'Yellow'],
    price: 1099,
    oldPrice: 1399,
    discountBadge: '-21%',
    rating: 4.9,
    reviewsCount: '1.1k',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/birthday_bouquet_card.jpg',
    gallery: [
      '/img/birthday_bouquet_card.jpg',
      '/img/birthday_arrangement.jpg',
      '/flowers/pink_rose_bouquet.jpg'
    ],
    description: 'A grand birthday celebration bouquet filled with vibrant red roses, pink carnations, and golden sunflowers, beautifully wrapped with a personalised greeting card.',
    highlights: [
      'Premium Mixed Blooms',
      'Personalised Birthday Greeting Card',
      'Same-Day Express Delivery'
    ]
  },
  {
    id: 'fl-bday-02',
    occasions: ["Birthday"],
    name: 'Birthday Special Flower Arrangement',
    category: 'Bouquets',
    categorySlug: 'bouquets',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Luxury Bouquets',
    colors: ['Red', 'Pink', 'Orange'],
    price: 1299,
    oldPrice: 1699,
    discountBadge: '-24%',
    rating: 4.8,
    reviewsCount: '640',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    image: '/img/birthday_arrangement.jpg',
    gallery: [
      '/img/birthday_arrangement.jpg',
      '/img/birthday_bouquet_card.jpg'
    ],
    description: 'An artfully designed birthday special flower arrangement featuring lush red roses, exotic tulips and bright sunflowers, the perfect centrepiece gift for a memorable birthday celebration.',
    highlights: [
      'Artisan-Styled Arrangement',
      'Vase or Box Presentation',
      'Free Birthday Ribbon & Card'
    ]
  },

  // ================= 9. WEDDING SPECIAL PRODUCTS =================
  {
    id: 'fl-wed-01',
    occasions: ["Wedding","Sympathy / Funeral"],
    name: 'White Lily Bouquet',
    category: 'Lilies',
    categorySlug: 'lilies',
    origin: 'International',
    flowerType: 'Lilies',
    bouquetType: 'Premium Bouquets',
    colors: ['White'],
    price: 999,
    oldPrice: 1299,
    discountBadge: '-23%',
    rating: 4.9,
    reviewsCount: '480',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/white_lily_bouquet.jpg',
    gallery: [
      '/img/white_lily_bouquet.jpg',
      '/flowers/white_rose_bouquet.jpg'
    ],
    description: 'Pristine, fragrant white oriental lilies — the ultimate symbol of purity and new beginnings. Perfect for bridal bouquets, wedding decor, and elegant floral arrangements.',
    highlights: [
      'Pure White Oriental Lilies',
      'Long-Lasting 10-Day Bloom',
      'Bridal Satin Ribbon Included'
    ]
  },
  {
    id: 'fl-wed-02',
    occasions: ["Wedding","Sympathy / Funeral"],
    name: 'White Carnation Bouquet',
    category: 'Bouquets',
    categorySlug: 'bouquets',
    origin: 'International',
    flowerType: 'Carnations',
    bouquetType: 'Premium Bouquets',
    colors: ['White'],
    price: 749,
    oldPrice: 999,
    discountBadge: '-25%',
    rating: 4.7,
    reviewsCount: '390',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/white_carnation_bouquet.jpg',
    gallery: [
      '/img/white_carnation_bouquet.jpg',
      '/img/white_lily_bouquet.jpg'
    ],
    description: 'Soft, lush white carnations symbolising pure love, luck, and devotion, beautifully bundled in premium ivory satin ribbon wrap. A classic choice for wedding bouquets and table centrepieces.',
    highlights: [
      'Fresh White Carnation Blooms',
      'Wedding-Grade Premium Pack',
      'Ivory Satin Ribbon Finish'
    ]
  },
  {
    id: 'fl-wed-04',
    occasions: ["Wedding"],
    name: 'White Wedding Flower Arrangement',
    category: 'Bouquets',
    categorySlug: 'bouquets',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Luxury Bouquets',
    colors: ['White', 'Cream'],
    price: 1599,
    oldPrice: 1999,
    discountBadge: '-20%',
    rating: 4.9,
    reviewsCount: '550',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/white_wedding_arrangement.jpg',
    gallery: [
      '/img/white_wedding_arrangement.jpg',
      '/flowers/white_rose_bouquet.jpg'
    ],
    description: 'A stunning white wedding flower arrangement with roses, lilies, carnations and babys breath in a modern vase, perfect for wedding venues, bridal tables and ceremonial decor.',
    highlights: [
      'Bridal-Grade White Florals',
      'Designer Vase Arrangement',
      'All-Day Freshness Guaranteed'
    ]
  },

  // ================= 10. ANNIVERSARY SPECIAL PRODUCTS =================
  {
    id: 'fl-ann-02',
    occasions: ["Anniversary"],
    name: 'Red & White Rose Anniversary Bouquet',
    category: 'Roses',
    categorySlug: 'roses',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Rose Bouquets',
    colors: ['Red', 'White'],
    price: 1099,
    oldPrice: 1399,
    discountBadge: '-21%',
    rating: 4.8,
    reviewsCount: '670',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/red_white_rose_bouquet.jpg',
    gallery: [
      '/img/red_white_rose_bouquet.jpg',
      '/flowers/red_rose_bouquet.jpg',
      '/flowers/white_rose_bouquet.jpg'
    ],
    description: 'A stunning blend of passionate red and pure white roses, beautifully tied to represent the perfect balance of passion and purity in a loving anniversary relationship.',
    highlights: [
      'Mixed Red & White Roses',
      'Kraft Paper Luxury Wrap',
      'Free Anniversary Message Card'
    ]
  },
  {
    id: 'fl-ann-03',
    occasions: ["Anniversary","Valentine's Day"],
    name: 'Romantic Red Flower Arrangement',
    category: 'Bouquets',
    categorySlug: 'bouquets',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Luxury Bouquets',
    colors: ['Red', 'Pink'],
    price: 1399,
    oldPrice: 1799,
    discountBadge: '-22%',
    rating: 4.9,
    reviewsCount: '480',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/romantic_red_arrangement.jpg',
    gallery: [
      '/img/romantic_red_arrangement.jpg',
      '/flowers/red_rose_bouquet.jpg'
    ],
    description: 'A breathtaking romantic red flower arrangement with roses, tulips, and gypsophila in a designer vase — the ultimate anniversary gift for your loved one.',
    highlights: [
      'Premium Red Rose Centrepiece',
      'Designer Vase Presentation',
      'Luxury Gift-Box Available'
    ]
  },
  {
    id: 'fl-ann-04',
    occasions: ["Anniversary","Valentine's Day"],
    name: 'Premium Red Rose Bouquet with Greeting Card',
    category: 'Roses',
    categorySlug: 'roses',
    origin: 'International',
    flowerType: 'Roses',
    bouquetType: 'Premium Bouquets',
    colors: ['Red'],
    price: 1249,
    oldPrice: 1599,
    discountBadge: '-22%',
    rating: 4.9,
    reviewsCount: '1.3k',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: '/img/red_rose_card_bouquet.jpg',
    gallery: [
      '/img/red_rose_card_bouquet.jpg',
      '/flowers/red_rose_bouquet.jpg'
    ],
    description: 'A premium bouquet of lush red roses elegantly wrapped in silk paper, complete with a personalised greeting card — the perfect heartfelt expression for anniversaries and romantic occasions.',
    highlights: [
      'Premium Long-Stem Red Roses',
      'Personalised Greeting Card',
      'Luxury Silk Paper Wrap'
    ]
  }

];

export const TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Priya Sharma',
    city: 'Mumbai',
    quote: 'Absolutely loved the bouquet! Fresh flowers and super fast delivery. Floora is amazing!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 't-2',
    name: 'Aarav Mehta',
    city: 'Delhi NCR',
    quote: 'Ordered the Red Rose Bouquet for my anniversary. The packaging was so luxurious and the flowers lasted over 8 days!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 't-3',
    name: 'Sneha More',
    city: 'Pune',
    quote: 'The Madurai Mogra and Marigold garland were freshly plucked and smelled divine. Perfect packaging!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
  }
];
