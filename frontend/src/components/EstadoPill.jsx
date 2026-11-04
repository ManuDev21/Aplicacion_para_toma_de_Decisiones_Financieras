import { IconCheck, IconInfo } from "./icons.jsx";

/**
 * Pastilla de estado que da feedback en cada evento de cálculo.
 *
 * @param {{estado: "inactivo"|"calculando"|"listo"|"error"}} props
 */
export default function EstadoPill({ estado }) {
  if (estado === "calculando") {
    return (
      <span className="pill pill-calc">
        <span className="spinner" /> Calculando…
      </span>
    );
  }
  if (estado === "listo") {
    return (
      <span className="pill pill-ok">
        <IconCheck width={14} height={14} /> Actualizado
      </span>
    );
  }
  if (estado === "error") {
    return (
      <span className="pill pill-err">
        <IconInfo width={14} height={14} /> Error
      </span>
    );
  }
  return null;
}
