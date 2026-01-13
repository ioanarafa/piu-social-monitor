import { useEffect, useState } from "react";
import "./App.css";

import Interventii from "./pages/Interventii";
import Beneficiari from "./pages/Beneficiari";
import Voluntari from "./pages/Voluntari";
import Atribuire from "./pages/Atribuire";
import Urgenta from "./pages/Urgenta";
import Vizite from "./pages/Vizite";
import Evaluare from "./pages/Evaluare";

import { apiGet } from "./api";

function App() {
  const [role, setRole] = useState("admin"); // admin | voluntar
  const [page, setPage] = useState("interventii");

  const [toast, setToast] = useState({ text: "", type: "" });

  const [voluntari, setVoluntari] = useState([]);
  const [selectedVoluntarId, setSelectedVoluntarId] = useState(null);

  function showToast(text, type = "success") {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 2500);
  }

  async function loadVoluntari() {
    try {
      const data = await apiGet("/voluntari");
      setVoluntari(data);
      if (!selectedVoluntarId && data.length) setSelectedVoluntarId(data[0].id);
    } catch {
      showToast("Eroare: nu pot incarca voluntarii.", "error");
    }
  }

  useEffect(() => {
    loadVoluntari();
  }, []);

  useEffect(() => {
    if (role === "voluntar" && !selectedVoluntarId && voluntari.length) {
      setSelectedVoluntarId(voluntari[0].id);
    }
  }, [role, selectedVoluntarId, voluntari]);

  function canSee(p) {
    if (role === "admin") return true;
    return !["atribuire", "voluntari"].includes(p);
  }

  function navBtn(key, label) {
    if (!canSee(key)) return null;
    return (
      <button
        key={key}
        className={page === key ? "nav active" : "nav"}
        onClick={() => setPage(key)}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>PIU</h2>

        <label className="smallLabel">Rol</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="voluntar">Voluntar</option>
        </select>

        {role === "voluntar" && (
          <>
            <label className="smallLabel">Voluntar</label>
            <select
              value={selectedVoluntarId ?? ""}
              onChange={(e) => setSelectedVoluntarId(Number(e.target.value))}
            >
              {voluntari.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nume}
                </option>
              ))}
            </select>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          {navBtn("interventii", "Interventii")}
          {navBtn("beneficiari", "Beneficiari")}
          {role === "admin" && navBtn("voluntari", "Voluntari")}
          {role === "admin" && navBtn("atribuire", "Atribuire cazuri")}
          {navBtn("urgenta", "Urgenta")}
          {navBtn("vizite", "Programare vizite")}
          {navBtn("evaluare", "Evaluare progres")}
        </div>
      </div>

      <div className="content">
        {toast.text && <div className={`toast ${toast.type}`}>{toast.text}</div>}

        {page === "interventii" && (
          <Interventii
            showToast={showToast}
            role={role}
            selectedVoluntarId={selectedVoluntarId}
          />
        )}

        {page === "beneficiari" && (
          <Beneficiari showToast={showToast} role={role} />
        )}

        {page === "voluntari" && role === "admin" && (
          <Voluntari showToast={showToast} onChanged={loadVoluntari} />
        )}

        {page === "atribuire" && role === "admin" && (
          <Atribuire showToast={showToast} />
        )}

        {page === "urgenta" && (
          <Urgenta
            showToast={showToast}
            role={role}
            selectedVoluntarId={selectedVoluntarId}
          />
        )}

        {page === "vizite" && (
          <Vizite
            showToast={showToast}
            role={role}
            selectedVoluntarId={selectedVoluntarId}
          />
        )}

        {page === "evaluare" && (
          <Evaluare
            showToast={showToast}
            role={role}
            selectedVoluntarId={selectedVoluntarId}
          />
        )}
      </div>
    </div>
  );
}

export default App;
