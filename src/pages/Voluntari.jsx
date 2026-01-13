import { useEffect, useState } from "react";
import { API } from "../api";

export default function Voluntari({ showToast, refreshVoluntari }) {
  const [list, setList] = useState([]);
  const [nume, setNume] = useState("");

  const [editId, setEditId] = useState(null);
  const [editNume, setEditNume] = useState("");

  async function load() {
    try {
      const res = await fetch(`${API}/voluntari`);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca voluntarii.", "error");
    }
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!nume.trim()) {
      showToast("Completeaza numele.", "error");
      return;
    }
    try {
      const res = await fetch(`${API}/voluntari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Nu pot adauga voluntarul.", "error");
        return;
      }
      showToast("Voluntar adaugat!", "success");
      setNume("");
      load();
      refreshVoluntari?.();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  function startEdit(v) {
    setEditId(v.id);
    setEditNume(v.nume);
  }

  async function saveEdit() {
    try {
      const res = await fetch(`${API}/voluntari/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume: editNume }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Eroare la editare.", "error");
        return;
      }
      showToast("Voluntar actualizat!", "success");
      setEditId(null);
      load();
      refreshVoluntari?.();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  async function del(id) {
    if (!confirm("Stergi voluntarul?")) return;
    try {
      const res = await fetch(`${API}/voluntari/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Nu pot sterge voluntarul.", "error");
        return;
      }
      showToast("Voluntar sters.", "success");
      load();
      refreshVoluntari?.();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  return (
    <>
      <h1>Voluntari</h1>

      <div className="card">
        <h3>Adauga voluntar</h3>
        <label>Nume</label>
        <input value={nume} onChange={(e) => setNume(e.target.value)} />
        <button className="button" onClick={add}>Adauga</button>
      </div>

      {list.map((v) => (
        <div key={v.id} className="card">
          {editId === v.id ? (
            <>
              <label>Nume</label>
              <input value={editNume} onChange={(e) => setEditNume(e.target.value)} />
              <div className="row">
                <button className="button" onClick={saveEdit}>Salveaza</button>
                <button className="button" onClick={() => setEditId(null)}>Renunta</button>
              </div>
            </>
          ) : (
            <>
              <p><b>{v.nume}</b></p>
              <div className="row">
                <button className="button" onClick={() => startEdit(v)}>Editeaza</button>
                <button className="button danger" onClick={() => del(v.id)}>Sterge</button>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
}
