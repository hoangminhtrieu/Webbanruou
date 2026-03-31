// Cấu hình SQLite (Node.js v22+)
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "..", "vinova.db");
const SCHEMA_PATH = path.join(__dirname, "..", "migrations", "init.sql");

let db;

function getDB() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}

function initDB() {
  const database = getDB();
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  // Loại bỏ các comment và tách bằng dấu chấm phẩy
  const cleaned = schema.replace(/--[^\n]*/g, "");
  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    try {
      database.exec(stmt + ";");
    } catch (e) {
      /* bỏ qua nếu đã tồn tại */
    }
  }
  console.log("✅ Database initialized:", DB_PATH);
  return database;
}

// Hỗ trợ: bọc một hàm trong một transaction (mô phỏng API better-sqlite3)
function transaction(db, fn) {
  return function (...args) {
    db.exec("BEGIN");
    try {
      const result = fn(...args);
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  };
}

// Hỗ trợ: lấy lastInsertRowid dưới dạng Number (node:sqlite trả về BigInt)
function lastId(result) {
  return Number(result.lastInsertRowid);
}

module.exports = { getDB, initDB, transaction, lastId };
