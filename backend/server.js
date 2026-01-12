import express from "express";
import cors from "cors";
import { db } from "./data.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// Test: sa vezi ca merge serverul
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend PIU merge!" });
});

/* 1) Interventii - lista */
app.get("/api/interventii", (req, res) => {
  res.json(db.interventii);
});

/* 1) Interventii - update status */
app.patch("/api/interventii/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const item = db.interventii.find(i => i.id === id);
  if (!item) return res.status(404).json({ message: "Interventie inexistenta" });
  if (!status) return res.status(400).json({ message: "Lipseste status" });

  item.status = status;
  res.json(item);
});

/* 2) Beneficiari - lista + filtrare */
app.get("/api/beneficiari", (req, res) => {
  const { categorie } = req.query;

  const list = categorie
    ? db.beneficiari.filter(b => b.categorie === categorie)
    : db.beneficiari;

  res.json(list);
});

/* 3) Urgente - creare */
app.post("/api/urgente", (req, res) => {
  const { descriere } = req.body;
  if (!descriere) return res.status(400).json({ message: "Lipseste descriere" });

  const item = { id: nextId(db.urgente), descriere, createdAt: new Date().toISOString() };
  db.urgente.push(item);

  res.status(201).json(item);
});

/* 4) Livrari - lista */
app.get("/api/livrari", (req, res) => {
  res.json(db.livrari);
});

/* 4) Livrari - confirmare */
app.post("/api/livrari/:id/confirma", (req, res) => {
  const id = Number(req.params.id);
  const item = db.livrari.find(l => l.id === id);
  if (!item) return res.status(404).json({ message: "Livrare inexistenta" });

  item.status = "Confirmata";
  res.json(item);
});

/* 5) Atribuire cazuri */
app.post("/api/atribuiri", (req, res) => {
  const { interventieId, voluntar } = req.body;

  if (!interventieId || !voluntar) {
    return res.status(400).json({ message: "Lipseste interventieId/voluntar" });
  }

  const id = Number(interventieId);
  const interventie = db.interventii.find(i => i.id === id);
  if (!interventie) return res.status(404).json({ message: "Interventie inexistenta" });

  interventie.voluntar = voluntar;

  const item = { id: nextId(db.atribuiri), interventieId: id, voluntar };
  db.atribuiri.push(item);

  res.status(201).json(item);
});


/* 6) Vizite - creare + lista */
app.post("/api/vizite", (req, res) => {
  const { beneficiar, date, time } = req.body;
  if (!beneficiar || !date || !time) {
    return res.status(400).json({ message: "Lipseste beneficiar/date/time" });
  }

  const item = { id: nextId(db.vizite), beneficiar, date, time };
  db.vizite.push(item);

  res.status(201).json(item);
});

app.get("/api/vizite", (req, res) => {
  res.json(db.vizite);
});

/* 7) Alerte - creare + lista */
app.post("/api/alerte", (req, res) => {
  const { mesaj } = req.body;
  if (!mesaj) return res.status(400).json({ message: "Lipseste mesaj" });

  const item = { id: nextId(db.alerte), mesaj, createdAt: new Date().toISOString() };
  db.alerte.push(item);

  res.status(201).json(item);
});

app.get("/api/alerte", (req, res) => {
  res.json(db.alerte);
});

/* 8) Evaluare progres - creare + lista */
app.post("/api/evaluari", (req, res) => {
  const { beneficiar, scor, observatii } = req.body;
  if (!beneficiar || !scor) return res.status(400).json({ message: "Lipseste beneficiar/scor" });

  const item = {
    id: nextId(db.evaluari),
    beneficiar,
    scor,
    observatii: observatii || "",
    createdAt: new Date().toISOString()
  };
  db.evaluari.push(item);

  res.status(201).json(item);
});

app.get("/api/evaluari", (req, res) => {
  res.json(db.evaluari);
});

app.listen(PORT, () => {
  console.log(`Backend pornit: http://localhost:${PORT}`);
});

app.get("/api/voluntari", (req, res) => {
  res.json(db.voluntari);
});

