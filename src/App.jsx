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
  const [page, setPage] = useState("interventii");

  return (
    <div className="app">
      <div className="sidebar">
        <h2>PIU</h2>

        <button onClick={() => setPage("interventii")}>Interventii</button>
        <button onClick={() => setPage("beneficiari")}>Beneficiari</button>
        <button onClick={() => setPage("urgenta")}>Urgenta</button>
        <button onClick={() => setPage("livrari")}>Confirmare livrare</button>
        <button onClick={() => setPage("atribuire")}>Atribuire cazuri</button>
        <button onClick={() => setPage("vizite")}>Programare vizite</button>
        <button onClick={() => setPage("alerte")}>Alerte</button>
        <button onClick={() => setPage("evaluare")}>Evaluare progres</button>
      </div>

      <div className="content">
        {page === "interventii" && <Interventii />}
        {page === "beneficiari" && <Beneficiari />}
        {page === "urgenta" && <Urgenta />}
        {page === "livrari" && <Livrari />}
        {page === "atribuire" && <Atribuire />}
        {page === "vizite" && <Vizite />}
        {page === "alerte" && <Alerte />}
        {page === "evaluare" && <Evaluare />}
      </div>
    </div>
  );
}

export default App;
