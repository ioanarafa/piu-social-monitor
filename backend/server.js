import express from "express";
import cors from "cors";
import { getDb } from "./db.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function cleanText(s) {
  return String(s ?? "").trim();
}
function nowISO() {
  return new Date().toISOString();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend PIU merge!" });
});

app.get("/api/voluntari", async (req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all("SELECT * FROM voluntari ORDER BY nume"));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la voluntari" });
  }
});

app.post("/api/voluntari", async (req, res) => {
  try {
    const nume = cleanText(req.body?.nume);
    if (!nume) return res.status(400).json({ message: "Nume obligatoriu" });
    const db = await getDb();
    await db.run("INSERT INTO voluntari(nume) VALUES (?)", [nume]);
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la adaugare voluntar" });
  }
});

app.delete("/api/voluntari/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.run("DELETE FROM voluntari WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la stergere voluntar" });
  }
});

app.get("/api/beneficiari", async (req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all("SELECT * FROM beneficiari ORDER BY nume"));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la beneficiari" });
  }
});

app.post("/api/beneficiari", async (req, res) => {
  try {
    const nume = cleanText(req.body?.nume);
    const categorie = cleanText(req.body?.categorie);
    if (!nume || !categorie) return res.status(400).json({ message: "Campuri incomplete" });

    const db = await getDb();
    await db.run("INSERT INTO beneficiari(nume, categorie) VALUES (?,?)", [nume, categorie]);
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la adaugare beneficiar" });
  }
});

app.put("/api/beneficiari/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nume = cleanText(req.body?.nume);
    const categorie = cleanText(req.body?.categorie);
    if (!nume || !categorie) return res.status(400).json({ message: "Campuri incomplete" });

    const db = await getDb();
    await db.run("UPDATE beneficiari SET nume=?, categorie=? WHERE id=?", [nume, categorie, id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la editare beneficiar" });
  }
});

app.delete("/api/beneficiari/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.run("DELETE FROM beneficiari WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la stergere beneficiar" });
  }
});

app.get("/api/interventii", async (req, res) => {
  try {
    const db = await getDb();
    const voluntarId = req.query.voluntarId ? Number(req.query.voluntarId) : null;

    const sql = `
      SELECT i.id, i.tip, i.status, i.descriere, i.createdAt,
             b.id as beneficiarId, b.nume as beneficiar, b.categorie as categorie,
             v.id as voluntarId, v.nume as voluntar
      FROM interventii i
      JOIN beneficiari b ON b.id = i.beneficiarId
      LEFT JOIN voluntari v ON v.id = i.voluntarId
      ${voluntarId ? "WHERE i.voluntarId = ?" : ""}
      ORDER BY i.id DESC
    `;
    const rows = voluntarId ? await db.all(sql, [voluntarId]) : await db.all(sql);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la interventii" });
  }
});

app.post("/api/interventii", async (req, res) => {
  try {
    const tip = cleanText(req.body?.tip);
    const descriere = cleanText(req.body?.descriere);
    const beneficiarId = Number(req.body?.beneficiarId);

    if (!tip || !beneficiarId) return res.status(400).json({ message: "tip si beneficiarId obligatorii" });

    const db = await getDb();
    const createdAt = nowISO();
    const status = "Neatribuita";

    await db.run(
      "INSERT INTO interventii(tip,status,descriere,beneficiarId,voluntarId,createdAt) VALUES (?,?,?,?,?,?)",
      [tip, status, descriere, beneficiarId, null, createdAt]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la creare interventie" });
  }
});

app.patch("/api/interventii/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = cleanText(req.body?.status);
    if (!status) return res.status(400).json({ message: "status obligatoriu" });

    const db = await getDb();
    await db.run("UPDATE interventii SET status=? WHERE id=?", [status, id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la status" });
  }
});

app.delete("/api/interventii/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.run("DELETE FROM interventii WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la stergere interventie" });
  }
});

app.post("/api/atribuiri", async (req, res) => {
  try {
    const interventieId = Number(req.body?.interventieId);
    const voluntarId = Number(req.body?.voluntarId);
    if (!interventieId || !voluntarId) {
      return res.status(400).json({ message: "interventieId si voluntarId obligatorii" });
    }

    const db = await getDb();
    const exists = await db.get("SELECT id FROM interventii WHERE id=?", [interventieId]);
    if (!exists) return res.status(404).json({ message: "Interventie inexistenta" });

    await db.run("UPDATE interventii SET voluntarId=?, status=? WHERE id=?", [
      voluntarId,
      "Preluata",
      interventieId,
    ]);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la atribuire" });
  }
});

app.get("/api/urgente", async (req, res) => {
  try {
    const db = await getDb();
    const voluntarId = req.query.voluntarId ? Number(req.query.voluntarId) : null;

    const sql = `
      SELECT u.id, u.mesaj, u.createdAt, v.id as voluntarId, v.nume as voluntar
      FROM urgente u
      JOIN voluntari v ON v.id = u.voluntarId
      ${voluntarId ? "WHERE u.voluntarId = ?" : ""}
      ORDER BY u.id DESC
    `;
    const rows = voluntarId ? await db.all(sql, [voluntarId]) : await db.all(sql);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la urgente" });
  }
});

app.post("/api/urgente", async (req, res) => {
  try {
    const mesaj = cleanText(req.body?.mesaj);
    const voluntarId = Number(req.body?.voluntarId);
    if (!mesaj) return res.status(400).json({ message: "Mesaj obligatoriu" });
    if (!voluntarId) return res.status(400).json({ message: "voluntarId obligatoriu" });

    const db = await getDb();
    const createdAt = nowISO();
    await db.run("INSERT INTO urgente(mesaj, voluntarId, createdAt) VALUES (?,?,?)", [
      mesaj,
      voluntarId,
      createdAt,
    ]);

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la trimitere urgenta" });
  }
});

app.get("/api/vizite", async (req, res) => {
  try {
    const db = await getDb();
    const voluntarId = req.query.voluntarId ? Number(req.query.voluntarId) : null;

    const sql = `
      SELECT z.id, z.data, z.ora, z.createdAt,
             b.id as beneficiarId, b.nume as beneficiar,
             v.id as voluntarId, v.nume as voluntar
      FROM vizite z
      JOIN beneficiari b ON b.id = z.beneficiarId
      JOIN voluntari v ON v.id = z.voluntarId
      ${voluntarId ? "WHERE z.voluntarId = ?" : ""}
      ORDER BY z.id DESC
    `;
    const rows = voluntarId ? await db.all(sql, [voluntarId]) : await db.all(sql);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la vizite" });
  }
});

app.post("/api/vizite", async (req, res) => {
  try {
    const beneficiarId = Number(req.body?.beneficiarId);
    const voluntarId = Number(req.body?.voluntarId);
    const data = cleanText(req.body?.data);
    const ora = cleanText(req.body?.ora);

    if (!beneficiarId || !voluntarId || !data || !ora) {
      return res.status(400).json({ message: "Campuri incomplete" });
    }

    const db = await getDb();
    const createdAt = nowISO();
    await db.run(
      "INSERT INTO vizite(beneficiarId, voluntarId, data, ora, createdAt) VALUES (?,?,?,?,?)",
      [beneficiarId, voluntarId, data, ora, createdAt]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la programare vizita" });
  }
});

app.delete("/api/vizite/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.run("DELETE FROM vizite WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la stergere vizita" });
  }
});

app.post("/api/evaluari/voluntari", async (req, res) => {
  try {
    const voluntarId = Number(req.body?.voluntarId);
    const scor = Number(req.body?.scor);
    const observatii = cleanText(req.body?.observatii);

    if (!voluntarId || !scor) return res.status(400).json({ message: "Campuri incomplete" });
    if (scor < 1 || scor > 10) return res.status(400).json({ message: "Scor 1-10" });

    const db = await getDb();
    await db.run(
      "INSERT INTO evaluari_voluntari(voluntarId, scor, observatii, createdAt) VALUES (?,?,?,?)",
      [voluntarId, scor, observatii, nowISO()]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la evaluare voluntar" });
  }
});

app.get("/api/evaluari/voluntari", async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT e.id, e.scor, e.observatii, e.createdAt,
             v.id as voluntarId, v.nume as voluntar
      FROM evaluari_voluntari e
      JOIN voluntari v ON v.id = e.voluntarId
      ORDER BY e.id DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la lista evaluari voluntari" });
  }
});

app.post("/api/evaluari/beneficiari", async (req, res) => {
  try {
    const beneficiarId = Number(req.body?.beneficiarId);
    const voluntarId = Number(req.body?.voluntarId);
    const scor = Number(req.body?.scor);
    const observatii = cleanText(req.body?.observatii);

    if (!beneficiarId || !voluntarId || !scor) return res.status(400).json({ message: "Campuri incomplete" });
    if (scor < 1 || scor > 10) return res.status(400).json({ message: "Scor 1-10" });

    const db = await getDb();
    await db.run(
      "INSERT INTO evaluari_beneficiari(beneficiarId, voluntarId, scor, observatii, createdAt) VALUES (?,?,?,?,?)",
      [beneficiarId, voluntarId, scor, observatii, nowISO()]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la evaluare beneficiar" });
  }
});

app.get("/api/evaluari/beneficiari", async (req, res) => {
  try {
    const db = await getDb();
    const voluntarId = req.query.voluntarId ? Number(req.query.voluntarId) : null;

    const sql = `
      SELECT e.id, e.scor, e.observatii, e.createdAt,
             b.id as beneficiarId, b.nume as beneficiar,
             v.id as voluntarId, v.nume as voluntar
      FROM evaluari_beneficiari e
      JOIN beneficiari b ON b.id = e.beneficiarId
      JOIN voluntari v ON v.id = e.voluntarId
      ${voluntarId ? "WHERE e.voluntarId = ?" : ""}
      ORDER BY e.id DESC
    `;
    const rows = voluntarId ? await db.all(sql, [voluntarId]) : await db.all(sql);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Eroare la lista evaluari beneficiari" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend pornit: http://localhost:${PORT}`);
});
