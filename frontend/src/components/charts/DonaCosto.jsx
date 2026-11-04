import { mxn } from "../../services/formato.js";

/**
 * Dona que compara el monto recibido contra lo que se paga de más (extra).
 *
 * @param {{monto: number, extra: number}} props
 */
export default function DonaCosto({ monto, extra }) {
  const total = Math.max(monto + extra, 0.0001);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fMonto = monto / total;
  const fExtra = extra / total;

  const dashMonto = `${fMonto * circ} ${circ}`;
  const dashExtra = `${fExtra * circ} ${circ}`;
  const offsetExtra = -fMonto * circ;

  return (
    <div className="chart">
      <svg viewBox="0 0 140 140" className="dona" role="img"
           aria-label="Proporción entre monto e intereses">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={r} className="dona-track" />
          <circle
            cx="70"
            cy="70"
            r={r}
            className="dona-monto"
            strokeDasharray={dashMonto}
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            className="dona-extra"
            strokeDasharray={dashExtra}
            strokeDashoffset={offsetExtra}
          />
        </g>
        <text x="70" y="66" className="dona-centro-num">
          {Math.round(fExtra * 100)}%
        </text>
        <text x="70" y="84" className="dona-centro-lbl">
          es interés
        </text>
      </svg>
      <ul className="chart-legend">
        <li>
          <span className="dot dot-monto" /> Monto recibido {mxn(monto)}
        </li>
        <li>
          <span className="dot dot-extra" /> Pagas de más {mxn(extra)}
        </li>
      </ul>
    </div>
  );
}
