import express from "express";
import cors from "cors";
import { getDb } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

function cleanText(s) {
  return String(s ?? "").trim();
}

app.get("/api/health", async (req, res) => {
  res.json({ ok: true, message: "Backend PIU merge!" });
});

/* -------------------- VOLUNTARI (CRUD) -------------------- */
app.get("/api/voluntari", async (req, res) => {
  const db = await getDb();
  const rows = await db.all("SELECT id, nume FROM voluntari ORDER BY nume");
  res.json(rows);
});

app.post("/api/voluntari", async (req, res) => {
  const nume = cleanText(req.body?.nume);
  if (!nume) return res.status(400).json({ message: "Nume obligatoriu" });

  try {
    const db = await getDb();
    const r = await db.run("INSERT INTO voluntari(nume) VALUES (?)", [nume]);
    res.status(201).json({ id: r.lastID, nume });
  } catch (e) {
    res.status(400).json({ message: "Nu pot salva voluntarul (poate exista deja)." });
  }
});

app.put("/api/voluntari/:id", async (req, res) => {
  const id = Number(req.params.id);
  const nume = cleanText(req.body?.nume);
  if (!id || !nume) return res.status(400).json({ message: "Date invalide" });

  try {
    const db = await getDb();
    await db.run("UPDATE voluntari SET nume=? WHERE id=?", [nume, id]);
    res.json({ id, nume });
  } catch {
    res.status(400).json({ message: "Nu pot actualiza voluntarul." });
  }
});

app.delete("/api/voluntari/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "ID invalid" });

  const db = await getDb();
  const used = await db.get("SELECT COUNT(*) as c FROM interventii WHERE voluntarId = ?", [id]);
  if (used.c > 0) return res.status(400).json({ message: "Voluntar are interventii asignate." });

  await db.run("DELETE FROM voluntari WHERE id = ?", [id]);
  res.json({ ok: true });
});

/* -------------------- BENEFICIARI (CRUD) -------------------- */
app.get("/api/beneficiari", async (req, res) => {
  const db = await getDb();
  const categorie = cleanText(req.query?.categorie);
  const rows = categorie
    ? await db.all("SELECT id, nume, categorie FROM beneficiari WHERE categorie=? ORDER BY nume", [categorie])
    : await db.all("SELECT id, nume, categorie FROM beneficiari ORDER BY nume");
  res.json(rows);
});

app.post("/api/beneficiari", async (req, res) => {
  const nume = cleanText(req.body?.nume);
  const categorie = cleanText(req.body?.categorie);
  if (!nume || !categorie) return res.status(400).json({ message: "Nume si categorie obligatorii" });

  const db = await getDb();
  const r = await db.run("INSERT INTO beneficiari(nume, categorie) VALUES (?,?)", [nume, categorie]);
  res.status(201).json({ id: r.lastID, nume, categorie });
});

app.put("/api/beneficiari/:id", async (req, res) => {
  const id = Number(req.params.id);
  const nume = cleanText(req.body?.nume);
  const categorie = cleanText(req.body?.categorie);
  if (!id || !nume || !categorie) return res.status(400).json({ message: "Date invalide" });

  const db = await getDb();
  await db.run("UPDATE beneficiari SET nume=?, categorie=? WHERE id=?", [nume, categorie, id]);
  res.json({ id, nume, categorie });
});

app.delete("/api/beneficiari/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "ID invalid" });

  const db = await getDb();
  const used = await db.get("SELECT COUNT(*) as c FROM interventii WHERE beneficiarId = ?", [id]);
  if (used.c > 0) return res.status(400).json({ message: "Beneficiar are interventii. Sterge interventiile intai." });

  await db.run("DELETE FROM beneficiari WHERE id = ?", [id]);
  res.json({ ok: true });
});

/* -------------------- INTERVENTII -------------------- */
// lista cu join pe nume
app.get("/api/interventii", async (req, res) => {
  const db = await getDb();
  const rows = await db.all(`
    SELECT i.id, i.tip, i.status, IFNULL(i.descriere,'') as descriere,
           b.nume as beneficiar,
           IFNULL(v.nume,'') as voluntar,
           i.beneficiarId, i.voluntarId
    FROM interventii i
    JOIN beneficiari b ON b.id = i.beneficiarId
    LEFT JOIN voluntari v ON v.id = i.voluntarId
    ORDER BY i.id DESC
  `);
  res.json(rows);
});

// admin: creeaza interventie (fara voluntar, sau optional)
app.post("/api/interventii", async (req, res) => {
  const tip = cleanText(req.body?.tip);
  const beneficiarId = Number(req.body?.beneficiarId);
  const descriere = cleanText(req.body?.descriere);
  if (!tip || !beneficiarId) return res.status(400).json({ message: "Tip si beneficiarId obligatorii" });

  const db = await getDb();
  const now = new Date().toISOString();
  const r = await db.run(
    "INSERT INTO interventii(tip,status,descriere,beneficiarId,voluntarId,createdAt) VALUES (?,?,?,?,?,?)",
    [tip, "Noua", descriere, beneficiarId, null, now]
  );
  res.status(201).json({ id: r.lastID, tip, status: "Noua", descriere, beneficiarId, voluntarId: null });
});

app.patch("/api/interventii/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const status = cleanText(req.body?.status);
  if (!id || !status) return res.status(400).json({ message: "Date invalide" });

  const db = await getDb();
  await db.run("UPDATE interventii SET status=? WHERE id=?", [status, id]);
  res.json({ ok: true });
});

// admin: sterge interventie
app.delete("/api/interventii/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "ID invalid" });

  const db = await getDb();
  await db.run("DELETE FROM interventii WHERE id=?", [id]);
  res.json({ ok: true });
});

/* -------------------- ATRIBUIRE (Admin) -------------------- */
app.post("/api/atribuiri", async (req, res) => {
  const interventieId = Number(req.body?.interventieId);
  const voluntarId = Number(req.body?.voluntarId);
  if (!interventieId || !voluntarId) return res.status(400).json({ message: "interventieId si voluntarId obligatorii" });

  const db = await getDb();
  const exists = await db.get("SELECT id FROM interventii WHERE id=?", [interventieId]);
  if (!exists) return res.status(404).json({ message: "Interventie inexistenta" });

  await db.run("UPDATE interventii SET voluntarId=? WHERE id=?", [voluntarId, interventieId]);
  res.json({ ok: true });
});

/* -------------------- RESTUL (ramane simplu, in memorie) -------------------- */
/* Pentru moment pastram ca demo: urgente/alerte/vizite/evaluari/livrari.
   Le putem muta in DB la urmatorul upgrade. */
let urgente = [];
let alerte = [];
let vizite = [];
let evaluari = [];
let livrari = [
  { id: 1, beneficiar: "Pop Maria", status: "Neconfirmata", voluntar: "Ana Pop" }
];

function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

app.post("/api/urgente", (req, res) => {
  const descriere = cleanText(req.body?.descriere);
  if (!descriere) return res.status(400).json({ message: "Descriere obligatorie" });
  const item = { id: nextId(urgente), descriere };
  urgente.push(item);
  res.status(201).json(item);
});

app.get("/api/livrari", (req, res) => {
  res.json(livrari);
});

app.post("/api/livrari/:id/confirma", (req, res) => {
  const id = Number(req.params.id);
  const item = livrari.find(x => x.id === id);
  if (!item) return res.status(404).json({ message: "Livrare inexistenta" });
  item.status = "Confirmata";
  res.json(item);
});

app.post("/api/vizite", (req, res) => {
  const beneficiar = cleanText(req.body?.beneficiar);
  const date = cleanText(req.body?.date);
  const time = cleanText(req.body?.time);
  const voluntar = cleanText(req.body?.voluntar);
  if (!beneficiar || !date || !time) return res.status(400).json({ message: "Campuri incomplete" });
  const item = { id: nextId(vizite), beneficiar, date, time, voluntar };
  vizite.push(item);
  res.status(201).json(item);
});

app.get("/api/vizite", (req, res) => {
  res.json(vizite);
});

app.post("/api/alerte", (req, res) => {
  const mesaj = cleanText(req.body?.mesaj);
  if (!mesaj) return res.status(400).json({ message: "Mesaj obligatoriu" });
  const item = { id: nextId(alerte), mesaj };
  alerte.push(item);
  res.status(201).json(item);
});

app.get("/api/alerte", (req, res) => {
  res.json(alerte);
});

app.post("/api/evaluari", (req, res) => {
  const beneficiar = cleanText(req.body?.beneficiar);
  const scor = cleanText(req.body?.scor);
  const observatii = cleanText(req.body?.observatii);
  if (!beneficiar || !scor) return res.status(400).json({ message: "Beneficiar si scor obligatorii" });
  const item = { id: nextId(evaluari), beneficiar, scor, observatii };
  evaluari.push(item);
  res.status(201).json(item);
});

app.get("/api/evaluari", (req, res) => {
  res.json(evaluari);
});

app.listen(PORT, () => {
  console.log(`Backend pornit: http://localhost:${PORT}`);
});
