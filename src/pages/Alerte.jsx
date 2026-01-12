import { useEffect, useState } from "react";
import { API } from "../api";

export default function Alerte({ showToast }) {
  const [text, setText] = useState("");
  const [list, setList] = useState([]);

  async function load() {
    try {
      const res = await fetch(`${API}/alerte`);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca alertele.", "error");
    }
  }

  async function send() {
    if (!text.trim()) {
      showToast("Completeaza mesajul de alerta!", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/alerte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaj: text }),
      });

      if (!res.ok) {
        showToast("Eroare la trimitere alerta.", "error");
        return;
      }

      showToast("Alerta trimisa!", "success");
      setText("");
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
      <h1>Alerta caz critic</h1>

      <div className="card">
        <label>Mesaj alerta</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <button className="button" onClick={send}>
          Trimite alerta
        </button>
      </div>

      {list.map((a) => (
        <div key={a.id} className="card">
          <p>
            <b>Alerta #{a.id}</b>
          </p>
          <p>{a.mesaj}</p>
        </div>
      ))}
    </>
  );
}
