import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDb() {
  const db = await open({
    filename: path.join(__dirname, "piu.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS voluntari (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nume TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS beneficiari (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nume TEXT NOT NULL,
      categorie TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interventii (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tip TEXT NOT NULL,
      status TEXT NOT NULL,
      descriere TEXT,
      beneficiarId INTEGER NOT NULL,
      voluntarId INTEGER,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(beneficiarId) REFERENCES beneficiari(id) ON DELETE RESTRICT,
      FOREIGN KEY(voluntarId) REFERENCES voluntari(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS urgente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesaj TEXT NOT NULL,
      voluntarId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(voluntarId) REFERENCES voluntari(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vizite (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiarId INTEGER NOT NULL,
      voluntarId INTEGER NOT NULL,
      data TEXT NOT NULL,
      ora TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(beneficiarId) REFERENCES beneficiari(id) ON DELETE RESTRICT,
      FOREIGN KEY(voluntarId) REFERENCES voluntari(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS evaluari_voluntari (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voluntarId INTEGER NOT NULL,
      scor INTEGER NOT NULL,
      observatii TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(voluntarId) REFERENCES voluntari(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evaluari_beneficiari (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiarId INTEGER NOT NULL,
      voluntarId INTEGER NOT NULL,
      scor INTEGER NOT NULL,
      observatii TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(beneficiarId) REFERENCES beneficiari(id) ON DELETE CASCADE,
      FOREIGN KEY(voluntarId) REFERENCES voluntari(id) ON DELETE CASCADE
    );
  `);

  const vCount = (await db.get("SELECT COUNT(*) as c FROM voluntari")).c;
  if (vCount === 0) {
    await db.run("INSERT INTO voluntari(nume) VALUES (?), (?)", ["Ana Pop", "Mihai Rusu"]);
  }

  const bCount = (await db.get("SELECT COUNT(*) as c FROM beneficiari")).c;
  if (bCount === 0) {
    await db.run(
      "INSERT INTO beneficiari(nume, categorie) VALUES (?, ?), (?, ?)",
      ["Pop Maria", "Pensionar", "Ionescu Vasile", "Handicap"]
    );
  }

  const iCount = (await db.get("SELECT COUNT(*) as c FROM interventii")).c;
  if (iCount === 0) {
    const now = new Date().toISOString();
    const b1 = await db.get("SELECT id FROM beneficiari WHERE nume = ?", ["Pop Maria"]);
    const b2 = await db.get("SELECT id FROM beneficiari WHERE nume = ?", ["Ionescu Vasile"]);
    const v1 = await db.get("SELECT id FROM voluntari WHERE nume = ?", ["Ana Pop"]);

    await db.run(
      "INSERT INTO interventii(tip,status,descriere,beneficiarId,voluntarId,createdAt) VALUES (?,?,?,?,?,?)",
      ["Livrare alimente", "In curs", "Pachet saptamanal", b1.id, v1.id, now]
    );
    await db.run(
      "INSERT INTO interventii(tip,status,descriere,beneficiarId,voluntarId,createdAt) VALUES (?,?,?,?,?,?)",
      ["Insotire pe strada", "Preluata", "", b2.id, null, now]
    );
  }

  return db;
}
