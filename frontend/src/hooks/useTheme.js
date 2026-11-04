import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tema";

function temaInicial() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado === "light" || guardado === "dark") return guardado;
  // Por defecto, tema oscuro (como en el diseño principal).
  return "dark";
}

/** Hook de tema claro/oscuro, persistido en localStorage. */
export function useTheme() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const poner = useCallback((t) => setTema(t), []);
  const alternar = useCallback(
    () => setTema((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return { tema, poner, alternar };
}
