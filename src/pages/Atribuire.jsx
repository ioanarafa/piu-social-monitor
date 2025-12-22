import { voluntari } from "../data";

export default function Atribuire() {
  return (
    <>
      <h1>Atribuire cazuri</h1>
      <div className="card">
        <select>
          {voluntari.map(v => (
            <option key={v.id}>{v.nume}</option>
          ))}
        </select>
        <button className="button">Asigneaza</button>
      </div>
    </>
  );
}
