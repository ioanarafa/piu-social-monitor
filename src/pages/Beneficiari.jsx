import { useEffect, useState } from "react";
import { API } from "../api";

export default function Beneficiari({ showToast }) {
  const [list, setList] = useState([]);
  const [categorie, setCategorie] = useState("");

  async function load(cat) {
    try {
      const url = cat
        ? `${API}/beneficiari?categorie=${encodeURIComponent(cat)}`
        : `${API}/beneficiari`;

      const res = await fetch(url);
      const data = await res.json();
      setList(data);
    } catch {
      showToast("Eroare: nu pot incarca beneficiarii.", "error");
    }
  }

  useEffect(() => {
    load("");
  }, []);

  function onChangeCat(e) {
    const val = e.target.value;
    setCategorie(val);
    load(val);
  }

  return (
    <>
      <h1>Beneficiari</h1>

      <div className="card">
        <label>Filtru categorie</label>
        <select value={categorie} onChange={onChangeCat}>
          <option value="">Toate</option>
          <option value="Pensionar">Pensionar</option>
          <option value="Handicap">Handicap</option>
        </select>
      </div>

      {list.map((b) => (
        <div key={b.id} className="card">
          <p>
            <b>{b.nume}</b>
          </p>
          <p>Categorie: {b.categorie}</p>
        </div>
      ))}
    </>
  );
}
