import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

/** Menú lateral de navegación. */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1>💰 Decisiones Financieras</h1>
      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Analizar oferta
        </NavLink>
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Mi perfil
        </NavLink>
      </nav>
      <ThemeToggle />
    </aside>
  );
}
