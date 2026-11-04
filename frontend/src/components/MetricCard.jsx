/** Tarjeta con una cuadrícula de métricas (etiqueta + valor). */
export default function MetricCard({ titulo, metricas }) {
  return (
    <div className="card">
      {titulo && <h3>{titulo}</h3>}
      <div className="metric-grid">
        {metricas.map((m) => (
          <div className="metric" key={m.label}>
            <div className="label">{m.label}</div>
            <div className="value">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
