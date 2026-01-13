import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

export default function Voluntari({ showToast, onChanged }) {
  const [items, setItems] = useState([]);
  const [nume, setNume] = useState("");

  async function load() {
    try {
      setItems(await apiGet("/voluntari"));
    } catch {
      showToast("Eroare: nu pot incarca voluntarii.", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    try {
      await apiSend("/voluntari", "POST", { nume });
      setNume("");
      showToast("Voluntar adaugat!");
      load();
      onChanged?.();
    } catch {
      showToast("Eroare la adaugare (nume duplicat?).", "error");
    }
  }

  async function del(id) {
    try {
      await apiSend(`/voluntari/${id}`, "DELETE");
      showToast("Voluntar sters!");
      load();
      onChanged?.();
    } catch {
      showToast("Eroare la stergere.", "error");
    }
  }

  return (
    <div>
      <h1>Voluntari</h1>

      <div className="card">
        <h3>Adauga voluntar</h3>
        <label>Nume</label>
        <input value={nume} onChange={(e) => setNume(e.target.value)} />
        <button className="button" onClick={add}>Adauga</button>
      </div>

      <div className="list">
        {items.map((v) => (
          <div className="card" key={v.id}>
            <h3>{v.nume}</h3>
            <button
              className="button"
              style={{ background: "#e74c3c" }}
              onClick={() => del(v.id)}
            >
              Sterge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
