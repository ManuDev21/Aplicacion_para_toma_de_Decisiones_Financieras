/** Lista de alertas devueltas por el análisis. */
export default function AlertList({ alertas }) {
  if (!alertas || alertas.length === 0) return null;
  return (
    <div className="card">
      <h3>Alertas</h3>
      {alertas.map((a) => (
        <div className={`alert ${a.nivel}`} key={a.codigo}>
          {a.mensaje}
        </div>
      ))}
    </div>
  );
}
