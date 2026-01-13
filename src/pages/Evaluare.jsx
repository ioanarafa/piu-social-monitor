import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

export default function Evaluare({ showToast, role, selectedVoluntarId }) {
  const [beneficiari, setBeneficiari] = useState([]);
  const [voluntari, setVoluntari] = useState([]);

  const [scor, setScor] = useState(8);
  const [observatii, setObservatii] = useState("");

  const [targetId, setTargetId] = useState(""); 
  const [items, setItems] = useState([]);

  async function loadLists() {
    const b = await apiGet("/beneficiari");
    setBeneficiari(b);

    const v = await apiGet("/voluntari");
    setVoluntari(v);

    if (role === "admin" && v.length && !targetId) setTargetId(v[0].id);
    if (role === "voluntar" && b.length && !targetId) setTargetId(b[0].id);
  }

  async function loadEvaluari() {
    if (role === "admin") {
      setItems(await apiGet("/evaluari/voluntari"));
    } else {
      const path = selectedVoluntarId
        ? `/evaluari/beneficiari?voluntarId=${selectedVoluntarId}`
        : "/evaluari/beneficiari";
      setItems(await apiGet(path));
    }
  }

  async function loadAll() {
    try {
      await loadLists();
      await loadEvaluari();
    } catch {
      showToast("Eroare: nu pot incarca evaluarile.", "error");
    }
  }

  useEffect(() => {
    loadAll();
  }, [role, selectedVoluntarId]);

  async function send() {
    try {
      if (role === "admin") {
        await apiSend("/evaluari/voluntari", "POST", {
          voluntarId: Number(targetId),
          scor: Number(scor),
          observatii,
        });
      } else {
        await apiSend("/evaluari/beneficiari", "POST", {
          beneficiarId: Number(targetId),
          voluntarId: Number(selectedVoluntarId),
          scor: Number(scor),
          observatii,
        });
      }

      setObservatii("");
      showToast("Evaluare salvata!");
      loadEvaluari();
    } catch {
      showToast("Eroare la salvare evaluare.", "error");
    }
  }

  return (
    <div>
      <h1>Evaluare progres</h1>

      <div className="card">
        {role === "admin" ? (
          <>
            <h3>Admin evalueaza voluntari</h3>
            <label>Voluntar</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              {voluntari.map((v) => (
                <option key={v.id} value={v.id}>{v.nume}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <h3>Voluntar evalueaza beneficiari</h3>
            <label>Beneficiar</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              {beneficiari.map((b) => (
                <option key={b.id} value={b.id}>{b.nume}</option>
              ))}
            </select>
          </>
        )}

        <label>Scor (1-10)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={scor}
          onChange={(e) => setScor(e.target.value)}
        />

        <label>Observatii (optional)</label>
        <textarea value={observatii} onChange={(e) => setObservatii(e.target.value)} />

        <button className="button" onClick={send}>Trimite evaluare</button>
      </div>

      <div className="list">
        {items.map((x) => (
          <div className="card" key={x.id}>
            {role === "admin" ? (
              <>
                <h3>{x.voluntar}</h3>
                <div>Scor: {x.scor}</div>
                {x.observatii && <div>Obs: {x.observatii}</div>}
                <div style={{ opacity: 0.8 }}>{x.createdAt}</div>
              </>
            ) : (
              <>
                <h3>{x.beneficiar}</h3>
                <div>Scor: {x.scor}</div>
                {x.observatii && <div>Obs: {x.observatii}</div>}
                <div style={{ opacity: 0.8 }}>
                  de la: {x.voluntar} | {x.createdAt}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
