import { useContador } from "../hooks/useContador.js";
import { mxn, pct } from "../services/formato.js";

/**
 * Muestra un número animado. `formato` define cómo se renderiza:
 * "mxn" para pesos, "pct" para porcentaje.
 *
 * @param {{valor: number, formato?: "mxn"|"pct", prefijo?: string}} props
 */
export default function ValorAnimado({ valor, formato = "mxn", prefijo = "" }) {
  const animado = useContador(valor);
  const texto = formato === "pct" ? pct(animado) : mxn(animado);
  return (
    <span>
      {prefijo}
      {texto}
    </span>
  );
}
