import { useEffect, useState } from "react";
import { API } from "../api";

export default function Vizite({ showToast, role, voluntar }) {
  const [interventii, setInterventii] = useState([]);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");

  async function load() {
    const res = await fetch(`${API}/interventii`);
    const data = await res.json();

    const vizite = data.filter((i) => i.tip === "Vizita");

    const visible =
      role === "voluntar"
        ? vizite.filter((i) => i.voluntar === voluntar)
        : vizite;

    setInterventii(visible);
  }

  async function save() {
    if (!selected || !data || !ora) {
      showToast("Completeaza toate campurile!", "error");
      return;
    }

    await fetch(`${API}/interventii/${selected}/vizita`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataVizita: data, oraVizita: ora }),
    });

    showToast("Vizita programata!", "success");
    setSelected("");
    setData("");
    setOra("");
    load();
  }

  useEffect(() => {
    load();
  }, [role, voluntar]);

  return (
    <>
      <h1>Programare vizite</h1>

      <div className="card">
        <label>Interventie (Vizita)</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">-- selecteaza --</option>
          {interventii.map((i) => (
            <option key={i.id} value={i.id}>
              #{i.id} - {i.beneficiar} ({i.voluntar || "neatribuita"})
            </option>
          ))}
        </select>

        <label>Data</label>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />

        <label>Ora</label>
        <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} />

        <button className="button" onClick={save}>
          Salveaza
        </button>
      </div>

      <div className="list">
        {interventii
          .filter((i) => i.dataVizita)
          .map((i) => (
            <div key={i.id} className="card">
              <b>{i.beneficiar}</b>
              <p>{i.dataVizita} – {i.oraVizita}</p>
              <p>Voluntar: {i.voluntar || "-"}</p>
            </div>
          ))}
      </div>
    </>
  );
}
