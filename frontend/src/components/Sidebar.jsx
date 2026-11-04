import ThemeToggle from "./ThemeToggle.jsx";
import { IconDocumento, IconPerfil } from "./icons.jsx";

/**
 * Menú lateral fijo. Navegación controlada por estado (sin router externo).
 *
 * @param {{ruta: string, onNavegar: (r: string) => void}} props
 */
export default function Sidebar({ ruta, onNavegar }) {
  return (
    <aside className="sidebar">
      <h1 className="brand">
        ¿Cuánto me <span className="accent">cuesta</span> de verdad?
      </h1>

      <nav>
        <button
          type="button"
          className={ruta === "analizar" ? "nav-link active" : "nav-link"}
          onClick={() => onNavegar("analizar")}
        >
          <IconDocumento />
          Analizar oferta
        </button>
        <button
          type="button"
          className={ruta === "perfil" ? "nav-link active" : "nav-link"}
          onClick={() => onNavegar("perfil")}
        >
          <IconPerfil />
          Perfil
        </button>
      </nav>

      <ThemeToggle />
    </aside>
  );
}
