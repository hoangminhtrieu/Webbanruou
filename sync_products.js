/**
 * Tự động đồng bộ sản phẩm từ app.js sang file seed của backend.
 */
const fs = require("fs");
const path = require("path");

const appJsPath = path.join(__dirname, "app.js");
const seedJsPath = path.join(__dirname, "server", "seeds", "products.js");

const appJsContent = fs.readFileSync(appJsPath, "utf8");

// Trích xuất mảng PRODUCTS từ app.js
const productsMatch = appJsContent.match(/const PRODUCTS = (\[[\s\S]*?\]);/);
if (!productsMatch) {
  console.error("Could not find PRODUCTS array in app.js");
  process.exit(1);
}

// Chúng ta không thể sử dụng JSON.parse một cách đơn giản vì đây là mã JS, không phải JSON (ví dụ: thiếu dấu ngoặc kép ở các thuộc tính, dư dấu phẩy)
// Nhưng chúng ta có thể sử dụng eval một cách an toàn ở đây trong script của mình hoặc dùng regex để làm sạch dữ liệu.
// Cách tốt hơn: sử dụng trích xuất dựa trên regex đơn giản cho từng đối tượng sản phẩm.
const productsText = productsMatch[1];
const productBlocks = productsText.match(/\{[\s\S]*?\}/g);

const transformedProducts = productBlocks.map((block) => {
  // Trích xuất cơ bản các trường bằng regex
  /** Trích xuất giá trị số hoặc boolean */
  const getValue = (key) => {
    const regex = new RegExp(`${key}:\\s*([^,]+),`);
    const match = block.match(regex);
    if (!match) return "null";
    let val = match[1].trim();
    if (val === "null") return "null";
    return val;
  };

  /** Trích xuất đối tượng (object) */
  const getObjectValue = (key) => {
    const regex = new RegExp(
      `${key}:\\s*({[\\s\\S]*?}),\\s*(?:food|tags|stock)`,
    );
    const match = block.match(regex);
    if (!match) return "{}";
    return match[1].trim().replace(/\s+/g, " ");
  };

  /** Trích xuất mảng (array) */
  const getArrayValue = (key) => {
    const regex = new RegExp(`${key}:\\s*(\\[[\\s\\S]*?\\]),`);
    const match = block.match(regex);
    if (!match) return "[]";
    return match[1].trim().replace(/\s+/g, " ");
  };

  /** Trích xuất chuỗi văn bản (string) */
  const getStringValue = (key) => {
    const regex = new RegExp(`${key}:\\s*(".*?"|'.*?'),`);
    const match = block.match(regex);
    if (!match) return "null";
    return match[1].trim();
  };

  return {
    name: getStringValue("name"),
    region: getStringValue("region"),
    subregion: getStringValue("subregion"),
    type: getStringValue("type"),
    grape: getStringValue("grape"),
    abv: getValue("abv"),
    volume: getStringValue("volume"),
    price: getValue("price"),
    old_price: getValue("oldPrice"),
    stock: getValue("stock"),
    score: getValue("score"),
    rating: getValue("rating"),
    reviews_count: getValue("reviews"),
    vintage: getValue("vintage"),
    badge: getStringValue("badge"),
    img: getStringValue("img"),
    description:
      getStringValue("description") === "null"
        ? '""'
        : getStringValue("description"),
    tasting_notes: `JSON.stringify(${getObjectValue("tasting")})`,
    food_pairing: `JSON.stringify(${getArrayValue("food")})`,
    tags: `JSON.stringify(${getArrayValue("tags")})`,
  };
});

// Định dạng lại thành mảng JS
let newProductsArrayText = "const products = [\n";
transformedProducts.forEach((p) => {
  newProductsArrayText += `    {\n`;
  newProductsArrayText += `        name: ${p.name}, region: ${p.region}, subregion: ${p.subregion}, type: ${p.type},\n`;
  newProductsArrayText += `        grape: ${p.grape}, abv: ${p.abv}, volume: ${p.volume},\n`;
  newProductsArrayText += `        price: ${p.price}, old_price: ${p.old_price}, stock: ${p.stock}, score: ${p.score}, rating: ${p.rating},\n`;
  newProductsArrayText += `        reviews_count: ${p.reviews_count}, vintage: ${p.vintage}, badge: ${p.badge},\n`;
  newProductsArrayText += `        img: ${p.img},\n`;
  newProductsArrayText += `        description: ${p.description},\n`;
  newProductsArrayText += `        tasting_notes: ${p.tasting_notes},\n`;
  newProductsArrayText += `        food_pairing: ${p.food_pairing},\n`;
  newProductsArrayText += `        tags: ${p.tags},\n`;
  newProductsArrayText += `    },\n`;
});
newProductsArrayText += "];";

const seedJsContent = fs.readFileSync(seedJsPath, "utf8");
const updatedSeedJsContent = seedJsContent.replace(
  /const products = \[[\s\S]*?\];/,
  newProductsArrayText,
);

fs.writeFileSync(seedJsPath, updatedSeedJsContent);
console.log("Successfully updated server/seeds/products.js");
