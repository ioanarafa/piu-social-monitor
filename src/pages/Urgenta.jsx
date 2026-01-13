import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

export default function Urgenta({ showToast, role, selectedVoluntarId }) {
  const [mesaj, setMesaj] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    try {
      const path =
        role === "voluntar" && selectedVoluntarId
          ? `/urgente?voluntarId=${selectedVoluntarId}`
          : "/urgente";
      setItems(await apiGet(path));
    } catch {
      showToast("Eroare: nu pot incarca urgentele.", "error");
    }
  }

  useEffect(() => {
    load();
  }, [role, selectedVoluntarId]);

  async function send() {
    try {
      await apiSend("/urgente", "POST", {
        mesaj,
        voluntarId: Number(selectedVoluntarId),
      });
      setMesaj("");
      showToast("Urgenta trimisa!");
      load();
    } catch {
      showToast("Eroare la trimitere urgenta.", "error");
    }
  }

  return (
    <div>
      <h1>Urgenta</h1>

      {role === "voluntar" && (
        <div className="card">
          <h3>Raportare urgenta</h3>
          <label>Mesaj</label>
          <textarea value={mesaj} onChange={(e) => setMesaj(e.target.value)} />
          <button className="button" onClick={send}>Trimite</button>
        </div>
      )}

      <div className="list">
        {items.map((u) => (
          <div className="card" key={u.id}>
            <h3>{u.voluntar}</h3>
            <div style={{ opacity: 0.8 }}>{u.createdAt}</div>
            <div style={{ marginTop: 8 }}>{u.mesaj}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
