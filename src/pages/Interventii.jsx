import { useEffect, useState } from "react";
import { API } from "../api";

export default function Interventii({ showToast, role, voluntar }) {
  const [list, setList] = useState([]);

  async function load() {
    try {
      const res = await fetch(`${API}/interventii`);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca interventiile.", "error");
    }
  }

  async function updateStatus(id) {
    const item = list.find((x) => x.id === id);
    const next =
      item?.status === "Preluata"
        ? "In curs"
        : item?.status === "In curs"
        ? "Finalizata"
        : "Preluata";

    try {
      const res = await fetch(`${API}/interventii/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        showToast("Eroare la actualizare status.", "error");
        return;
      }

      showToast("Status actualizat!", "success");
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
      ? list.filter((i) => i.voluntar === voluntar)
      : list;

  return (
    <>
      <h1>Monitorizare interventii</h1>

      {visible.map((i) => (
        <div key={i.id} className="card">
          <p><b>{i.titlu}</b></p>
          <p>Beneficiar: {i.beneficiar}</p>
          <p>Voluntar: {i.voluntar || "-"}</p>
          <p>Status: {i.status}</p>

          <button className="button" onClick={() => updateStatus(i.id)}>
            Actualizeaza status
          </button>
        </div>
      ))}

      {role === "voluntar" && visible.length === 0 && (
        <p>Nu ai interventii atribuite.</p>
      )}
    </>
  );
}
