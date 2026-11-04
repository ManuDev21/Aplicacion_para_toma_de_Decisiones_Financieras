import { useCallback, useEffect, useState } from "react";

// El perfil se guarda como una lista de perfiles con un índice activo, aunque
// la interfaz solo muestre uno. Así queda preparado para futuros perfiles.
const STORAGE_KEY = "perfiles";

const PERFIL_VACIO = {
  nombre: "",
  ingreso_mensual: "",
  gastos_fijos: "",
  deudas_actuales: "",
};

const ESTADO_VACIO = { perfiles: [{ ...PERFIL_VACIO }], activo: 0 };

function estadoInicial() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return ESTADO_VACIO;
    const parsed = JSON.parse(guardado);
    if (
      parsed &&
      Array.isArray(parsed.perfiles) &&
      parsed.perfiles.length > 0 &&
      typeof parsed.activo === "number"
    ) {
      return parsed;
    }
    return ESTADO_VACIO;
  } catch {
    return ESTADO_VACIO;
  }
}

function aNumero(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** Hook del perfil del usuario, persistido en localStorage. */
export function usePerfil() {
  const [estado, setEstado] = useState(estadoInicial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }, [estado]);

  const perfil = estado.perfiles[estado.activo] ?? PERFIL_VACIO;

  const guardar = useCallback((nuevo) => {
    setEstado((prev) => {
      const perfiles = [...prev.perfiles];
      perfiles[prev.activo] = nuevo;
      return { ...prev, perfiles };
    });
  }, []);

  /** Devuelve el dinero libre calculado en el cliente (solo para mostrar). */
  const libre = useCallback(() => {
    return (
      aNumero(perfil.ingreso_mensual) -
      aNumero(perfil.gastos_fijos) -
      aNumero(perfil.deudas_actuales)
    );
  }, [perfil]);

  /** Perfil en el formato de la API, o null si no hay ingreso válido. */
  const perfilParaApi = useCallback(() => {
    const ingreso = aNumero(perfil.ingreso_mensual);
    if (ingreso <= 0) return null;
    return {
      nombre: perfil.nombre || "",
      ingreso_mensual: ingreso,
      gastos_fijos: aNumero(perfil.gastos_fijos),
      deudas_actuales: aNumero(perfil.deudas_actuales),
    };
  }, [perfil]);

  return { perfil, guardar, libre, perfilParaApi };
}
