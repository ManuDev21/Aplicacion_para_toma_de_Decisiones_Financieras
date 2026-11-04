import { mxn } from "../../services/formato.js";

/**
 * Línea del saldo pendiente mes a mes, usando la tasa mensual estimada.
 * Permite ver cómo baja la deuda a lo largo del plazo.
 *
 * @param {{neto: number, pago: number, plazo: number, tasaMensualPct: number}} props
 */
export default function LineaSaldo({ neto, pago, plazo, tasaMensualPct }) {
  const r = (tasaMensualPct || 0) / 100;

  // Calcula el saldo al final de cada mes.
  const saldos = [neto];
  let saldo = neto;
  for (let i = 0; i < plazo; i++) {
    saldo = saldo + saldo * r - pago;
    saldos.push(Math.max(saldo, 0));
  }

  const w = 320;
  const h = 150;
  const padX = 8;
  const padY = 10;
  const maxSaldo = Math.max(...saldos, 1);
  const n = saldos.length - 1 || 1;

  const puntos = saldos.map((s, i) => {
    const x = padX + (i / n) * (w - padX * 2);
    const y = padY + (1 - s / maxSaldo) * (h - padY * 2);
    return [x, y];
  });

  const d = puntos
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  // Área bajo la curva.
  const dArea =
    `${d} L${puntos[puntos.length - 1][0].toFixed(1)} ${h - padY} ` +
    `L${puntos[0][0].toFixed(1)} ${h - padY} Z`;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${w} ${h}`} className="linea" role="img"
           aria-label="Saldo pendiente mes a mes">
        <defs>
          <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="grad-top" />
            <stop offset="100%" className="grad-bottom" />
          </linearGradient>
        </defs>
        <path d={dArea} className="linea-area" fill="url(#gradSaldo)" />
        <path d={d} className="linea-path" />
        {puntos.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" className="linea-dot" />
        ))}
      </svg>
      <div className="chart-foot">
        <span>Mes 0: {mxn(neto)}</span>
        <span>Mes {plazo}: {mxn(saldos[saldos.length - 1])}</span>
      </div>
    </div>
  );
}
