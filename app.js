/* ============================================================
   VINOVA — Main Application JavaScript
   ============================================================ */

// ─── STATE ────────────────────────────────────────────────────
const state = {
  cart: JSON.parse(localStorage.getItem('vinova_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('vinova_wishlist') || '[]'),
  currency: localStorage.getItem('vinova_currency') || 'VND',
  lang: localStorage.getItem('vinova_lang') || 'vi',
  ageVerified: localStorage.getItem('vinova_age') === 'true',
  user: JSON.parse(localStorage.getItem('vinova_user') || 'null'),
  filters: { types: [], regions: [], grapes: [], priceMin: 0, priceMax: 50000000, abvMin: 0, abvMax: 60, ratings: [] },
  page: 'home',
  checkoutStep: 1,
};

// ─── PRODUCTS DATABASE ────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, name: "Château Lafite Rothschild", vintage: 2018,
    region: "Pháp", subregion: "Bordeaux", type: "red",
    grape: "Cabernet Sauvignon", abv: 13.5, volume: "750ml",
    price: 18500000, oldPrice: 21000000,
    score: 98, rating: 4.9, reviews: 234,
    badge: "Best Seller",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ rubis sâu", nose: "Cassis, hương gỗ sồi, hoa violets", palate: "Tannic mịn, thanh lịch, phức hợp", finish: "Dài >90 giây" },
    food: ["Bò bít tết", "Thịt cừu nướng", "Pho mát cứng"],
    tags: ["premium", "collection", "gift"],
    stock: 12,
  },
  {
    id: 2, name: "Domaine de la Romanée-Conti", vintage: 2017,
    region: "Pháp", subregion: "Burgundy", type: "red",
    grape: "Pinot Noir", abv: 13.0, volume: "750ml",
    price: 95000000, oldPrice: null,
    score: 100, rating: 5.0, reviews: 48,
    badge: "Hiếm",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ garnet trong suốt", nose: "Cherry đỏ, hoa hồng, đất quý", palate: "Tinh tế, phức hợp phi thường", finish: ">2 phút" },
    food: ["Phô mai Comté", "Nấm truffle", "Cá hồi hun khói"],
    tags: ["luxury", "rare", "collection"],
    stock: 3,
  },
  {
    id: 3, name: "Opus One Reserve", vintage: 2019,
    region: "Mỹ", subregion: "Napa Valley", type: "red",
    grape: "Cabernet Sauvignon blend", abv: 14.5, volume: "750ml",
    price: 12800000, oldPrice: 14500000,
    score: 96, rating: 4.8, reviews: 187,
    badge: "Mới về",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ tím đậm", nose: "Mứt mận, chocolate đen, vanilla", palate: "Dày dặn, mượt mà", finish: "Dài ấm áp" },
    food: ["Sườn bò nướng BBQ", "Xốt nấm rừng", "Phô mai cheddar"],
    tags: ["premium", "new"],
    stock: 24,
  },
  {
    id: 4, name: "Dom Pérignon Vintage", vintage: 2013,
    region: "Pháp", subregion: "Champagne", type: "sparkling",
    grape: "Chardonnay / Pinot Noir", abv: 12.5, volume: "750ml",
    price: 7200000, oldPrice: 8500000,
    score: 97, rating: 4.9, reviews: 312,
    badge: "Sale 15%",
    img: "images/champagne_bottle.jpg",
    tasting: { color: "Vàng rơm óng ánh", nose: "Bánh mì nướng, chanh vàng, acacia", palate: "Sủi bọt mịn, tinh tế", finish: "Tươi mát dài" },
    food: ["Hải sản tươi", "Oyster", "Caviar", "Sashimi"],
    tags: ["champagne", "gift", "celebration"],
    stock: 36,
  },
  {
    id: 5, name: "Macallan 25 Year Sherry Oak", vintage: null,
    region: "Scotland", subregion: "Speyside", type: "whisky",
    grape: null, abv: 43.0, volume: "700ml",
    price: 52000000, oldPrice: null,
    score: 95, rating: 4.9, reviews: 89,
    badge: "Siêu hiếm",
    img: "images/whisky_bottle.jpg",
    tasting: { color: "Amber vàng tươi", nose: "Sherry ngọt, vanilla, gừng", palate: "Mịn như nhung, phong phú", finish: "Rất dài ấm áp" },
    food: ["Chocolate đen", "Cigar Cuba", "Phô mai cứng"],
    tags: ["whisky", "luxury", "rare"],
    stock: 5,
  },
  {
    id: 6, name: "Sassicaia 2020", vintage: 2020,
    region: "Ý", subregion: "Bolgheri", type: "red",
    grape: "Cabernet Sauvignon", abv: 13.5, volume: "750ml",
    price: 6800000, oldPrice: 7500000,
    score: 94, rating: 4.7, reviews: 156,
    badge: null,
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ rubis đậm", nose: "Blackberry, ceder, herbs Địa Trung Hải", palate: "Đậm đà, cấu trúc tốt", finish: "Dài và nhất quán" },
    food: ["Pasta thịt bò", "Pizza thịt nguội", "Cá ngừ tươi"],
    tags: ["italian", "premium"],
    stock: 30,
  },
  {
    id: 7, name: "Cloudy Bay Sauvignon Blanc", vintage: 2022,
    region: "New Zealand", subregion: "Marlborough", type: "white",
    grape: "Sauvignon Blanc", abv: 13.0, volume: "750ml",
    price: 850000, oldPrice: 1000000,
    score: 91, rating: 4.5, reviews: 428,
    badge: "Bán chạy",
    img: "images/white_wine_bottle.jpg",
    tasting: { color: "Vàng nhạt trong suốt", nose: "Chanh dây, lý chua, cỏ mới cắt", palate: "Sắc sảo, tươi mát", finish: "Thanh và sạch" },
    food: ["Gỏi hải sản", "Sushi", "Salad rau thơm"],
    tags: ["white", "everyday"],
    stock: 120,
  },
  {
    id: 8, name: "Concha y Toro Don Melchor", vintage: 2020,
    region: "Chile", subregion: "Puente Alto", type: "red",
    grape: "Cabernet Sauvignon", abv: 14.5, volume: "750ml",
    price: 2200000, oldPrice: 2800000,
    score: 93, rating: 4.6, reviews: 203,
    badge: "Combo tiết kiệm",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ tím thẫm", nose: "Cassis chín, café espresso, hương gỗ", palate: "Đầy đặn, cân bằng xuất sắc", finish: "Dài và tinh tế" },
    food: ["Bò wagyu", "Lamb chop", "Dark chocolate"],
    tags: ["value", "south-america"],
    stock: 58,
  },
  {
    id: 9, name: "Penfolds Grange", vintage: 2018,
    region: "Úc", subregion: "South Australia", type: "red",
    grape: "Shiraz", abv: 14.5, volume: "750ml",
    price: 9500000, oldPrice: 11000000,
    score: 97, rating: 4.8, reviews: 143,
    badge: "Iconic",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ tím sậm", nose: "Mận chín, chocolate, hương hồi và gỗ sồi", palate: "Đậm đà, hùng hậu, tanin rất mịn", finish: "Cực dài, ấm áp" },
    food: ["Kangaroo steak", "Bò nướng BBQ", "Phô mai xanh"],
    tags: ["australian", "premium", "iconic"],
    stock: 18,
  },
  {
    id: 10, name: "Vega Sicilia Único", vintage: 2012,
    region: "Tây Ban Nha", subregion: "Ribera del Duero", type: "red",
    grape: "Tempranillo / Cabernet", abv: 14.0, volume: "750ml",
    price: 14500000, oldPrice: null,
    score: 98, rating: 4.9, reviews: 67,
    badge: "Hiếm có",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ garnet già", nose: "Cherry đen, da thuộc, hương thảo mộc Tây Ban Nha", palate: "Tinh tế, cân bằng hoàn hảo, đa tầng", finish: "Kéo dài vô tận" },
    food: ["Jamón ibérico", "Chorizo", "Thịt cừu quay"],
    tags: ["spanish", "luxury", "rare"],
    stock: 6,
  },
  {
    id: 11, name: "Moët & Chandon Ice Impérial", vintage: null,
    region: "Pháp", subregion: "Champagne", type: "sparkling",
    grape: "Pinot Noir / Chardonnay / Meunier", abv: 12.0, volume: "750ml",
    price: 2200000, oldPrice: 2600000,
    score: 90, rating: 4.5, reviews: 521,
    badge: "Sale 15%",
    img: "images/champagne_bottle.jpg",
    tasting: { color: "Vàng nhạt với bọt nhỏ li ti", nose: "Đào, lê, hoa nhài", palate: "Ngọt mát, sủi bọt dịu, tươi trẻ", finish: "Thanh mát, dứt khoát" },
    food: ["Đá bào trái cây", "Mousse chanh", "Cocktail party"],
    tags: ["champagne", "party", "gift"],
    stock: 80,
  },
  {
    id: 12, name: "Johnnie Walker Blue Label", vintage: null,
    region: "Scotland", subregion: "Blended", type: "whisky",
    grape: null, abv: 40.0, volume: "750ml",
    price: 5200000, oldPrice: 5800000,
    score: 92, rating: 4.7, reviews: 388,
    badge: "Quà tặng",
    img: "images/whisky_bottle.jpg",
    tasting: { color: "琥珀 vàng sâu", nose: "Honey, vanilla, trái cây sấy khô", palate: "Mượt mà, phong phú, vị khói nhẹ", finish: "Ấm áp, dài" },
    food: ["Cigar", "Chocolate trắng", "Cá hồi xông khói"],
    tags: ["whisky", "gift", "blended"],
    stock: 45,
  },
  {
    id: 13, name: "Whispering Angel Rosé", vintage: 2022,
    region: "Pháp", subregion: "Provence", type: "rosé",
    grape: "Grenache / Cinsault / Rolle", abv: 13.0, volume: "750ml",
    price: 1450000, oldPrice: 1700000,
    score: 91, rating: 4.6, reviews: 276,
    badge: "Mùa hè",
    img: "images/rose_wine_bottle.jpg",
    tasting: { color: "Hồng phấn nhạt, trong suốt", nose: "Dâu tây, đào trắng, hoa hồng", palate: "Tươi, nhẹ nhàng, cân bằng tuyệt vời", finish: "Sạch, dứt khoát" },
    food: ["Salad Niçoise", "Tôm nướng", "Phô mai dê"],
    tags: ["rosé", "summer", "provence"],
    stock: 65,
  },
  {
    id: 14, name: "Remy Martin XO", vintage: null,
    region: "Pháp", subregion: "Cognac", type: "brandy",
    grape: null, abv: 40.0, volume: "700ml",
    price: 4800000, oldPrice: 5500000,
    score: 94, rating: 4.8, reviews: 192,
    badge: "Sang trọng",
    img: "images/cognac_bottle.jpg",
    tasting: { color: "Amber đỏ sâu", nose: "Mận khô, cam quýt, hoa jasmine, hương gỗ", palate: "Mượt, ấm, vị trái cây chín và gia vị", finish: "Rất dài, hoa quả và gỗ" },
    food: ["Foie gras", "Phô mai brie", "Socola truffle"],
    tags: ["cognac", "brandy", "luxury", "gift"],
    stock: 22,
  },
  {
    id: 15, name: "Gaja Barbaresco", vintage: 2019,
    region: "Ý", subregion: "Piedmont", type: "red",
    grape: "Nebbiolo", abv: 14.0, volume: "750ml",
    price: 7800000, oldPrice: null,
    score: 96, rating: 4.8, reviews: 109,
    badge: "Cổ điển",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ garnet với viền cam", nose: "Hoa hồng khô, cherry dại, nhựa trắng", palate: "Đậm đà nhưng tinh tế, tanin mạnh mẽ", finish: "Dài với hương hoa và đất" },
    food: ["Risotto nấm truffle", "Thịt bò hầm Barolo", "Phô mai Parmesan"],
    tags: ["italian", "premium", "nebbiolo"],
    stock: 14,
  },
  {
    id: 16, name: "Egon Müller Scharzhofberger Riesling TBA", vintage: 2020,
    region: "Đức", subregion: "Mosel", type: "white",
    grape: "Riesling", abv: 7.0, volume: "375ml",
    price: 22000000, oldPrice: null,
    score: 100, rating: 5.0, reviews: 23,
    badge: "Quý hiếm",
    img: "images/white_wine_bottle.jpg",
    tasting: { color: "Vàng mật ong óng ánh", nose: "Mật ong, mơ sấy, cam quýt, khoáng chất", palate: "Cực ngọt nhưng tươi, cân bằng siêu việt", finish: "Vĩnh cửu, hơn 3 phút" },
    food: ["Foie gras", "Roquefort", "Bánh flan caramel"],
    tags: ["germany", "dessert", "luxury", "rare"],
    stock: 4,
  },
  {
    id: 17, name: "Screaming Eagle Cabernet", vintage: 2016,
    region: "Mỹ", subregion: "Napa Valley", type: "red",
    grape: "Cabernet Sauvignon", abv: 14.5, volume: "750ml",
    price: 75000000, oldPrice: null,
    score: 99, rating: 5.0, reviews: 31,
    badge: "Huyền thoại",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ tím sậm huyền bí", nose: "Cassis, mận đen, graphite, hương hoa violet", palate: "Hoàn hảo, phức hợp vô song, tanin như nhung", finish: "Bất tận, tinh khiết" },
    food: ["A5 Wagyu", "Lobster bisque", "Phô mai Époisses"],
    tags: ["usa", "luxury", "cult", "rare"],
    stock: 2,
  },
  {
    id: 18, name: "Torres Gran Coronas", vintage: 2020,
    region: "Tây Ban Nha", subregion: "Penedès", type: "red",
    grape: "Cabernet Sauvignon / Tempranillo", abv: 13.5, volume: "750ml",
    price: 650000, oldPrice: 800000,
    score: 89, rating: 4.4, reviews: 364,
    badge: "Tiết kiệm",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ cherry tươi sáng", nose: "Cherry, plum, hương thảo mộc", palate: "Trung bình, tươi, dễ uống", finish: "Vừa phải, trái cây" },
    food: ["Tapas", "Pizza", "Thịt nướng thông thường"],
    tags: ["spanish", "everyday", "value"],
    stock: 200,
  },
  {
    id: 19, name: "Cloudy Bay Te Koko", vintage: 2020,
    region: "New Zealand", subregion: "Marlborough", type: "white",
    grape: "Sauvignon Blanc", abv: 14.0, volume: "750ml",
    price: 1850000, oldPrice: 2200000,
    score: 93, rating: 4.7, reviews: 148,
    badge: "Đặc biệt",
    img: "images/white_wine_bottle.jpg",
    tasting: { color: "Vàng rơm đậm", nose: "Bơ, đào vàng, vanilla, hương sồi tinh tế", palate: "Phong phú, béo ngậy, phức hợp", finish: "Dài và mượt mà" },
    food: ["Bơ tôm hùm", "Gà quay kem nấm", "Pasta carbonara"],
    tags: ["white", "oaked", "premium"],
    stock: 38,
  },
  {
    id: 20, name: "Château d'Yquem", vintage: 2015,
    region: "Pháp", subregion: "Sauternes", type: "dessert",
    grape: "Sémillon / Sauvignon Blanc", abv: 14.0, volume: "375ml",
    price: 8500000, oldPrice: null,
    score: 98, rating: 4.9, reviews: 76,
    badge: "Vang ngọt đỉnh cao",
    img: "images/dessert_wine_bottle.jpg",
    tasting: { color: "Vàng mật ong óng ánh", nose: "Mơ sấy, mật ong, hoa acacia, gừng", palate: "Ngọt ngào uy nghi, cân bằng hoàn hảo bởi độ acid", finish: "Vô tận, mật hoa" },
    food: ["Foie gras", "Tôm hùm sốt bơ", "Phô mai Roquefort"],
    tags: ["dessert", "luxury", "sauternes"],
    stock: 9,
  },
  {
    id: 21, name: "Glenfiddich 18 Year", vintage: null,
    region: "Scotland", subregion: "Speyside", type: "whisky",
    grape: null, abv: 40.0, volume: "700ml",
    price: 2100000, oldPrice: 2500000,
    score: 91, rating: 4.6, reviews: 418,
    badge: "Bán chạy",
    img: "images/whisky_bottle.jpg",
    tasting: { color: "Vàng amber ấm", nose: "Đào, lê, oak, mật ong nhẹ", palate: "Mượt mà, trái cây ngọt, vanilla", finish: "Ấm áp, vừa phải" },
    food: ["Chocolate sữa", "Hạt điều rang", "Phô mai cheddar"],
    tags: ["whisky", "single-malt", "everyday"],
    stock: 55,
  },
  {
    id: 22, name: "Clos du Val Estate Chardonnay", vintage: 2021,
    region: "Mỹ", subregion: "Napa Valley", type: "white",
    grape: "Chardonnay", abv: 14.2, volume: "750ml",
    price: 1200000, oldPrice: 1450000,
    score: 90, rating: 4.5, reviews: 187,
    badge: null,
    img: "images/white_wine_bottle.jpg",
    tasting: { color: "Vàng rơm sáng", nose: "Táo vàng, bơ, vanilla, sồi nhẹ", palate: "Béo ngậy vừa phải, cân bằng tốt, tươi mát", finish: "Trung bình dài, trái cây" },
    food: ["Gà áp chảo bơ chanh", "Cá trắng nướng", "Risotto hải sản"],
    tags: ["white", "usa", "chardonnay"],
    stock: 42,
  },
  {
    id: 23, name: "Pio Cesare Barolo DOCG", vintage: 2018,
    region: "Ý", subregion: "Barolo", type: "red",
    grape: "Nebbiolo", abv: 14.5, volume: "750ml",
    price: 3200000, oldPrice: 3800000,
    score: 93, rating: 4.7, reviews: 134,
    badge: "Giảm 15%",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ garnet viền cam nhạt", nose: "Hoa hồng khô, cherry đen, nhựa thơm, đất", palate: "Tanin mạnh nhưng thanh lịch, phức hợp", finish: "Dài, khô và khoáng" },
    food: ["Braised beef", "Truffle pasta", "Phô mai Parmigiano"],
    tags: ["italian", "barolo", "premium"],
    stock: 27,
  },
  {
    id: 24, name: "Baileys Original Irish Cream", vintage: null,
    region: "Ireland", subregion: null, type: "liqueur",
    grape: null, abv: 17.0, volume: "700ml",
    price: 650000, oldPrice: 750000,
    score: 88, rating: 4.5, reviews: 862,
    badge: "Yêu thích",
    img: "images/cognac_bottle.jpg",
    tasting: { color: "Nâu kem mịn màng", nose: "Kem tươi, chocolate sữa, whisky nhẹ", palate: "Ngọt ngào, béo, êm dịu", finish: "Ngắn, ngọt và kem" },
    food: ["Bánh tiramisu", "Ice cream", "Cà phê Irish"],
    tags: ["liqueur", "everyday", "gift", "dessert"],
    stock: 150,
  },
  {
    id: 25, name: "Hennessy VSOP Privilege", vintage: null,
    region: "Pháp", subregion: "Cognac", type: "brandy",
    grape: null, abv: 40.0, volume: "700ml",
    price: 1900000, oldPrice: 2200000,
    score: 90, rating: 4.6, reviews: 534,
    badge: "Phổ biến",
    img: "images/cognac_bottle.jpg",
    tasting: { color: "Amber vàng ấm áp", nose: "Hoa quả nướng, hương gỗ, vanilla", palate: "Mượt mà, cân bằng, ấm và tinh tế", finish: "Dài vừa, dứt khoát" },
    food: ["Sô cô la đen", "Trái cây sấy", "Phô mai gruyère"],
    tags: ["cognac", "brandy", "everyday", "gift"],
    stock: 90,
  },
  {
    id: 26, name: "Masi Amarone della Valpolicella", vintage: 2017,
    region: "Ý", subregion: "Veneto", type: "red",
    grape: "Corvina / Molinara / Rondinella", abv: 15.5, volume: "750ml",
    price: 2800000, oldPrice: 3200000,
    score: 94, rating: 4.7, reviews: 178,
    badge: "Đậm đà",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ ruby đậm sẫm gần như tím", nose: "Anh đào đen, mận khô, socola đen, thuốc lá", palate: "Đậm đà, đầy đặn, phức hợp, tanin mềm", finish: "Rất dài, ấm" },
    food: ["Thịt bò hầm", "Phô mai Pecorino", "Risotto thịt"],
    tags: ["italian", "amarone", "bold"],
    stock: 32,
  },
  {
    id: 27, name: "Kumeu River Chardonnay", vintage: 2021,
    region: "New Zealand", subregion: "Auckland", type: "white",
    grape: "Chardonnay", abv: 13.5, volume: "750ml",
    price: 1100000, oldPrice: 1300000,
    score: 93, rating: 4.6, reviews: 99,
    badge: null,
    img: "images/white_wine_bottle.jpg",
    tasting: { color: "Vàng xanh nhạt trong suốt", nose: "Táo xanh, nho, hoa trắng, sồi nhẹ", palate: "Tươi sáng, khoáng, ít gỗ, thanh lịch", finish: "Dài và sạch" },
    food: ["Cá sole áp chảo", "Tôm hùm không sốt", "Salad rau xanh"],
    tags: ["white", "newzealand", "chardonnay"],
    stock: 44,
  },
  {
    id: 28, name: "Caymus Cabernet Sauvignon", vintage: 2021,
    region: "Mỹ", subregion: "Napa Valley", type: "red",
    grape: "Cabernet Sauvignon", abv: 14.8, volume: "750ml",
    price: 3600000, oldPrice: 4200000,
    score: 93, rating: 4.7, reviews: 289,
    badge: "Napa Favorite",
    img: "images/red_wine_bottle.jpg",
    tasting: { color: "Đỏ ruby đậm", nose: "Mứt mâm xôi, anh đào đen, vanilla, sồi ngọt", palate: "Đầy đặn, mềm mại, dễ tiếp cận, trái cây chín", finish: "Dài ấm, trái cây và gỗ" },
    food: ["Ribeye steak", "Bò bít tết", "BBQ sườn non"],
    tags: ["usa", "napa", "premium"],
    stock: 35,
  },
];


// ─── COUNTRY FLAG MAP ─────────────────────────────────────────
const FLAGS = {
  'Pháp': '<img src="https://flagcdn.com/w20/fr.png" srcset="https://flagcdn.com/w40/fr.png 2x" alt="Pháp" class="flag-icon">',
  'France': '<img src="https://flagcdn.com/w20/fr.png" srcset="https://flagcdn.com/w40/fr.png 2x" alt="Pháp" class="flag-icon">',
  'Ý': '<img src="https://flagcdn.com/w20/it.png" srcset="https://flagcdn.com/w40/it.png 2x" alt="Ý" class="flag-icon">',
  'Italy': '<img src="https://flagcdn.com/w20/it.png" srcset="https://flagcdn.com/w40/it.png 2x" alt="Ý" class="flag-icon">',
  'Mỹ': '<img src="https://flagcdn.com/w20/us.png" srcset="https://flagcdn.com/w40/us.png 2x" alt="Mỹ" class="flag-icon">',
  'USA': '<img src="https://flagcdn.com/w20/us.png" srcset="https://flagcdn.com/w40/us.png 2x" alt="Mỹ" class="flag-icon">',
  'Scotland': '<img src="https://flagcdn.com/w20/gb-sct.png" srcset="https://flagcdn.com/w40/gb-sct.png 2x" alt="Scotland" class="flag-icon">',
  'Ireland': '<img src="https://flagcdn.com/w20/ie.png" srcset="https://flagcdn.com/w40/ie.png 2x" alt="Ireland" class="flag-icon">',
  'Chile': '<img src="https://flagcdn.com/w20/cl.png" srcset="https://flagcdn.com/w40/cl.png 2x" alt="Chile" class="flag-icon">',
  'New Zealand': '<img src="https://flagcdn.com/w20/nz.png" srcset="https://flagcdn.com/w40/nz.png 2x" alt="New Zealand" class="flag-icon">',
  'Úc': '<img src="https://flagcdn.com/w20/au.png" srcset="https://flagcdn.com/w40/au.png 2x" alt="Úc" class="flag-icon">',
  'Australia': '<img src="https://flagcdn.com/w20/au.png" srcset="https://flagcdn.com/w40/au.png 2x" alt="Úc" class="flag-icon">',
  'Tây Ban Nha': '<img src="https://flagcdn.com/w20/es.png" srcset="https://flagcdn.com/w40/es.png 2x" alt="Tây Ban Nha" class="flag-icon">',
  'Spain': '<img src="https://flagcdn.com/w20/es.png" srcset="https://flagcdn.com/w40/es.png 2x" alt="Tây Ban Nha" class="flag-icon">',
  'Đức': '<img src="https://flagcdn.com/w20/de.png" srcset="https://flagcdn.com/w40/de.png 2x" alt="Đức" class="flag-icon">',
  'Germany': '<img src="https://flagcdn.com/w20/de.png" srcset="https://flagcdn.com/w40/de.png 2x" alt="Đức" class="flag-icon">',
  'Bồ Đào Nha': '<img src="https://flagcdn.com/w20/pt.png" srcset="https://flagcdn.com/w40/pt.png 2x" alt="Bồ Đào Nha" class="flag-icon">',
  'Portugal': '<img src="https://flagcdn.com/w20/pt.png" srcset="https://flagcdn.com/w40/pt.png 2x" alt="Bồ Đào Nha" class="flag-icon">',
  'Argentina': '<img src="https://flagcdn.com/w20/ar.png" srcset="https://flagcdn.com/w40/ar.png 2x" alt="Argentina" class="flag-icon">',
  'Nam Phi': '<img src="https://flagcdn.com/w20/za.png" srcset="https://flagcdn.com/w40/za.png 2x" alt="Nam Phi" class="flag-icon">',
  'Nhật Bản': '<img src="https://flagcdn.com/w20/jp.png" srcset="https://flagcdn.com/w40/jp.png 2x" alt="Nhật Bản" class="flag-icon">',
  'Japan': '<img src="https://flagcdn.com/w20/jp.png" srcset="https://flagcdn.com/w40/jp.png 2x" alt="Nhật Bản" class="flag-icon">',
};
function getFlag(region) {
  return FLAGS[region] ? FLAGS[region] + ' ' : '';
}

// ─── CURRENCY CONFIG ──────────────────────────────────────────

const CURRENCIES = {
  VND: { symbol: '₫', rate: 1, format: v => `${(v).toLocaleString('vi-VN')}₫` },
  USD: { symbol: '$', rate: 0.000039, format: v => `$${(v * 0.000039).toFixed(2)}` },
  EUR: { symbol: '€', rate: 0.000036, format: v => `€${(v * 0.000036).toFixed(2)}` },
};

function formatPrice(vnd) {
  return CURRENCIES[state.currency].format(vnd);
}

// ─── UTILITIES ────────────────────────────────────────────────
function saveState() {
  localStorage.setItem('vinova_cart', JSON.stringify(state.cart));
  localStorage.setItem('vinova_wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('vinova_currency', state.currency);
  localStorage.setItem('vinova_lang', state.lang);
}

function showToast(msg, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: '🍷' };
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span style="font-size:1.1rem">${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideInRight .3s ease reverse'; setTimeout(() => t.remove(), 300); }, duration);
}

function cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); }

function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    const count = cartCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ─── AGE GATE ─────────────────────────────────────────────────
function initAgeGate() {
  const overlay = document.getElementById('ageGate');
  if (!overlay) return;
  if (state.ageVerified) { overlay.remove(); return; }

  document.getElementById('ageYes')?.addEventListener('click', () => {
    state.ageVerified = true;
    localStorage.setItem('vinova_age', 'true');
    overlay.style.animation = 'fadeIn .3s ease reverse';
    setTimeout(() => overlay.remove(), 300);
  });
  document.getElementById('ageNo')?.addEventListener('click', () => {
    window.location.href = 'https://google.com';
  });
  document.getElementById('ageDobConfirm')?.addEventListener('click', () => {
    const d = +document.getElementById('dobDay')?.value;
    const m = +document.getElementById('dobMonth')?.value;
    const y = +document.getElementById('dobYear')?.value;
    if (!d || !m || !y) { showToast('Vui lòng nhập đầy đủ ngày sinh', 'error'); return; }
    const dob = new Date(y, m - 1, d);
    const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365.25);
    if (age >= 18) {
      state.ageVerified = true; localStorage.setItem('vinova_age', 'true');
      overlay.style.animation = 'fadeIn .3s ease reverse';
      setTimeout(() => overlay.remove(), 300);
    } else { showToast('Bạn chưa đủ 18 tuổi để truy cập trang này', 'error'); }
  });
}

// ─── NAVIGATION ───────────────────────────────────────────────
function navigate(page, data = {}) {
  state.page = page;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.add('active'); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  document.querySelectorAll('.navbar__link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  window.scrollTo(0, 0);
  if (page === 'products') renderProductListing();
  if (page === 'product-detail' && data.id) renderProductDetail(data.id);
  if (page === 'cart') renderCart();
  if (page === 'checkout') renderCheckout();
  if (page === 'account') renderAccount();
  if (page === 'admin') renderAdmin();
  if (page === 'wine-club') renderWineClub();
}

// ─── HAMBURGER ────────────────────────────────────────────────
function initNav() {
  document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.navbar__menu')?.classList.toggle('open');
  });
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', (e) => {
      const page = link.dataset.page;
      if (page) { e.preventDefault(); navigate(page); document.querySelector('.navbar__menu')?.classList.remove('open'); }
    });
  });
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 30);
  });
  // Currency
  document.getElementById('currencySelect')?.addEventListener('change', (e) => {
    state.currency = e.target.value; saveState(); updatePrices();
  });
}

function updatePrices() {
  document.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = formatPrice(+el.dataset.price);
  });
}

// ─── PRODUCT LISTING ──────────────────────────────────────────
function renderProductListing() {
  const container = document.getElementById('productGrid');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--c-muted)">⏳ Đang tải sản phẩm...</div>';

  const sort = document.getElementById('sortSelect')?.value || 'popular';
  const params = { sort: sort.replace('-', '_'), limit: 50 };
  if (state.filters.types?.length) params.type = state.filters.types[0];
  if (state.filters.regions?.length) params.region = state.filters.regions[0];

  const apiCall = (typeof window.VINOVA_API !== 'undefined')
    ? window.VINOVA_API.products.list(params).then(d => d.products)
    : Promise.reject();

  apiCall.catch(() => {
    let products = [...PRODUCTS];
    if (state.filters.types?.length) products = products.filter(p => state.filters.types.includes(p.type));
    if (state.filters.regions?.length) products = products.filter(p => state.filters.regions.includes(p.region));
    if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') products.sort((a, b) => (b.vintage || 0) - (a.vintage || 0));
    return products;
  }).then(products => {
    products = products.map(p => ({
      ...p,
      oldPrice: p.oldPrice !== undefined ? p.oldPrice : p.old_price,
      reviews: p.reviews !== undefined ? p.reviews : p.reviews_count,
      tasting: p.tasting || { color: '', nose: '', palate: '', finish: '' },
      food: Array.isArray(p.food_pairing) ? p.food_pairing : (p.food || []),
    }));
    const el = document.getElementById('listingCount');
    if (el) el.textContent = `${products.length} sản phẩm`;
    container.innerHTML = products.map(p => productCardHTML(p)).join('');
    attachProductCardEvents();
  });
}


function productCardHTML(p) {
  const isWishlisted = state.wishlist.includes(p.id);
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-card__img-wrap">
      <img class="product-card__img" src="${p.img}" alt="${p.name}" onerror="this.src='images/placeholder.jpg'">
      ${p.badge ? `<div class="product-card__badge"><span class="badge badge--gold">${p.badge}</span></div>` : ''}
      <button class="product-card__wishlist ${isWishlisted ? 'active' : ''}" data-wish="${p.id}" title="Thêm yêu thích">
        ${isWishlisted ? '♥' : '♡'}
      </button>
      <div class="product-card__actions">
        <button class="btn btn--primary btn--sm" data-add="${p.id}">🛒 Thêm vào giỏ</button>
        <button class="btn btn--outline btn--sm" data-detail="${p.id}">Chi tiết</button>
      </div>
    </div>
    <div class="product-card__info">
      <div class="product-card__region">${getFlag(p.region)}${p.region} ${p.subregion ? `· ${p.subregion}` : ''}</div>
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__vintage">${p.vintage ? `Vintage ${p.vintage}` : ''} ${p.grape ? `· ${p.grape}` : ''} · ${p.volume}</div>
      <div class="product-card__footer">
        <div>
          <div class="product-card__price" data-price="${p.price}">${formatPrice(p.price)}</div>
          ${p.oldPrice ? `<div class="product-card__price-old" data-price="${p.oldPrice}">${formatPrice(p.oldPrice)}</div>` : ''}
        </div>
        <div class="product-card__rating">★ ${p.rating} <span style="color:var(--c-muted)">(${p.reviews})</span></div>
      </div>
    </div>
  </div>`;
}

function attachProductCardEvents() {
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(+btn.dataset.add); });
  });
  document.querySelectorAll('[data-detail]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); navigate('product-detail', { id: +btn.dataset.detail }); });
  });
  document.querySelectorAll('[data-wish]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = +btn.dataset.wish;
      if (state.wishlist.includes(id)) {
        state.wishlist.splice(state.wishlist.indexOf(id), 1);
        btn.classList.remove('active'); btn.textContent = '♡';
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
      } else {
        state.wishlist.push(id);
        btn.classList.add('active'); btn.textContent = '♥';
        showToast('Đã thêm vào danh sách yêu thích 💛', 'success');
      }
      saveState();
    });
  });
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) navigate('product-detail', { id: +card.dataset.id });
    });
  });
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────
function renderProductDetail(id) {
  const container = document.getElementById('productDetailContent');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--c-muted)">⏳ Đang tải...</div>';
  // Thử API trước, fallback PRODUCTS tĩnh
  const apiPromise = (typeof window.VINOVA_API !== 'undefined')
    ? window.VINOVA_API.products.get(id).then(d => ({ ...d.product, reviews_list: d.reviews }))
    : Promise.reject();
  apiPromise.catch(() => PRODUCTS.find(x => x.id === id)).then(p => {
    if (!p) { container.innerHTML = '<div style="padding:2rem">Không tìm thấy sản phẩm</div>'; return; }
    // Normalize
    p = {
      ...p, oldPrice: p.oldPrice ?? p.old_price, reviews: p.reviews ?? p.reviews_count,
      tasting: p.tasting || { color: p.tasting_notes?.[0] || '', nose: p.tasting_notes?.[1] || '', palate: p.tasting_notes?.[2] || '', finish: '' },
      food: Array.isArray(p.food_pairing) ? p.food_pairing : (p.food || [])
    };
    if (typeof window.trackProductView === 'function') window.trackProductView(p);
    if (typeof window.saveProductViewToFirestore === 'function') window.saveProductViewToFirestore(p);


    const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating));

    container.innerHTML = `
  <div class="product-detail animate-up">
    <!-- Gallery -->
    <div class="product-gallery">
      <div class="gallery-main">
        <img src="${p.img}" alt="${p.name}" id="galleryMain" onerror="this.src='images/placeholder.jpg'">
      </div>
      <div class="gallery-thumbs">
        ${[p.img, p.img, p.img].map((img, i) => `
          <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchThumb(this,'${img}')">
            <img src="${img}" alt="" onerror="this.src='images/placeholder.jpg'">
          </div>`).join('')}
      </div>
    </div>
    <!-- Info -->
    <div class="product-info">
      <div class="product-info__breadcrumb">
        <span style="cursor:pointer;color:var(--c-gold)" onclick="navigate('home')">Trang chủ</span>
        <span>›</span>
        <span style="cursor:pointer;color:var(--c-gold)" onclick="navigate('products')">Sản phẩm</span>
        <span>›</span>
        <span>${p.name}</span>
      </div>
      <div class="product-info__brand">${getFlag(p.region)}${p.region} · ${p.subregion || ''}</div>
      <h1 class="product-info__title">${p.name}</h1>
      <div class="product-info__rating">
        <div class="stars">${stars}</div>
        <span class="review-count">${p.reviews} đánh giá</span>
        ${p.score ? `<div class="score-badge">${p.score}</div>` : ''}
        <span class="badge badge--red">RP Score</span>
      </div>
      <div class="product-info__meta">
        ${p.vintage ? `<div class="meta-item"><div class="meta-item__label">Vintage</div><div class="meta-item__value">${p.vintage}</div></div>` : ''}
        <div class="meta-item"><div class="meta-item__label">Nồng độ</div><div class="meta-item__value">${p.abv}%</div></div>
        <div class="meta-item"><div class="meta-item__label">Dung tích</div><div class="meta-item__value">${p.volume}</div></div>
        ${p.grape ? `<div class="meta-item"><div class="meta-item__label">Giống nho</div><div class="meta-item__value" style="font-size:.8rem">${p.grape}</div></div>` : ''}
        <div class="meta-item"><div class="meta-item__label">Tồn kho</div><div class="meta-item__value" style="color:${p.stock < 10 ? '#e88a8a' : 'var(--c-success)'}">${p.stock < 10 ? `⚠ ${p.stock} chai` : `✓ Còn hàng`}</div></div>
      </div>
      <div class="product-info__price">
        <span class="price-main" data-price="${p.price}">${formatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old" data-price="${p.oldPrice}">${formatPrice(p.oldPrice)}</span>` : ''}
        ${p.oldPrice ? `<span class="badge badge--red">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ''}
      </div>
      <div class="variant-selector">
        <div class="variant-selector__label">Dung tích</div>
        <div class="variant-options">
          <button class="variant-btn active">750ml</button>
          <button class="variant-btn">1.5L Magnum</button>
          <button class="variant-btn">Thùng 6 chai</button>
        </div>
      </div>
      <div class="qty-selector">
        <button class="qty-btn" id="qtyMinus">−</button>
        <span class="qty-value" id="qtyVal">1</span>
        <button class="qty-btn" id="qtyPlus">+</button>
        <span style="font-size:.82rem;color:var(--c-muted);margin-left:.5rem">Tối đa ${p.stock} chai</span>
      </div>
      <div style="display:flex;gap:.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <button class="btn btn--primary btn--lg" style="flex:1;min-width:180px" onclick="addToCart(${p.id},+document.getElementById('qtyVal').textContent)">🛒 Thêm vào giỏ hàng</button>
        <button class="btn btn--outline" onclick="toggleWishlist(${p.id},this)">
          ${state.wishlist.includes(p.id) ? '♥ Đã yêu thích' : '♡ Yêu thích'}
        </button>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem">
        <span class="badge badge--muted">🔒 Thanh toán an toàn</span>
        <span class="badge badge--muted">🚚 Giao hàng toàn quốc</span>
        <span class="badge badge--muted">🌡 Bảo quản nhiệt độ</span>
        <span class="badge badge--muted">✍ Yêu cầu CMND khi nhận</span>
      </div>
      <!-- Tabs -->
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tasting">Hương vị</button>
        <button class="tab-btn" data-tab="pairing">Món ăn kèm</button>
        <button class="tab-btn" data-tab="delivery">Vận chuyển</button>
        <button class="tab-btn" data-tab="reviews">Đánh giá</button>
      </div>
      <div class="tab-content active" id="tab-tasting">
        <div class="tasting-notes">
          <div class="tasting-note"><div class="tasting-note__icon">👁</div><div class="tasting-note__label">Màu sắc</div><div class="tasting-note__value">${p.tasting.color}</div></div>
          <div class="tasting-note"><div class="tasting-note__icon">👃</div><div class="tasting-note__label">Mùi hương</div><div class="tasting-note__value">${p.tasting.nose}</div></div>
          <div class="tasting-note"><div class="tasting-note__icon">👅</div><div class="tasting-note__label">Vị</div><div class="tasting-note__value">${p.tasting.palate}</div></div>
        </div>
        <div style="margin-top:1rem;padding:1rem;background:var(--c-surface2);border-radius:var(--radius-sm)">
          <div style="font-size:.8rem;color:var(--c-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem">Aftertaste</div>
          <div style="font-size:.92rem">${p.tasting.finish}</div>
        </div>
      </div>
      <div class="tab-content" id="tab-pairing">
        <div style="display:flex;flex-wrap:wrap;gap:.5rem">
          ${p.food.map(f => `<span class="badge badge--gold" style="font-size:.85rem;padding:.4rem .9rem">🍽 ${f}</span>`).join('')}
        </div>
      </div>
      <div class="tab-content" id="tab-delivery">
        <div style="display:flex;flex-direction:column;gap:.75rem;font-size:.9rem">
          <div>🚚 <strong>Giao hàng nhanh:</strong> 2-4 giờ (Nội thành HCM/HN) — Phí ${formatPrice(50000)}</div>
          <div>📦 <strong>Giao hàng tiêu chuẩn:</strong> 1-3 ngày (Toàn quốc) — Phí ${formatPrice(30000)}</div>
          <div>🌡 <strong>Bảo quản nhiệt độ:</strong> Xe lạnh chuyên dụng 10-15°C</div>
          <div>✍ <strong>Xác minh danh tính:</strong> Người nhận phải xuất trình CMND/CCCD (18+)</div>
          <div>🚫 <strong>Không giao đến:</strong> Các khu vực cấm bán rượu theo quy định địa phương</div>
        </div>
      </div>
      <div class="tab-content" id="tab-reviews">
        ${generateReviewsHTML(p)}
      </div>
    </div>
  </div>`;

    // Qty controls
    let qty = 1;
    document.getElementById('qtyMinus')?.addEventListener('click', () => { if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; } });
    document.getElementById('qtyPlus')?.addEventListener('click', () => { if (qty < p.stock) { qty++; document.getElementById('qtyVal').textContent = qty; } });

    // Tabs
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
      });
    });
    // Variant buttons
    container.querySelectorAll('.variant-btn').forEach(btn => {
      btn.addEventListener('click', () => { container.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); });
    });
  }); // đóng apiPromise.catch(...).then(p => { ... })
}

window.switchThumb = (el, src) => {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const main = document.getElementById('galleryMain');
  if (main) main.src = src;
};
window.toggleWishlist = async (id, btn) => {
  const token = localStorage.getItem('vinova_token');
  const hasApi = token && typeof window.VINOVA_API !== 'undefined';

  if (state.wishlist.includes(id)) {
    if (hasApi) {
      try {
        await window.VINOVA_API.users.removeWishlist(id);
        state.wishlist.splice(state.wishlist.indexOf(id), 1);
        btn.textContent = '♡ Yêu thích'; showToast('Đã xóa khỏi yêu thích', 'info');
      } catch (err) { showToast(err.message, 'error'); }
      return;
    }
    state.wishlist.splice(state.wishlist.indexOf(id), 1);
    btn.textContent = '♡ Yêu thích'; showToast('Đã xóa khỏi yêu thích', 'info');
  } else {
    if (hasApi) {
      try {
        await window.VINOVA_API.users.addWishlist(id);
        state.wishlist.push(id); btn.textContent = '♥ Đã yêu thích'; showToast('Đã thêm vào yêu thích 💛', 'success');
      } catch (err) { showToast(err.message, 'error'); }
      return;
    }
    state.wishlist.push(id); btn.textContent = '♥ Đã yêu thích'; showToast('Đã thêm vào yêu thích 💛', 'success');
  }
  saveState();
};

function generateReviewsHTML(p) {
  let reviews = [];
  if (p.reviews_list && p.reviews_list.length > 0) {
    reviews = p.reviews_list.map(r => ({
      name: r.full_name || 'Khách hàng',
      rating: r.rating,
      comment: r.comment || '',
      date: new Date(r.created_at).toLocaleDateString('vi-VN')
    }));
  } else {
    // Static fallback
    reviews = [
      { name: 'Nguyễn Văn A', rating: 5, comment: 'Rượu tuyệt vời, hương vị phức hợp và dư vị rất dài. Sẽ mua lại!', date: '15/01/2025' },
      { name: 'Trần Thị B', rating: 5, comment: 'Đóng gói cẩn thận, giao hàng đúng nhiệt độ. Món quà hoàn hảo cho sếp!', date: '12/01/2025' },
      { name: 'Lê Minh C', rating: 4, comment: 'Chất lượng xứng đáng với giá tiền. Khá cao cấp.', date: '08/01/2025' },
    ];
  }
  return `<div style="display:flex;flex-direction:column;gap:1.25rem">
    ${reviews.map(r => `<div style="padding:1rem;background:var(--c-surface2);border-radius:var(--radius-sm)">
      <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
        <strong>${r.name}</strong><span style="color:var(--c-muted);font-size:.8rem">${r.date}</span>
      </div>
      <div style="color:var(--c-gold);margin-bottom:.4rem">${'★'.repeat(r.rating)}</div>
      <div style="font-size:.9rem;color:var(--c-muted)">${r.comment}</div>
    </div>`).join('')}
  </div>`;
}

// ─── CART ─────────────────────────────────────────────────────
function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id) || { id, name: 'Sản phẩm', stock: 99, price: 0, img: '', volume: '750ml' };
  const token = localStorage.getItem('vinova_token');
  if (token && typeof window.VINOVA_API !== 'undefined') {
    window.VINOVA_API.cart.add(id, qty)
      .then(() => {
        showToast(`Đã thêm vào giỏ hàng! 🛒`, 'success');
        updateCartBadge();
        if (state.page === 'cart') renderCart();
        if (typeof window.trackAddToCart === 'function') window.trackAddToCart(p, qty);
      })
      .catch(err => showToast(err.message || 'Không thể thêm vào giỏ hàng', 'error'));
    return;
  }
  // Guest fallback → localStorage
  const existing = state.cart.find(i => i.id === id);
  if (existing) existing.qty = Math.min(existing.qty + qty, p.stock);
  else state.cart.push({ id, productId: id, qty, name: p.name, price: p.price, img: p.img, volume: p.volume });
  saveState(); updateCartBadge();
  showToast(`Đã thêm ${p.name} vào giỏ hàng`, 'success');
  if (typeof window.trackAddToCart === 'function') window.trackAddToCart(p, qty);
  if (state.page === 'cart') renderCart();
}


function renderCart() {
  const container = document.getElementById('cartItems');
  const emptyMsg = document.getElementById('cartEmpty');
  if (!container) return;
  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    updateOrderSummary();
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';
  container.innerHTML = state.cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return `<div class="cart-item" data-cart-id="${item.id}">
      <img class="cart-item__img" src="${item.img}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__meta">${item.volume} · ${getFlag(p?.region)}${p?.region || ''}</div>
        <div class="cart-item__actions">
          <button class="qty-btn" onclick="changeCartQty(${item.id},-1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeCartQty(${item.id},1)">+</button>
          <button class="btn btn--sm" style="color:var(--c-error);background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2)" onclick="removeFromCart(${item.id})">✕ Xóa</button>
        </div>
      </div>
      <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
    </div>`;
  }).join('');
  updateOrderSummary();
}

window.changeCartQty = async (id, delta) => {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  const newQty = Math.max(1, item.qty + delta);

  const token = localStorage.getItem('vinova_token');
  if (token && typeof window.VINOVA_API !== 'undefined') {
    try {
      await window.VINOVA_API.cart.update(id, newQty);
      item.qty = newQty;
      renderCart();
      updateCartBadge();
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật số lượng', 'error');
    }
    return;
  }

  item.qty = newQty;
  saveState(); renderCart();
};
window.removeFromCart = async (id) => {
  const token = localStorage.getItem('vinova_token');
  if (token && typeof window.VINOVA_API !== 'undefined') {
    try {
      await window.VINOVA_API.cart.remove(id);
      state.cart = state.cart.filter(i => i.id !== id);
      renderCart();
      updateCartBadge();
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
    } catch (err) {
      showToast(err.message || 'Không thể xóa sản phẩm', 'error');
    }
    return;
  }

  state.cart = state.cart.filter(i => i.id !== id);
  saveState(); updateCartBadge(); renderCart();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
};

function cartTotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateOrderSummary() {
  const subtotal = cartTotal();
  const shipping = subtotal > 5000000 ? 0 : 50000;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('summarySubtotal', formatPrice(subtotal));
  set('summaryShipping', shipping === 0 ? 'Miễn phí' : formatPrice(shipping));
  set('summaryTax', formatPrice(tax));
  set('summaryTotal', formatPrice(total));
}

// ─── CHECKOUT ─────────────────────────────────────────────────
function renderCheckout() {
  updateOrderSummary();
  goToCheckoutStep(1);
}

function goToCheckoutStep(step) {
  state.checkoutStep = step;
  document.querySelectorAll('.checkout-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < step) s.classList.add('done');
    else if (i + 1 === step) s.classList.add('active');
  });
  document.querySelectorAll('.checkout-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === step);
  });
}

window.nextCheckoutStep = () => {
  if (state.checkoutStep < 4) goToCheckoutStep(state.checkoutStep + 1);
  if (state.checkoutStep === 4) { completeOrder(); }
};
window.prevCheckoutStep = () => { if (state.checkoutStep > 1) goToCheckoutStep(state.checkoutStep - 1); };

async function completeOrder() {
  const total = cartTotal();
  const token = localStorage.getItem('vinova_token');

  if (token && typeof window.VINOVA_API !== 'undefined' && state.cart.length > 0) {
    const items = state.cart.map(i => ({
      productId: i.id || i.product_id || i.productId,
      name: i.name, qty: i.qty, price: i.price, img: i.img, volume: i.volume || '750ml'
    }));
    const address = {
      name: document.getElementById('checkoutName')?.value || state.user?.full_name || 'Khách hàng',
      phone: document.getElementById('checkoutPhone')?.value || '0900000000',
      street: document.getElementById('checkoutAddress')?.value || '123 Đường ABC',
      district: document.getElementById('checkoutDistrict')?.value || 'Quận 1',
      city: document.getElementById('checkoutCity')?.value || 'TP. Hồ Chí Minh',
    };
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
    const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'standard';
    const giftWrap = document.getElementById('giftWrap')?.checked || false;
    try {
      showToast('Đang tạo đơn hàng...', 'info');
      const orderRes = await window.VINOVA_API.orders.create({
        items, address, paymentMethod, shippingMethod, giftWrap,
        total, shippingFee: total > 5000000 ? 0 : 50000, tax: Math.round(total * 0.1),
      });
      const orderId = orderRes.order_id;
      if (typeof window.trackPurchase === 'function') window.trackPurchase(orderId, total, items);
      if (paymentMethod === 'vnpay') {
        const r = await window.VINOVA_API.payments.vnpay(orderId);
        if (r.payment_url) { window.location.href = r.payment_url; return; }
      } else if (paymentMethod === 'momo') {
        const r = await window.VINOVA_API.payments.momo(orderId);
        if (r.payment_url) { window.location.href = r.payment_url; return; }
      }
      state.cart = []; saveState(); updateCartBadge();
      goToCheckoutStep(4);
      const el = document.getElementById('orderConfirmId');
      if (el) el.textContent = `#${orderId}`;
      showToast('🎉 Đơn hàng đã đặt thành công!', 'success', 5000);
      return;
    } catch (err) {
      showToast(err.message || 'Lỗi đặt hàng, vui lòng thử lại', 'error');
      return;
    }
  }

  // Guest fallback
  const orderId = `VNV-${Date.now()}`;
  const items = state.cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }));
  if (typeof window.trackPurchase === 'function') window.trackPurchase(orderId, total, items);
  if (typeof window.saveOrderToFirestore === 'function') window.saveOrderToFirestore({ orderId, total, items, currency: state.currency, user: 'guest' });
  state.cart = []; saveState(); updateCartBadge();
  goToCheckoutStep(4);
  showToast('🎉 Đơn hàng đã được đặt thành công!', 'success', 5000);
}


// ─── ACCOUNT ──────────────────────────────────────────────────
function renderAccount() {
  const user = state.user || JSON.parse(localStorage.getItem('vinova_user') || 'null');
  const container = document.getElementById('accountContent');
  if (!container) return;
  if (!user) {
    container.innerHTML = `<div style="text-align:center;padding:3rem">
      <div style="font-size:3rem;margin-bottom:1rem">🍷</div>
      <h3>Vui lòng đăng nhập để xem tài khoản</h3>
      <button class="btn btn--primary" style="margin-top:1rem" onclick="document.querySelector('.btn--outline').click()">Đăng nhập</button>
    </div>`;
    return;
  }

  if (typeof window.VINOVA_API !== 'undefined') {
    window.VINOVA_API.users.profile().then(data => {
      if (data.user) {
        Object.assign(user, data.user);
        state.user = user;
        localStorage.setItem('vinova_user', JSON.stringify(user));
        renderAccountInfo(user, container);
      }
    }).catch(() => renderAccountInfo(user, container));
  } else {
    renderAccountInfo(user, container);
  }
}

function renderAccountInfo(user, container) {
  const tierColor = { silver: '#aaa', gold: '#c9a84c', platinum: '#5ce8e8' }[user.tier] || '#aaa';
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:260px 1fr;gap:2rem;align-items:start">
      <!-- Sidebar -->
      <div class="card animate-up">
        <div class="card__body" style="text-align:center;padding:2rem">
          <div
            style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--c-gold),var(--c-red-wine));display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1rem;color:#fff;font-weight:700">
            ${(user.full_name || '?')[0].toUpperCase()}</div>
          <div style="font-weight:600;font-size:1.05rem">${user.full_name || 'Khách hàng'}</div>
          <div style="font-size:.82rem;color:var(--c-muted)">${user.email || ''}</div>
          <div style="margin:.75rem 0"><span style="color:${tierColor};padding:.2rem .65rem;border-radius:999px;border:1px solid ${tierColor}50;font-size:.72rem;font-weight:600;text-transform:uppercase;background:${tierColor}15">★ Thành viên ${user.tier || 'Silver'}</span></div>
          <div style="font-size:.8rem;color:var(--c-muted)">Điểm tích lũy: <strong style="color:var(--c-gold)">${(user.points || 0).toLocaleString()} points</strong></div>
        </div>
        <div class="card__footer" style="display:flex;flex-direction:column;gap:0" id="accountSidebar">
          <button class="admin-nav-item active" data-section="orders">📋 Đơn hàng của tôi</button>
          <button class="admin-nav-item" data-section="wishlist">♡ Danh sách yêu thích</button>
          <button class="admin-nav-item" data-section="address">📍 Địa chỉ giao hàng</button>
          <button class="admin-nav-item" data-section="notifications">🔔 Thông báo</button>
          <button class="admin-nav-item" onclick="navigate('wine-club')">★ Wine Club</button>
          <button class="admin-nav-item" data-section="settings">⚙ Cài đặt tài khoản</button>
          <button class="admin-nav-item" style="color:var(--c-error)" onclick="window.closeLoginModal();window.dispatchEvent(new CustomEvent('auth:logout'));">→ Đăng xuất</button>
        </div>
      </div>
      <!-- Content -->
      <div id="accountContentArea" class="animate-up" style="display:flex;flex-direction:column;gap:1.5rem">
        <!-- Orders -->
        <div class="account-section" id="account-orders">
          <h2 class="serif" style="margin-bottom:1.5rem">📋 Đơn hàng của tôi</h2>
          <div id="orderHistorySection"><div style="text-align:center;padding:2rem;color:var(--c-muted)">⏳ Đang tải lịch sử đơn hàng...</div></div>
        </div>
        <!-- Wishlist -->
        <div class="account-section hidden" id="account-wishlist">
          <h2 class="serif" style="margin-bottom:1.5rem">♡ Danh sách yêu thích</h2>
          <div style="text-align:center;padding:3rem;background:var(--c-surface1);border-radius:var(--radius);border:1px dashed var(--c-border);color:var(--c-muted)">
            <div style="font-size:2rem;margin-bottom:1rem">💔</div>
            Bạn chưa có sản phẩm yêu thích nào.
          </div>
        </div>
        <!-- Address -->
        <div class="account-section hidden" id="account-address">
          <h2 class="serif" style="margin-bottom:1.5rem">📍 Địa chỉ giao hàng</h2>
           <div style="padding:1.5rem;background:var(--c-surface1);border-radius:var(--radius);border:1px solid var(--c-border)">
             <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
                <div>
                  <div style="font-weight:600">${user.full_name || 'Khách hàng'} <span class="badge badge--green" style="margin-left:.5rem">Mặc định</span></div>
                  <div style="font-size:.85rem;color:var(--c-muted);margin-top:.4rem">0912 345 678</div>
                  <div style="font-size:.85rem;color:var(--c-muted);margin-top:.2rem">123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</div>
                </div>
                <button class="btn btn--outline btn--sm">Sửa</button>
             </div>
             <button class="btn btn--outline" style="width:100%">+ Thêm địa chỉ mới</button>
           </div>
        </div>
        <!-- Notifications -->
        <div class="account-section hidden" id="account-notifications">
          <h2 class="serif" style="margin-bottom:1.5rem">🔔 Thông báo</h2>
          <div style="text-align:center;padding:3rem;background:var(--c-surface1);border-radius:var(--radius);border:1px dashed var(--c-border);color:var(--c-muted)">
            <div style="font-size:2rem;margin-bottom:1rem">🔕</div>
            Bạn không có thông báo mới.
          </div>
        </div>
        <!-- Settings -->
        <div class="account-section hidden" id="account-settings">
          <h2 class="serif" style="margin-bottom:1.5rem">⚙ Cài đặt tài khoản</h2>
          <div style="display:flex;flex-direction:column;gap:1.5rem">
            <div class="input-row">
              <div class="input-group">
                 <label>Họ và tên</label>
                 <input class="input" value="${user.full_name || ''}">
              </div>
              <div class="input-group">
                 <label>Số điện thoại</label>
                 <input class="input" value="0912 345 678">
              </div>
            </div>
            <div class="input-group">
               <label>Email</label>
               <input class="input" value="${user.email || ''}" disabled style="opacity:0.7">
               <div style="font-size:.75rem;color:var(--c-muted);margin-top:.4rem">Email không thể thay đổi sau khi đăng ký.</div>
            </div>
            <button class="btn btn--primary" style="align-self:flex-start" onclick="showToast('Đã lưu thay đổi thông tin!','success')">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </div>`;

  // Attach event listeners for tabs
  const sidebarButtons = document.querySelectorAll('#accountSidebar .admin-nav-item[data-section]');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sectionId = 'account-' + btn.dataset.section;
      document.querySelectorAll('#accountContentArea .account-section').forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== sectionId);
      });
    });
  });

  if (typeof window.VINOVA_API !== 'undefined') {
    window.VINOVA_API.orders.list().then(data => {
      const orders = data.orders || [];
      const el = document.getElementById('orderHistorySection');
      if (!el) return;
      if (!orders.length) { el.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--c-muted)">Chưa có đơn hàng nào</div>'; return; }
      const sLabel = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
      const sColor = { pending: '#f39c12', confirmed: '#3498db', shipping: '#9b59b6', completed: '#27ae60', cancelled: '#e74c3c' };
      el.innerHTML = orders.map(o => `<div style="padding:1.25rem;background:var(--c-surface1);border-radius:var(--radius-sm);border:1px solid var(--c-border);margin-bottom:.75rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
          <div><div style="font-weight:600;font-size:1.1rem">#${o.id} <span style="font-size:.8rem;color:var(--c-muted);font-weight:400;margin-left:.75rem">· ${new Date(o.created_at).toLocaleDateString('vi-VN')}</span></div>
          <div style="font-size:.85rem;color:var(--c-muted);margin-top:.4rem">${o.item_names || 'Sản phẩm rượu vang cao cấp'}</div></div>
          <div style="text-align:right"><div style="font-weight:700;color:var(--c-gold);font-size:1.1rem">${(o.total || 0).toLocaleString('vi-VN')}₫</div>
          <div style="font-size:.8rem;margin-top:.4rem;padding:.2rem .6rem;border-radius:99px;display:inline-block;background:${sColor[o.status]}15;color:${sColor[o.status]};font-weight:600">${sLabel[o.status] || o.status}</div></div>
        </div>`).join('');
    }).catch(() => {
      const el = document.getElementById('orderHistorySection');
      if (el) el.innerHTML = '<div style="color:var(--c-error);font-size:.85rem;padding:1rem;text-align:center">Không thể tải lịch sử đơn hàng. Hoặc hệ thống đang bảo trì.</div>';
    });
  }
}

// ─── ADMIN ────────────────────────────────────────────────────
function renderAdmin() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section;
      document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('hidden', s.id !== `admin-${section}`));
    });
  });
  renderCharts();
}

function renderCharts() {
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const revenue = [120, 145, 208, 189, 260, 310, 285, 340, 295, 380, 420, 510];
  const maxVal = Math.max(...revenue);
  const chart = document.getElementById('revenueChart');
  if (!chart) return;
  chart.innerHTML = `<div class="chart-bar-wrap">${months.map((m, i) => `
    <div class="chart-bar-col">
      <div class="chart-bar" style="height:${(revenue[i] / maxVal) * 180}px;background:linear-gradient(to top,var(--c-red-wine),var(--c-gold))" title="${revenue[i]}M"></div>
      <div class="chart-label">${m}</div>
    </div>`).join('')}</div>`;
}

// ─── WINE CLUB ────────────────────────────────────────────────
function renderWineClub() { /* static content */ }

// ─── FILTER EVENTS ────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-option input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const cat = cb.dataset.filter, val = cb.value;
      if (!state.filters[cat]) state.filters[cat] = [];
      if (cb.checked) { if (!state.filters[cat].includes(val)) state.filters[cat].push(val); }
      else { state.filters[cat] = state.filters[cat].filter(v => v !== val); }
      if (state.page === 'products') renderProductListing();
    });
  });
  document.getElementById('sortSelect')?.addEventListener('change', () => {
    if (state.page === 'products') renderProductListing();
  });
  document.getElementById('filterMobileBtn')?.addEventListener('click', () => {
    document.querySelector('.filter-sidebar')?.classList.toggle('open');
  });
}

// ─── SEARCH ───────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;
  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = input.value.trim();
    if (!q) { results.classList.add('hidden'); return; }
    searchTimer = setTimeout(async () => {
      let matched = [];
      if (typeof window.VINOVA_API !== 'undefined') {
        try {
          const data = await window.VINOVA_API.products.search(q);
          matched = (data.products || []).map(p => ({ ...p, oldPrice: p.old_price }));
        } catch { /* fallback */ }
      }
      if (!matched.length) {
        const ql = q.toLowerCase();
        matched = PRODUCTS.filter(p => p.name.toLowerCase().includes(ql) || p.region.toLowerCase().includes(ql) || (p.grape || '').toLowerCase().includes(ql)).slice(0, 5);
      }
      if (!matched.length) { results.innerHTML = `<div style="padding:1rem;color:var(--c-muted);font-size:.88rem">Không tìm thấy kết quả</div>`; }
      else results.innerHTML = matched.slice(0, 5).map(p => `
        <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;cursor:pointer;transition:background .2s;border-bottom:1px solid var(--c-border)" onmouseover="this.style.background='var(--c-surface2)'" onmouseout="this.style.background=''" onclick="navigate('product-detail',{id:${p.id}});document.getElementById('searchResults').classList.add('hidden');document.getElementById('searchInput').value=''">
          <img src="${p.img}" style="width:36px;height:48px;object-fit:cover;border-radius:4px" onerror="this.src='images/placeholder.jpg'">
          <div><div style="font-size:.88rem;font-weight:500">${p.name}</div><div style="font-size:.75rem;color:var(--c-muted)">${p.region} · ${formatPrice(p.price)}</div></div>
        </div>`).join('');
      results.classList.remove('hidden');
    }, 300);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrap')) results.classList.add('hidden'); });
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAgeGate();
  initNav();
  initFilters();
  initSearch();
  updateCartBadge();
  // Render featured products on homepage
  const featuredContainer = document.getElementById('featuredProducts');
  if (featuredContainer) {
    const loadFeatured = (typeof window.VINOVA_API !== 'undefined')
      ? window.VINOVA_API.products.list({ sort: 'rating', limit: 4 })
        .then(d => d.products.map(p => ({ ...p, oldPrice: p.old_price, reviews: p.reviews_count, tasting: { color: '', nose: '', palate: '', finish: '' }, food: p.food_pairing || [] })))
      : Promise.reject();
    loadFeatured.catch(() => PRODUCTS.slice(0, 4)).then(products => {
      featuredContainer.innerHTML = products.map(p => productCardHTML(p)).join('');
      attachProductCardEvents();
    });
  }
  // Navigate to hash page
  const hash = window.location.hash.replace('#', '') || 'home';
  navigate(['home', 'products', 'cart', 'checkout', 'account', 'wine-club', 'admin', 'product-detail'].includes(hash) ? hash : 'home');
  console.log('%cVINOVA Premium Wine & Spirits', 'color:#c9a84c;font-size:1.2rem;font-weight:bold');
});

