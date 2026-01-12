import { useEffect, useState } from "react";
import { API } from "../api";

export default function Vizite({ showToast, role, voluntar }) {
  const [beneficiar, setBeneficiar] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [list, setList] = useState([]);

  async function load() {
    try {
      const res = await fetch(`${API}/vizite`);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca vizitele.", "error");
    }
  }

  async function save() {
    if (!beneficiar || !date || !time) {
      showToast("Completeaza toate campurile!", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/vizite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiar, date, time, voluntar }),
      });

      if (!res.ok) {
        showToast("Eroare la salvare vizita.", "error");
        return;
      }

      showToast("Vizita salvata!", "success");
      setBeneficiar("");
      setDate("");
      setTime("");
      load();
    } catch {
      showToast("Backend indisponibil.", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible =
    role === "voluntar"
      ? list.filter((v) => v.voluntar === voluntar)
      : list;

  return (
    <>
      <h1>Programare vizite</h1>

      <div className="card">
        <label>Beneficiar</label>
        <input value={beneficiar} onChange={(e) => setBeneficiar(e.target.value)} />

        <label>Data</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Ora</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <button className="button" onClick={save}>
          Salveaza
        </button>
      </div>

      {visible.map((v) => (
        <div key={v.id} className="card">
          <p><b>{v.beneficiar}</b></p>
          <p>{v.date} - {v.time}</p>
          <p>Voluntar: {v.voluntar}</p>
        </div>
      ))}
    </>
  );
}
