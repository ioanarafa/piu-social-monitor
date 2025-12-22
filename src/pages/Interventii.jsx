import { interventii } from "../data";

export default function Interventii() {
  return (
    <>
      <h1>Monitorizare interventii</h1>
      {interventii.map(i => (
        <div key={i.id} className="card">
          <b>{i.titlu}</b>
          <p>Beneficiar: {i.beneficiar}</p>
          <p>Status: {i.status}</p>
          <button className="button">Actualizeaza status</button>
        </div>
      ))}
    </>
  );
}
