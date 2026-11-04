import { useEffect, useRef, useState } from "react";

const prefiereReducido =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Anima un número desde su valor anterior hasta `valor` objetivo.
 * Respeta `prefers-reduced-motion`.
 *
 * @param {number} valor    valor objetivo
 * @param {number} duracion milisegundos de la animación
 * @returns {number} valor interpolado para mostrar
 */
export function useContador(valor, duracion = 600) {
  const objetivo = Number.isFinite(valor) ? valor : 0;
  const [mostrado, setMostrado] = useState(objetivo);
  const desdeRef = useRef(objetivo);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefiereReducido || duracion <= 0) {
      setMostrado(objetivo);
      desdeRef.current = objetivo;
      return;
    }

    const desde = desdeRef.current;
    const delta = objetivo - desde;
    if (delta === 0) return;

    const inicio = performance.now();

    const paso = (ahora) => {
      const t = Math.min((ahora - inicio) / duracion, 1);
      // easing suave (easeOutCubic)
      const e = 1 - Math.pow(1 - t, 3);
      setMostrado(desde + delta * e);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(paso);
      } else {
        desdeRef.current = objetivo;
      }
    };

    rafRef.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(rafRef.current);
  }, [objetivo, duracion]);

  return mostrado;
}
