import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

const TIPURI = ["Livrare alimente", "Insotire pe strada", "Ajutor general"];
const STATUSURI = ["Preluata", "In curs", "Finalizata"];

function nextStatus(current) {
  const idx = STATUSURI.indexOf(current);
  if (idx === -1) return "Preluata";
  return STATUSURI[(idx + 1) % STATUSURI.length];
}

export default function Interventii({ showToast, role, selectedVoluntarId }) {
  const [items, setItems] = useState([]);
  const [beneficiari, setBeneficiari] = useState([]);

  const [tip, setTip] = useState(TIPURI[0]);
  const [beneficiarId, setBeneficiarId] = useState("");
  const [descriere, setDescriere] = useState("");

  async function loadAll() {
    try {
      const b = await apiGet("/beneficiari");
      setBeneficiari(b);
      if (!beneficiarId && b.length) setBeneficiarId(b[0].id);

      const path =
        role === "voluntar" && selectedVoluntarId
          ? `/interventii?voluntarId=${selectedVoluntarId}`
          : "/interventii";

      const data = await apiGet(path);
      setItems(data);
    } catch {
      showToast("Eroare: nu pot incarca interventiile.", "error");
    }
  }

  useEffect(() => {
    loadAll();
  }, [role, selectedVoluntarId]);

  async function createInterventie() {
    try {
      await apiSend("/interventii", "POST", {
        tip,
        beneficiarId: Number(beneficiarId),
        descriere,
      });
      setDescriere("");
      showToast("Interventie creata!");
      loadAll();
    } catch {
      showToast("Eroare la creare interventie.", "error");
    }
  }

  async function updateStatus(id, currentStatus) {
    try {
      const ns = nextStatus(currentStatus);
      await apiSend(`/interventii/${id}/status`, "PATCH", { status: ns });
      showToast("Status actualizat!");
      loadAll();
    } catch {
      showToast("Eroare la status.", "error");
    }
  }

  async function removeItem(id) {
    try {
      await apiSend(`/interventii/${id}`, "DELETE");
      showToast("Interventie stearsa!");
      loadAll();
    } catch {
      showToast("Eroare la stergere.", "error");
    }
  }

  return (
    <div>
      <h1>Interventii</h1>

      {role === "admin" && (
        <div className="card">
          <h3>Creeaza interventie</h3>

          <label>Tip</label>
          <select value={tip} onChange={(e) => setTip(e.target.value)}>
            {TIPURI.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label>Beneficiar</label>
          <select
            value={beneficiarId}
            onChange={(e) => setBeneficiarId(e.target.value)}
          >
            {beneficiari.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nume} ({b.categorie})
              </option>
            ))}
          </select>

          <label>Descriere (optional)</label>
          <input
            value={descriere}
            onChange={(e) => setDescriere(e.target.value)}
            placeholder="ex: pachet saptamanal"
          />

          <button className="button" onClick={createInterventie}>
            Creeaza
          </button>
        </div>
      )}

      <div className="list">
        {items.length === 0 && (
          <div className="card">
            {role === "voluntar"
              ? "Nu ai interventii atribuite."
              : "Nu exista interventii."}
          </div>
        )}

        {items.map((x) => (
          <div className="card" key={x.id}>
            <h3>
              #{x.id} - {x.tip}
            </h3>
            <div>Beneficiar: {x.beneficiar}</div>
            <div>Voluntar: {x.voluntar ?? "Neatribuit"}</div>
            <div>Status: {x.status}</div>
            {x.descriere && <div>Descriere: {x.descriere}</div>}

            <div style={{ marginTop: 10 }}>
              {(role === "admin" || role === "voluntar") && x.voluntar && (
                <button
                  className="button"
                  onClick={() => updateStatus(x.id, x.status)}
                >
                  Actualizeaza status
                </button>
              )}

              {role === "admin" && (
                <button
                  className="button"
                  style={{ marginLeft: 10, background: "#e74c3c" }}
                  onClick={() => removeItem(x.id)}
                >
                  Sterge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
