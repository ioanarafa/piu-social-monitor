import { useEffect, useState } from "react";
import { API } from "../api";

const CATEGORII = ["Pensionar", "Handicap", "Altele"];

export default function Beneficiari({ showToast, role }) {
  const [list, setList] = useState([]);
  const [filtru, setFiltru] = useState("");

  // formular admin
  const [nume, setNume] = useState("");
  const [categorie, setCategorie] = useState(CATEGORII[0]);

  // edit
  const [editId, setEditId] = useState(null);
  const [editNume, setEditNume] = useState("");
  const [editCategorie, setEditCategorie] = useState(CATEGORII[0]);

  async function load(cat = filtru) {
    try {
      const url = cat ? `${API}/beneficiari?categorie=${encodeURIComponent(cat)}` : `${API}/beneficiari`;
      const res = await fetch(url);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca beneficiarii.", "error");
    }
  }

  useEffect(() => { load(""); }, []);

  async function add() {
    if (!nume.trim()) {
      showToast("Completeaza numele.", "error");
      return;
    }
    try {
      const res = await fetch(`${API}/beneficiari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume, categorie }),
      });
      if (!res.ok) {
        showToast("Eroare la adaugare beneficiar.", "error");
        return;
      }
      showToast("Beneficiar adaugat!", "success");
      setNume("");
      setCategorie(CATEGORII[0]);
      load("");
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  function startEdit(b) {
    setEditId(b.id);
    setEditNume(b.nume);
    setEditCategorie(b.categorie);
  }

  async function saveEdit() {
    try {
      const res = await fetch(`${API}/beneficiari/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume: editNume, categorie: editCategorie }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Eroare la editare.", "error");
        return;
      }
      showToast("Beneficiar actualizat!", "success");
      setEditId(null);
      load("");
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  async function del(id) {
    if (!confirm("Stergi beneficiarul?")) return;
    try {
      const res = await fetch(`${API}/beneficiari/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Nu pot sterge beneficiarul.", "error");
        return;
      }
      showToast("Beneficiar sters.", "success");
      load("");
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  return (
    <>
      <h1>Beneficiari</h1>

      <div className="card">
        <label>Filtru categorie</label>
        <select value={filtru} onChange={(e) => { setFiltru(e.target.value); load(e.target.value); }}>
          <option value="">Toate</option>
          {CATEGORII.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {role === "admin" && (
        <div className="card">
          <h3>Adauga beneficiar</h3>
          <label>Nume</label>
          <input value={nume} onChange={(e) => setNume(e.target.value)} />

          <label>Categorie</label>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {CATEGORII.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <button className="button" onClick={add}>Adauga</button>
        </div>
      )}

      {list.map((b) => (
        <div key={b.id} className="card">
          {editId === b.id ? (
            <>
              <label>Nume</label>
              <input value={editNume} onChange={(e) => setEditNume(e.target.value)} />
              <label>Categorie</label>
              <select value={editCategorie} onChange={(e) => setEditCategorie(e.target.value)}>
                {CATEGORII.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <div className="row">
                <button className="button" onClick={saveEdit}>Salveaza</button>
                <button className="button" onClick={() => setEditId(null)}>Renunta</button>
              </div>
            </>
          ) : (
            <>
              <p><b>{b.nume}</b></p>
              <p>Categorie: {b.categorie}</p>

              {role === "admin" && (
                <div className="row">
                  <button className="button" onClick={() => startEdit(b)}>Editeaza</button>
                  <button className="button danger" onClick={() => del(b.id)}>Sterge</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </>
  );
}
