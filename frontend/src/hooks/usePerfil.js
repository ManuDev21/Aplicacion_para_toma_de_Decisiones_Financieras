import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "perfil";

const PERFIL_VACIO = { ingreso_mensual: "", gastos_fijos: "" };

function perfilInicial() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : PERFIL_VACIO;
  } catch {
    return PERFIL_VACIO;
  }
}

/** Hook del perfil del usuario, persistido en localStorage. */
export function usePerfil() {
  const [perfil, setPerfil] = useState(perfilInicial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
  }, [perfil]);

  const guardar = useCallback((nuevo) => setPerfil(nuevo), []);
  const limpiar = useCallback(() => setPerfil(PERFIL_VACIO), []);

  /** Devuelve el perfil en el formato que espera la API, o null si falta. */
  const perfilParaApi = useCallback(() => {
    const ingreso = parseFloat(perfil.ingreso_mensual);
    if (!ingreso || ingreso <= 0) return null;
    return {
      ingreso_mensual: ingreso,
      gastos_fijos: parseFloat(perfil.gastos_fijos) || 0,
    };
  }, [perfil]);

  return { perfil, guardar, limpiar, perfilParaApi };
}
