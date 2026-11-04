/**
 * Barra horizontal que muestra qué porcentaje del dinero libre se lleva el
 * pago. Cambia de color según el umbral (verde / amarillo / rojo).
 *
 * @param {{pct: number|null}} props
 */
export default function BarraLibre({ pct }) {
  if (pct == null) {
    return (
      <div className="chart">
        <p className="chart-nota">
          Agrega tu perfil para ver cuánto de tu dinero libre se lleva el pago.
        </p>
      </div>
    );
  }

  const ancho = Math.min(Math.max(pct, 0), 100);
  const nivel = pct >= 35 ? "alto" : pct >= 20 ? "medio" : "ok";

  return (
    <div className="chart">
      <div className="barra-head">
        <span>Pago vs. tu dinero libre</span>
        <strong className={`barra-pct ${nivel}`}>{Math.round(pct)}%</strong>
      </div>
      <div className="barra-track">
        <div className={`barra-fill ${nivel}`} style={{ width: `${ancho}%` }} />
        {/* marcas de umbral */}
        <span className="barra-marca" style={{ left: "20%" }} />
        <span className="barra-marca" style={{ left: "35%" }} />
      </div>
      <div className="barra-escala">
        <span>0%</span>
        <span>20%</span>
        <span>35%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
