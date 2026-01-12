import { useEffect, useState } from "react";
import { API } from "../api";

export default function Evaluare({ showToast }) {
  const [beneficiar, setBeneficiar] = useState("Pop Maria");
  const [scor, setScor] = useState("1");
  const [observatii, setObservatii] = useState("");
  const [list, setList] = useState([]);

  async function load() {
    try {
      const res = await fetch(`${API}/evaluari`);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca evaluarile.", "error");
    }
  }

  async function save() {
    if (!beneficiar.trim() || !scor) {
      showToast("Completeaza beneficiar si scor!", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/evaluari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiar, scor, observatii }),
      });

      if (!res.ok) {
        showToast("Eroare la salvare evaluare.", "error");
        return;
      }

      showToast("Evaluare salvata!", "success");
      setObservatii("");
      load();
    } catch {
      showToast("Eroare: backend indisponibil.", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h1>Evaluare progres beneficiar</h1>

      <div className="card">
        <label>Beneficiar</label>
        <input value={beneficiar} onChange={(e) => setBeneficiar(e.target.value)} />

        <label>Scor</label>
        <select value={scor} onChange={(e) => setScor(e.target.value)}>
          <option value="1">1 - Foarte slab</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5 - Foarte bun</option>
        </select>

        <label>Observatii</label>
        <textarea value={observatii} onChange={(e) => setObservatii(e.target.value)} />

        <button className="button" onClick={save}>
          Salveaza
        </button>
      </div>

      {list.map((e) => (
        <div key={e.id} className="card">
          <p>
            <b>{e.beneficiar}</b> | scor: {e.scor}
          </p>
          <p>{e.observatii}</p>
        </div>
      ))}
    </>
  );
}
