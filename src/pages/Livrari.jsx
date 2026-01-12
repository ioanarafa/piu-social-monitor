import { useEffect, useState } from "react";
import { API } from "../api";

export default function Livrari({ showToast, role, voluntar }) {
  const [list, setList] = useState([]);

  async function load() {
    try {
      const res = await fetch(`${API}/livrari`);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca livrarile.", "error");
    }
  }

  async function confirma(id) {
    try {
      const res = await fetch(`${API}/livrari/${id}/confirma`, { method: "POST" });
      if (!res.ok) {
        showToast("Eroare la confirmare.", "error");
        return;
      }
      showToast("Livrare confirmata!", "success");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible =
    role === "voluntar"
      ? list.filter((l) => l.voluntar === voluntar)
      : list;

  return (
    <>
      <h1>Confirmare livrare</h1>

      {visible.map((l) => (
        <div key={l.id} className="card">
          <p>Beneficiar: <b>{l.beneficiar}</b></p>
          <p>Voluntar: {l.voluntar || "-"}</p>
          <p>Status: {l.status}</p>

          <button className="button" onClick={() => confirma(l.id)}>
            Confirma
          </button>
        </div>
      ))}

      {role === "voluntar" && visible.length === 0 && (
        <p>Nu ai livrari atribuite.</p>
      )}
    </>
  );
}
