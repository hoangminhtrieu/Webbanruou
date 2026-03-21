const { getDB } = require("./database");
const db = getDB();
const tableInfo = db.prepare("PRAGMA table_info(users)").all();
console.table(tableInfo);
const sampleUser = db.prepare("SELECT * FROM users LIMIT 1").get();
console.log("Sample User:", JSON.stringify(sampleUser, null, 2));
