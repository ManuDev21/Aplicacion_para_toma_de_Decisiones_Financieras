import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tema";

function temaInicial() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado === "light" || guardado === "dark") return guardado;
  // Respeta la preferencia del sistema la primera vez.
  const prefiereOscuro = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  return prefiereOscuro ? "dark" : "light";
}

/** Hook de tema claro/oscuro, persistido en localStorage. */
export function useTheme() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { tema, alternar };
}
