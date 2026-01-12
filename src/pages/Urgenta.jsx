import { useState } from "react";
import { API } from "../api";

export default function Urgenta({ showToast }) {
  const [text, setText] = useState("");

  async function send() {
    if (!text.trim()) {
      showToast("Completeaza descrierea!", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/urgente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriere: text }),
      });

      if (!res.ok) {
        showToast("Eroare la trimitere raport.", "error");
        return;
      }

      showToast("Raport trimis cu succes!", "success");
      setText("");
    } catch {
      showToast("Eroare: backend indisponibil.", "error");
    }
  }

  return (
    <>
      <h1>Raportare urgenta</h1>

      <div className="card">
        <label>Descriere situatie</label>
        <textarea
          placeholder="Descriere situatie"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="button" onClick={send}>
          Trimite raport
        </button>
      </div>
    </>
  );
}
