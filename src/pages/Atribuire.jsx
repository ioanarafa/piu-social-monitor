import { useEffect, useState } from "react";
import { API } from "../api";

export default function Atribuire({ showToast }) {
  const [interventii, setInterventii] = useState([]);
  const [voluntari, setVoluntari] = useState([]);
  const [interventieId, setInterventieId] = useState("");
  const [voluntar, setVoluntar] = useState("");

  async function load() {
    try {
      const r1 = await fetch(`${API}/interventii`);
      const i = await r1.json();
      setInterventii(i);
      if (i.length) setInterventieId(i[0].id);

      const r2 = await fetch(`${API}/voluntari`);
      const v = await r2.json();
      setVoluntari(v);
      if (v.length) setVoluntar(v[0].nume);
    } catch {
      showToast("Eroare la incarcare date.", "error");
    }
  }

  async function assign() {
    try {
      const res = await fetch(`${API}/atribuiri`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interventieId, voluntar }),
      });

      if (!res.ok) {
        showToast("Eroare la atribuire.", "error");
        return;
      }

      showToast("Interventie atribuita!", "success");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h1>Atribuire cazuri</h1>

      <div className="card">
        <label>Interventie</label>
        <select value={interventieId} onChange={(e) => setInterventieId(e.target.value)}>
          {interventii.map((i) => (
            <option key={i.id} value={i.id}>
              #{i.id} - {i.titlu} ({i.beneficiar}) | {i.voluntar || "neatribuit"}
            </option>
          ))}
        </select>

        <label>Voluntar</label>
        <select value={voluntar} onChange={(e) => setVoluntar(e.target.value)}>
          {voluntari.map((v) => (
            <option key={v.id} value={v.nume}>{v.nume}</option>
          ))}
        </select>

        <button className="button" onClick={assign}>
          Asigneaza
        </button>
      </div>
    </>
  );
}
