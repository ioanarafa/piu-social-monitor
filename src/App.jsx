import { useEffect, useState } from "react";

import Interventii from "./pages/Interventii";
import Beneficiari from "./pages/Beneficiari";
import Voluntari from "./pages/Voluntari";
import Urgenta from "./pages/Urgenta";
import Livrari from "./pages/Livrari";
import Atribuire from "./pages/Atribuire";
import Vizite from "./pages/Vizite";
import Alerte from "./pages/Alerte";
import Evaluare from "./pages/Evaluare";
import { API } from "./api";

function App() {
  const [role, setRole] = useState("admin"); // admin | voluntar
  const [page, setPage] = useState("interventii");

  const [voluntari, setVoluntari] = useState([]);
  const [voluntarId, setVoluntarId] = useState(null); // pentru rol voluntar

  const [toast, setToast] = useState({ text: "", type: "" });

  function showToast(text, type = "success") {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 2500);
  }

  function navClass(p) {
    return page === p ? "navBtn active" : "navBtn";
  }

  async function loadVoluntari() {
    try {
      const res = await fetch(`${API}/voluntari`);
      const data = await res.json();
      setVoluntari(data);

      if (!voluntarId && data.length) {
        setVoluntarId(data[0].id);
      }
    } catch {
      showToast("Eroare: nu pot incarca voluntarii.", "error");
    }
  }

  useEffect(() => {
    loadVoluntari();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeRole(newRole) {
    setRole(newRole);

    if (newRole === "voluntar") {
      setPage("interventii");
      if (!voluntarId && voluntari.length) setVoluntarId(voluntari[0].id);
      showToast("Rol: Voluntar", "success");
    } else {
      showToast("Rol: Admin", "success");
    }

    if (newRole === "voluntar" && page === "atribuire") setPage("interventii");
    if (newRole === "voluntar" && page === "voluntari") setPage("interventii");
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>PIU</h2>

        {/* ROL */}
        <div className="roleBox">
          <label className="roleLabel">Rol</label>
          <select
            className="roleSelect"
            value={role}
            onChange={(e) => changeRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="voluntar">Voluntar</option>
          </select>
        </div>

        {/* SELECT VOLUNTAR (doar pe rol voluntar) */}
        {role === "voluntar" && (
          <div className="roleBox">
            <label className="roleLabel">Voluntar</label>
            <select
              className="roleSelect"
              value={voluntarId ?? ""}
              onChange={(e) => setVoluntarId(Number(e.target.value))}
            >
              {voluntari.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nume}
                </option>
              ))}
            </select>
          </div>
        )}

        <button className={navClass("interventii")} onClick={() => setPage("interventii")}>
          Interventii
        </button>
        <button className={navClass("beneficiari")} onClick={() => setPage("beneficiari")}>
          Beneficiari
        </button>

        {/* Admin only: Voluntari + Atribuire */}
        {role === "admin" && (
          <>
            <button className={navClass("voluntari")} onClick={() => setPage("voluntari")}>
              Voluntari
            </button>
            <button className={navClass("atribuire")} onClick={() => setPage("atribuire")}>
              Atribuire cazuri
            </button>
          </>
        )}

        <button className={navClass("urgenta")} onClick={() => setPage("urgenta")}>
          Urgenta
        </button>
        <button className={navClass("livrari")} onClick={() => setPage("livrari")}>
          Confirmare livrare
        </button>
        <button className={navClass("vizite")} onClick={() => setPage("vizite")}>
          Programare vizite
        </button>
        <button className={navClass("alerte")} onClick={() => setPage("alerte")}>
          Alerte
        </button>
        <button className={navClass("evaluare")} onClick={() => setPage("evaluare")}>
          Evaluare progres
        </button>
      </div>

      <div className="content">
        {toast.text && <div className={`toast ${toast.type}`}>{toast.text}</div>}

        {page === "interventii" && (
          <Interventii
            showToast={showToast}
            role={role}
            voluntarId={voluntarId}
            refreshVoluntari={loadVoluntari}
          />
        )}
        {page === "beneficiari" && (
          <Beneficiari showToast={showToast} role={role} />
        )}
        {page === "voluntari" && role === "admin" && (
          <Voluntari showToast={showToast} refreshVoluntari={loadVoluntari} />
        )}
        {page === "atribuire" && role === "admin" && (
          <Atribuire showToast={showToast} />
        )}

        {page === "urgenta" && <Urgenta showToast={showToast} />}
        {page === "livrari" && <Livrari showToast={showToast} role={role} voluntar={voluntari.find(v=>v.id===voluntarId)?.nume || ""} />}
        {page === "vizite" && <Vizite showToast={showToast} role={role} voluntar={voluntari.find(v=>v.id===voluntarId)?.nume || ""} />}
        {page === "alerte" && <Alerte showToast={showToast} />}
        {page === "evaluare" && <Evaluare showToast={showToast} />}
      </div>
    </div>
  );
}

export default App;
