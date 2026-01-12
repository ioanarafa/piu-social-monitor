import { useState } from "react";

import Interventii from "./pages/Interventii";
import Beneficiari from "./pages/Beneficiari";
import Urgenta from "./pages/Urgenta";
import Livrari from "./pages/Livrari";
import Atribuire from "./pages/Atribuire";
import Vizite from "./pages/Vizite";
import Alerte from "./pages/Alerte";
import Evaluare from "./pages/Evaluare";

function App() {
  const [role, setRole] = useState("admin");        // admin | voluntar
  const [voluntar, setVoluntar] = useState("Ana Pop"); // Ana Pop | Mihai Rusu
  const [page, setPage] = useState("interventii");

  const [toast, setToast] = useState({ text: "", type: "" });

  function showToast(text, type = "success") {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 2500);
  }

  function navClass(p) {
    return page === p ? "navBtn active" : "navBtn";
  }

  function changeRole(newRole) {
    setRole(newRole);

    // daca devii voluntar, te duce pe interventii si iti selecteaza automat un voluntar
    if (newRole === "voluntar") {
      setVoluntar("Ana Pop");
      setPage("interventii");
      showToast("Rol: Voluntar (Ana Pop)", "success");
    } else {
      showToast("Rol: Admin", "success");
    }

    // daca erai pe Atribuire si treci pe voluntar, nu ai voie acolo
    if (newRole === "voluntar" && page === "atribuire") {
      setPage("interventii");
    }
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

        {/* VOLUNTAR (apare doar pe rol voluntar) */}
        {role === "voluntar" && (
          <div className="roleBox">
            <label className="roleLabel">Voluntar</label>
            <select
              className="roleSelect"
              value={voluntar}
              onChange={(e) => {
                setVoluntar(e.target.value);
                showToast(`Voluntar: ${e.target.value}`, "success");
              }}
            >
              <option value="Ana Pop">Ana Pop</option>
              <option value="Mihai Rusu">Mihai Rusu</option>
            </select>
          </div>
        )}

        <button className={navClass("interventii")} onClick={() => setPage("interventii")}>
          Interventii
        </button>
        <button className={navClass("beneficiari")} onClick={() => setPage("beneficiari")}>
          Beneficiari
        </button>
        <button className={navClass("urgenta")} onClick={() => setPage("urgenta")}>
          Urgenta
        </button>
        <button className={navClass("livrari")} onClick={() => setPage("livrari")}>
          Confirmare livrare
        </button>

        {/* DOAR ADMIN */}
        {role === "admin" && (
          <button className={navClass("atribuire")} onClick={() => setPage("atribuire")}>
            Atribuire cazuri
          </button>
        )}

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
          <Interventii showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "beneficiari" && (
          <Beneficiari showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "urgenta" && (
          <Urgenta showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "livrari" && (
          <Livrari showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "atribuire" && role === "admin" && (
          <Atribuire showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "vizite" && (
          <Vizite showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "alerte" && (
          <Alerte showToast={showToast} role={role} voluntar={voluntar} />
        )}
        {page === "evaluare" && (
          <Evaluare showToast={showToast} role={role} voluntar={voluntar} />
        )}
      </div>
    </div>
  );
}

export default App;
