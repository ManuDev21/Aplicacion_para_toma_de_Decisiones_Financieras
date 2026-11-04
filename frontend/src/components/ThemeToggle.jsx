import { useTheme } from "../hooks/useTheme.js";
import { IconLuna, IconSol } from "./icons.jsx";

/** Interruptor de tema claro/oscuro, estilo segmento (Claro | Oscuro). */
export default function ThemeToggle() {
  const { tema, poner } = useTheme();
  return (
    <div className="theme-block">
      <div className="theme-label">Tema</div>
      <div className="theme-switch" role="group" aria-label="Tema">
        <button
          className={tema === "light" ? "active" : ""}
          onClick={() => poner("light")}
          type="button"
        >
          <IconSol width={14} height={14} />
          Claro
        </button>
        <button
          className={tema === "dark" ? "active" : ""}
          onClick={() => poner("dark")}
          type="button"
        >
          <IconLuna width={14} height={14} />
          Oscuro
        </button>
      </div>
    </div>
  );
}
