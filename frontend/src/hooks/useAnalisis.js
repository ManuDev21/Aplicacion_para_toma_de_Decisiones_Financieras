import { useEffect, useState } from "react";
import { analizar } from "../services/analisis.js";

function aNumero(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** Valida que la oferta tenga datos mínimos para analizar. */
function ofertaValida(oferta) {
  return (
    aNumero(oferta.monto) > 0 &&
    (parseInt(oferta.plazo_meses, 10) || 0) > 0 &&
    aNumero(oferta.pago_mensual) > 0
  );
}

/**
 * Analiza la oferta en el navegador cada vez que cambian la oferta o el perfil.
 * El cálculo es local (sin backend), con un pequeño retraso solo para mostrar
 * el estado "Calculando / Actualizado".
 *
 * @param {object} oferta    datos del formulario de oferta
 * @param {object|null} perfilApi  perfil con ingreso/gastos/deudas (o null)
 * @param {number} retraso   milisegundos de debounce visual
 * @returns {{resultado, estado, error}}
 *   estado: "inactivo" | "calculando" | "listo"
 */
export function useAnalisis(oferta, perfilApi, retraso = 300) {
  const [resultado, setResultado] = useState(null);
  const [estado, setEstado] = useState("inactivo");

  const clave = JSON.stringify({ oferta, perfilApi });

  useEffect(() => {
    if (!ofertaValida(oferta)) {
      setEstado("inactivo");
      setResultado(null);
      return;
    }

    setEstado("calculando");
    const temporizador = setTimeout(() => {
      const data = analizar({ oferta, perfil: perfilApi });
      setResultado(data);
      setEstado("listo");
    }, retraso);

    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, retraso]);

  return { resultado, estado, error: null };
}
