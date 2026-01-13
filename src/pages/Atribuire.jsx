import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

export default function Atribuire({ showToast }) {
  const [interventii, setInterventii] = useState([]);
  const [voluntari, setVoluntari] = useState([]);

  const [interventieId, setInterventieId] = useState("");
  const [voluntarId, setVoluntarId] = useState("");

  async function loadData() {
    try {
      const ints = await apiGet("/interventii");
      const onlyNeatribuite = ints.filter((x) => !x.voluntarId);
      setInterventii(onlyNeatribuite);

      const v = await apiGet("/voluntari");
      setVoluntari(v);

      if (onlyNeatribuite.length && !interventieId) setInterventieId(onlyNeatribuite[0].id);
      if (v.length && !voluntarId) setVoluntarId(v[0].id);
    } catch {
      showToast("Eroare: nu pot incarca datele.", "error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function atribuie() {
    try {
      await apiSend("/atribuiri", "POST", {
        interventieId: Number(interventieId),
        voluntarId: Number(voluntarId),
      });

      showToast("Interventie atribuita!");
      loadData();
    } catch {
      showToast("Eroare la atribuire.", "error");
    }
  }

  return (
    <div>
      <h1>Atribuire cazuri</h1>

      <div className="card">
        <label>Interventie</label>
        <select value={interventieId} onChange={(e) => setInterventieId(e.target.value)}>
          {interventii.map((x) => (
            <option key={x.id} value={x.id}>
              #{x.id} - {x.tip} ({x.beneficiar})
            </option>
          ))}
        </select>

        <label>Voluntar</label>
        <select value={voluntarId} onChange={(e) => setVoluntarId(e.target.value)}>
          {voluntari.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nume}
            </option>
          ))}
        </select>

        <button className="button" onClick={atribuie} disabled={!interventii.length}>
          Asigneaza
        </button>

        {!interventii.length && (
          <p style={{ marginTop: 10, opacity: 0.8 }}>
            Nu exista interventii neatribuite. Creeaza unele in pagina <b>Interventii</b>.
          </p>
        )}
      </div>
    </div>
  );
}
