export default function Evaluare() {
  return (
    <>
      <h1>Evaluare progres beneficiar</h1>
      <div className="card">
        <select>
          <option>1 - Foarte slab</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5 - Foarte bun</option>
        </select>
        <textarea placeholder="Observatii" />
        <button className="button">Salveaza</button>
      </div>
    </>
  );
}
