import { useEffect, useState } from "react";
import { API } from "../api";

export default function Urgenta({ showToast, role, voluntarId }) {
  const [text, setText] = useState("");
  const [list, setList] = useState([]);

  async function load() {
    try {
      const url =
        role === "voluntar" && voluntarId
          ? `${API}/urgente?voluntarId=${voluntarId}`
          : `${API}/urgente`;

      const res = await fetch(url);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca urgentele.", "error");
    }
  }

  async function send() {
    if (!text.trim()) {
      showToast("Completeaza descrierea!", "error");
      return;
    }
    if (!voluntarId) {
      showToast("Selecteaza voluntarul!", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/urgente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaj: text, voluntarId }),
      });

      if (!res.ok) {
        showToast("Eroare la trimitere urgenta.", "error");
        return;
      }

      showToast("Urgenta trimisa catre admin!", "success");
      setText("");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, voluntarId]);

  return (
    <>
      <h1>Urgenta</h1>

      {role === "voluntar" ? (
        <div className="card">
          <label>Raportare urgenta</label>
          <textarea
            placeholder="Descriere situatie urgenta..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="button" onClick={send}>
            Trimite
          </button>
          <p className="hint">
            Adminul va vedea toate urgentele trimise de voluntari.
          </p>
        </div>
      ) : (
        <div className="card">
          <p className="hint">
            (Admin) Aici vezi toate urgentele raportate de voluntari.
          </p>
        </div>
      )}

      <div className="list">
        {list.length === 0 ? (
          <p>Nicio urgenta inregistrata.</p>
        ) : (
          list.map((u) => (
            <div key={u.id} className="card">
              <p>
                <b>{u.voluntar || "Voluntar"}</b> • {u.createdAt}
              </p>
              <p>{u.mesaj}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
