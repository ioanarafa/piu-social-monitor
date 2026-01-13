import { useEffect, useState } from "react";
import { API } from "../api";

const TIPURI = ["Livrare alimente", "Vizita", "Insotire pe strada"];

export default function Interventii({ showToast, role, voluntarId }) {
  const [list, setList] = useState([]);
  const [beneficiari, setBeneficiari] = useState([]);

  // formular admin
  const [tip, setTip] = useState(TIPURI[0]);
  const [beneficiarId, setBeneficiarId] = useState("");
  const [descriere, setDescriere] = useState("");

  async function load() {
    try {
      const r1 = await fetch(`${API}/interventii`);
      const data1 = await r1.json();
      setList(data1);

      const r2 = await fetch(`${API}/beneficiari`);
      const data2 = await r2.json();
      setBeneficiari(data2);

      if (!beneficiarId && data2.length) setBeneficiarId(String(data2[0].id));
    } catch {
      showToast("Eroare: nu pot incarca datele.", "error");
    }
  }

  useEffect(() => { load(); }, []);

  async function addInterventie() {
    if (!beneficiarId) {
      showToast("Alege un beneficiar.", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/interventii`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, beneficiarId: Number(beneficiarId), descriere }),
      });

      if (!res.ok) {
        showToast("Eroare la creare interventie.", "error");
        return;
      }

      showToast("Interventie creata!", "success");
      setDescriere("");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  async function updateStatus(id, current) {
    const next =
      current === "Noua" ? "Preluata" :
      current === "Preluata" ? "In curs" :
      current === "In curs" ? "Finalizata" :
      "Noua";

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

  async function deleteInterventie(id) {
    if (!confirm("Stergi interventia?")) return;

    try {
      const res = await fetch(`${API}/interventii/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Eroare la stergere.", "error");
        return;
      }
      showToast("Interventie stearsa.", "success");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  const visible = role === "voluntar"
    ? list.filter((i) => i.voluntarId === voluntarId)
    : list;

  return (
    <>
      <h1>Interventii</h1>

      {role === "admin" && (
        <div className="card">
          <h3>Adauga interventie</h3>

          <label>Tip interventie</label>
          <select value={tip} onChange={(e) => setTip(e.target.value)}>
            {TIPURI.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <label>Beneficiar</label>
          <select value={beneficiarId} onChange={(e) => setBeneficiarId(e.target.value)}>
            {beneficiari.map((b) => (
              <option key={b.id} value={b.id}>{b.nume} ({b.categorie})</option>
            ))}
          </select>

          <label>Descriere (optional)</label>
          <input value={descriere} onChange={(e) => setDescriere(e.target.value)} />

          <button className="button" onClick={addInterventie}>Creeaza</button>
        </div>
      )}

      {visible.map((i) => (
        <div key={i.id} className="card">
          <p><b>#{i.id} - {i.tip}</b></p>
          <p>Beneficiar: {i.beneficiar}</p>
          <p>Voluntar: {i.voluntar ? i.voluntar : "neatribuit"}</p>
          <p>Status: {i.status}</p>

          <button className="button" onClick={() => updateStatus(i.id, i.status)}>
            Actualizeaza status
          </button>

          {role === "admin" && (
            <button className="button danger" onClick={() => deleteInterventie(i.id)}>
              Sterge
            </button>
          )}
        </div>
      ))}

      {role === "voluntar" && visible.length === 0 && (
        <p>Nu ai interventii atribuite.</p>
      )}
    </>
  );
}
