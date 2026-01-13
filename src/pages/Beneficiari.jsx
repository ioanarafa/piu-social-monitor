import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

const CATEG = ["Toate", "Pensionar", "Handicap", "Altele"];

export default function Beneficiari({ showToast, role }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("Toate");

  const [nume, setNume] = useState("");
  const [categorie, setCategorie] = useState("Pensionar");

  const [editId, setEditId] = useState(null);
  const [editNume, setEditNume] = useState("");
  const [editCat, setEditCat] = useState("Pensionar");

  async function load() {
    try {
      const data = await apiGet("/beneficiari");
      setItems(data);
    } catch {
      showToast("Eroare: nu pot incarca beneficiarii.", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    try {
      await apiSend("/beneficiari", "POST", { nume, categorie });
      setNume("");
      showToast("Beneficiar adaugat!");
      load();
    } catch {
      showToast("Eroare la adaugare.", "error");
    }
  }

  async function del(id) {
    try {
      await apiSend(`/beneficiari/${id}`, "DELETE");
      showToast("Beneficiar sters!");
      load();
    } catch {
      showToast("Eroare la stergere (poate are interventii).", "error");
    }
  }

  async function saveEdit() {
    try {
      await apiSend(`/beneficiari/${editId}`, "PUT", { nume: editNume, categorie: editCat });
      setEditId(null);
      showToast("Beneficiar editat!");
      load();
    } catch {
      showToast("Eroare la editare.", "error");
    }
  }

  const shown = items.filter((x) => filter === "Toate" || x.categorie === filter);

  return (
    <div>
      <h1>Beneficiari</h1>

      <div className="card">
        <label>Filtru categorie</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {CATEG.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {role === "admin" && (
        <div className="card">
          <h3>Adauga beneficiar</h3>
          <label>Nume</label>
          <input value={nume} onChange={(e) => setNume(e.target.value)} />

          <label>Categorie</label>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {CATEG.filter((x) => x !== "Toate").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button className="button" onClick={add}>Adauga</button>
        </div>
      )}

      <div className="list">
        {shown.map((b) => (
          <div className="card" key={b.id}>
            {editId === b.id ? (
              <>
                <label>Nume</label>
                <input value={editNume} onChange={(e) => setEditNume(e.target.value)} />
                <label>Categorie</label>
                <select value={editCat} onChange={(e) => setEditCat(e.target.value)}>
                  {CATEG.filter((x) => x !== "Toate").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button className="button" onClick={saveEdit}>Salveaza</button>
                <button
                  className="button"
                  style={{ marginLeft: 10, background: "#95a5a6" }}
                  onClick={() => setEditId(null)}
                >
                  Renunta
                </button>
              </>
            ) : (
              <>
                <h3>{b.nume}</h3>
                <div>Categorie: {b.categorie}</div>

                {role === "admin" && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="button"
                      onClick={() => {
                        setEditId(b.id);
                        setEditNume(b.nume);
                        setEditCat(b.categorie);
                      }}
                    >
                      Editeaza
                    </button>
                    <button
                      className="button"
                      style={{ marginLeft: 10, background: "#e74c3c" }}
                      onClick={() => del(b.id)}
                    >
                      Sterge
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
