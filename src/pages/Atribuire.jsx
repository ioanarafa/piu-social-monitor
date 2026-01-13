import { useEffect, useState } from "react";
import { API } from "../api";

export default function Atribuire({ showToast }) {
  const [interventii, setInterventii] = useState([]);
  const [voluntari, setVoluntari] = useState([]);

  const [interventieId, setInterventieId] = useState("");
  const [voluntarId, setVoluntarId] = useState("");

  async function load() {
    try {
      const r1 = await fetch(`${API}/interventii`);
      const i = await r1.json();
      setInterventii(i);

      // default: prima interventie neatribuita, altfel prima
      const ne = i.find((x) => !x.voluntarId);
      setInterventieId(String((ne || i[0] || {}).id || ""));

      const r2 = await fetch(`${API}/voluntari`);
      const v = await r2.json();
      setVoluntari(v);
      setVoluntarId(String((v[0] || {}).id || ""));
    } catch {
      showToast("Eroare la incarcare date.", "error");
    }
  }

  useEffect(() => { load(); }, []);

  async function assign() {
    if (!interventieId || !voluntarId) {
      showToast("Alege interventie si voluntar.", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/atribuiri`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interventieId: Number(interventieId), voluntarId: Number(voluntarId) }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Eroare la atribuire.", "error");
        return;
      }

      showToast("Interventie atribuita!", "success");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  return (
    <>
      <h1>Atribuire cazuri</h1>

      <div className="card">
        <label>Interventie</label>
        <select value={interventieId} onChange={(e) => setInterventieId(e.target.value)}>
          {interventii.map((i) => (
            <option key={i.id} value={i.id}>
              #{i.id} - {i.tip} ({i.beneficiar}) | {i.voluntar ? i.voluntar : "neatribuit"}
            </option>
          ))}
        </select>

        <label>Voluntar</label>
        <select value={voluntarId} onChange={(e) => setVoluntarId(e.target.value)}>
          {voluntari.map((v) => (
            <option key={v.id} value={v.id}>{v.nume}</option>
          ))}
        </select>

        <button className="button" onClick={assign}>Asigneaza</button>
      </div>

      <p className="hint">
        Tip: creeaza interventii in pagina <b>Interventii</b>, apoi vino aici sa le atribui.
      </p>
    </>
  );
}
