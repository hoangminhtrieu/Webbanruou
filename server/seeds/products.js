// ============================================================
// Seed Products — 8 sản phẩm demo
// ============================================================
const { getDB, initDB, transaction } = require('../config/database');

const products = [
    {
        name: 'Château Lafite Rothschild', region: 'Pháp', subregion: 'Bordeaux', type: 'red',
        grape: 'Cabernet Sauvignon', abv: 13.5, volume: '750ml',
        price: 18500000, old_price: 21000000, stock: 12, score: 98, rating: 4.9,
        reviews_count: 234, vintage: 2018, badge: 'Best Seller',
        img: 'images/red_wine.jpg',
        description: 'Một trong những rượu vang danh tiếng nhất thế giới từ Pháp.',
        tasting_notes: JSON.stringify({ color: 'Đỏ rubis sâu', nose: 'Cassis, hương gỗ sồi, hoa violets', palate: 'Tannic mịn, thanh lịch, phức hợp', finish: 'Dài >90 giây' }),
        food_pairing: JSON.stringify(['Bò bít tết', 'Thịt cừu nướng', 'Pho mát cứng']),
        tags: JSON.stringify(['premium', 'collection', 'gift']),
    },
    {
        name: 'Domaine de la Romanée-Conti', region: 'Pháp', subregion: 'Burgundy', type: 'red',
        grape: 'Pinot Noir', abv: 13.0, volume: '750ml',
        price: 95000000, old_price: null, stock: 3, score: 100, rating: 5.0,
        reviews_count: 48, vintage: 2017, badge: 'Hiếm',
        img: 'images/white_wine.jpg',
        description: 'Chai rượu hoàn hảo nhất từ vùng Burgundy, Pháp.',
        tasting_notes: JSON.stringify({ color: 'Đỏ garnet trong suốt', nose: 'Cherry đỏ, hoa hồng, đất quý', palate: 'Tinh tế, phức hợp phi thường', finish: '>2 phút' }),
        food_pairing: JSON.stringify(['Phô mai Comté', 'Nấm truffle', 'Cá hồi hun khói']),
        tags: JSON.stringify(['luxury', 'rare', 'collection']),
    },
    {
        name: 'Opus One Reserve', region: 'Mỹ', subregion: 'Napa Valley', type: 'red',
        grape: 'Cabernet Sauvignon blend', abv: 14.5, volume: '750ml',
        price: 12800000, old_price: 14500000, stock: 24, score: 96, rating: 4.8,
        reviews_count: 187, vintage: 2019, badge: 'Mới về',
        img: 'images/red_wine.jpg',
        description: 'Kiệt tác của Napa Valley, sự kết hợp giữa Mỹ và Pháp.',
        tasting_notes: JSON.stringify({ color: 'Đỏ tím đậm', nose: 'Mứt mận, chocolate đen, vanilla', palate: 'Dày dặn, mượt mà', finish: 'Dài ấm áp' }),
        food_pairing: JSON.stringify(['Sườn bò nướng BBQ', 'Xốt nấm rừng', 'Phô mai cheddar']),
        tags: JSON.stringify(['premium', 'new']),
    },
    {
        name: 'Dom Pérignon Vintage', region: 'Pháp', subregion: 'Champagne', type: 'sparkling',
        grape: 'Chardonnay / Pinot Noir', abv: 12.5, volume: '750ml',
        price: 7200000, old_price: 8500000, stock: 36, score: 97, rating: 4.9,
        reviews_count: 312, vintage: 2013, badge: 'Sale 15%',
        img: 'images/white_wine.jpg',
        description: 'Champagne danh tiếng nhất thế giới, biểu tượng của sự sang trọng.',
        tasting_notes: JSON.stringify({ color: 'Vàng rơm óng ánh', nose: 'Bánh mì nướng, chanh vàng, acacia', palate: 'Sủi bọt mịn, tinh tế', finish: 'Tươi mát dài' }),
        food_pairing: JSON.stringify(['Hải sản tươi', 'Oyster', 'Caviar', 'Sashimi']),
        tags: JSON.stringify(['champagne', 'gift', 'celebration']),
    },
    {
        name: 'Macallan 25 Year Sherry Oak', region: 'Scotland', subregion: 'Speyside', type: 'whisky',
        grape: null, abv: 43.0, volume: '700ml',
        price: 52000000, old_price: null, stock: 5, score: 95, rating: 4.9,
        reviews_count: 89, vintage: null, badge: 'Siêu hiếm',
        img: 'images/red_wine.jpg',
        description: '25 năm ủ trong thùng Sherry, biểu tượng của whisky Scotland.',
        tasting_notes: JSON.stringify({ color: 'Amber vàng tươi', nose: 'Sherry ngọt, vanilla, gừng', palate: 'Mịn như nhung, phong phú', finish: 'Rất dài ấm áp' }),
        food_pairing: JSON.stringify(['Chocolate đen', 'Cigar Cuba', 'Phô mai cứng']),
        tags: JSON.stringify(['whisky', 'luxury', 'rare']),
    },
    {
        name: 'Sassicaia 2020', region: 'Ý', subregion: 'Bolgheri', type: 'red',
        grape: 'Cabernet Sauvignon', abv: 13.5, volume: '750ml',
        price: 6800000, old_price: 7500000, stock: 30, score: 94, rating: 4.7,
        reviews_count: 156, vintage: 2020, badge: null,
        img: 'images/white_wine.jpg',
        description: 'Super Tuscan huyền thoại, rượu đỏ tuyệt hảo của Ý.',
        tasting_notes: JSON.stringify({ color: 'Đỏ rubis đậm', nose: 'Blackberry, ceder, herbs Địa Trung Hải', palate: 'Đậm đà, cấu trúc tốt', finish: 'Dài và nhất quán' }),
        food_pairing: JSON.stringify(['Pasta thịt bò', 'Pizza thịt nguội', 'Cá ngừ tươi']),
        tags: JSON.stringify(['italian', 'premium']),
    },
    {
        name: 'Cloudy Bay Sauvignon Blanc', region: 'New Zealand', subregion: 'Marlborough', type: 'white',
        grape: 'Sauvignon Blanc', abv: 13.0, volume: '750ml',
        price: 850000, old_price: 1000000, stock: 120, score: 91, rating: 4.5,
        reviews_count: 428, vintage: 2022, badge: 'Bán chạy',
        img: 'images/white_wine.jpg',
        description: 'Vang trắng New Zealand nổi tiếng toàn cầu.',
        tasting_notes: JSON.stringify({ color: 'Vàng nhạt trong suốt', nose: 'Chanh dây, lý chua, cỏ mới cắt', palate: 'Sắc sảo, tươi mát', finish: 'Thanh và sạch' }),
        food_pairing: JSON.stringify(['Gỏi hải sản', 'Sushi', 'Salad rau thơm']),
        tags: JSON.stringify(['white', 'everyday']),
    },
    {
        name: 'Concha y Toro Don Melchor', region: 'Chile', subregion: 'Puente Alto', type: 'red',
        grape: 'Cabernet Sauvignon', abv: 14.5, volume: '750ml',
        price: 2200000, old_price: 2800000, stock: 58, score: 93, rating: 4.6,
        reviews_count: 203, vintage: 2020, badge: 'Combo tiết kiệm',
        img: 'images/red_wine.jpg',
        description: 'Rượu vang Chile cao cấp nhất, cân bằng và phức hợp.',
        tasting_notes: JSON.stringify({ color: 'Đỏ tím thẫm', nose: 'Cassis chín, café espresso, hương gỗ', palate: 'Đầy đặn, cân bằng xuất sắc', finish: 'Dài và tinh tế' }),
        food_pairing: JSON.stringify(['Bò wagyu', 'Lamb chop', 'Dark chocolate']),
        tags: JSON.stringify(['value', 'south-america']),
    },
];


function seed() {
    initDB();
    const db = getDB();

    const insert = db.prepare(`
    INSERT OR IGNORE INTO products
      (name,region,subregion,type,grape,abv,volume,price,old_price,stock,score,rating,reviews_count,vintage,badge,img,description,tasting_notes,food_pairing,tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

    const insertAll = transaction(db, (rows) => {
        rows.forEach(r => {
            insert.run(
                r.name, r.region, r.subregion, r.type, r.grape, r.abv, r.volume,
                r.price, r.old_price, r.stock, r.score, r.rating, r.reviews_count,
                r.vintage, r.badge, r.img, r.description, r.tasting_notes, r.food_pairing, r.tags
            );
        });
    });
    insertAll(products);

    // Seed admin user
    const bcrypt = require('bcryptjs');
    const adminPwd = bcrypt.hashSync('Admin@123', 10);
    db.prepare(`
    INSERT OR IGNORE INTO users (email, password, full_name, role, tier)
    VALUES (?, ?, 'VINOVA Admin', 'admin', 'platinum')
  `).run('admin@vinova.vn', adminPwd);

    console.log(`✅ Seeded ${products.length} products + admin user`);
    console.log('   Email: admin@vinova.vn | Password: Admin@123');
}

seed();
