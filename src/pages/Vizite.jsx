import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

export default function Vizite({ showToast, role, selectedVoluntarId }) {
  const [beneficiari, setBeneficiari] = useState([]);
  const [voluntari, setVoluntari] = useState([]);

  const [beneficiarId, setBeneficiarId] = useState("");
  const [voluntarId, setVoluntarId] = useState("");
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");

  const [items, setItems] = useState([]);

  async function loadLists() {
    const b = await apiGet("/beneficiari");
    setBeneficiari(b);
    if (!beneficiarId && b.length) setBeneficiarId(b[0].id);

    const v = await apiGet("/voluntari");
    setVoluntari(v);

    if (role === "voluntar") {
      setVoluntarId(selectedVoluntarId ?? "");
    } else {
      if (!voluntarId && v.length) setVoluntarId(v[0].id);
    }
  }

  async function loadVizite() {
    const path =
      role === "voluntar" && selectedVoluntarId
        ? `/vizite?voluntarId=${selectedVoluntarId}`
        : "/vizite";
    setItems(await apiGet(path));
  }

  async function loadAll() {
    try {
      await loadLists();
      await loadVizite();
    } catch {
      showToast("Eroare: nu pot incarca vizitele.", "error");
    }
  }

  useEffect(() => {
    loadAll();
  }, [role, selectedVoluntarId]);

  async function create() {
    try {
      const vid = role === "voluntar" ? Number(selectedVoluntarId) : Number(voluntarId);

      await apiSend("/vizite", "POST", {
        beneficiarId: Number(beneficiarId),
        voluntarId: vid,
        data,
        ora,
      });

      showToast("Vizita programata!");
      setData("");
      setOra("");
      loadVizite();
    } catch {
      showToast("Eroare la programare vizita.", "error");
    }
  }

  async function del(id) {
    try {
      await apiSend(`/vizite/${id}`, "DELETE");
      showToast("Vizita stearsa!");
      loadVizite();
    } catch {
      showToast("Eroare la stergere vizita.", "error");
    }
  }

  return (
    <div>
      <h1>Programare vizite</h1>

      <div className="card">
        <label>Beneficiar</label>
        <select value={beneficiarId} onChange={(e) => setBeneficiarId(e.target.value)}>
          {beneficiari.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nume} ({b.categorie})
            </option>
          ))}
        </select>

        {role === "admin" ? (
          <>
            <label>Voluntar</label>
            <select value={voluntarId} onChange={(e) => setVoluntarId(e.target.value)}>
              {voluntari.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nume}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p style={{ opacity: 0.8 }}>
            Vizita va fi programata pentru voluntarul selectat in sidebar.
          </p>
        )}

        <label>Data</label>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />

        <label>Ora</label>
        <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} />

        <button className="button" onClick={create}>Programeaza</button>
      </div>

      <div className="list">
        {items.map((x) => (
          <div className="card" key={x.id}>
            <h3>{x.beneficiar}</h3>
            <div>{x.data} {x.ora}</div>
            <div>Voluntar: {x.voluntar}</div>

            {role === "admin" && (
              <button
                className="button"
                style={{ marginTop: 10, background: "#e74c3c" }}
                onClick={() => del(x.id)}
              >
                Sterge
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
