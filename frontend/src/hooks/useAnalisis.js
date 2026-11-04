import { useEffect, useRef, useState } from "react";
import { analizarOferta } from "../services/api.js";

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
 * Analiza la oferta automáticamente cada vez que cambian la oferta o el perfil,
 * con un pequeño retraso (debounce) para no llamar a la API en cada tecla.
 *
 * @param {object} oferta    datos del formulario de oferta
 * @param {object|null} perfilApi  perfil en formato de API (o null)
 * @param {number} retraso   milisegundos de debounce
 * @returns {{resultado, estado, error}}
 *   estado: "inactivo" | "calculando" | "listo" | "error"
 */
export function useAnalisis(oferta, perfilApi, retraso = 400) {
  const [resultado, setResultado] = useState(null);
  const [estado, setEstado] = useState("inactivo");
  const [error, setError] = useState(null);
  const peticionRef = useRef(0);

  // Clave estable para disparar el efecto solo cuando algo cambia de verdad.
  const clave = JSON.stringify({ oferta, perfilApi });

  useEffect(() => {
    if (!ofertaValida(oferta)) {
      setEstado("inactivo");
      setResultado(null);
      setError(null);
      return;
    }

    setEstado("calculando");
    const idiPeticion = ++peticionRef.current;

    const temporizador = setTimeout(async () => {
      try {
        const payload = {
          oferta: {
            monto: aNumero(oferta.monto),
            plazo_meses: parseInt(oferta.plazo_meses, 10) || 0,
            pago_mensual: aNumero(oferta.pago_mensual),
            comisiones: aNumero(oferta.comisiones),
          },
          perfil: perfilApi,
        };
        const data = await analizarOferta(payload);
        // Ignora respuestas viejas si ya se disparó otra petición.
        if (idiPeticion !== peticionRef.current) return;
        setResultado(data);
        setEstado("listo");
        setError(null);
      } catch (err) {
        if (idiPeticion !== peticionRef.current) return;
        setError(err.message);
        setEstado("error");
      }
    }, retraso);

    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, retraso]);

  return { resultado, estado, error };
}
