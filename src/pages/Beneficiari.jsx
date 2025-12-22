import { beneficiari } from "../data";

export default function Beneficiari() {
  return (
    <>
      <h1>Beneficiari</h1>
      {beneficiari.map(b => (
        <div key={b.id} className="card">
          <b>{b.nume}</b>
          <p>Categorie: {b.categorie}</p>
        </div>
      ))}
    </>
  );
}
