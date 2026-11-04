import { useTheme } from "../hooks/useTheme.js";

/** Interruptor de tema claro/oscuro. */
export default function ThemeToggle() {
  const { tema, alternar } = useTheme();
  return (
    <button className="theme-toggle" onClick={alternar}>
      {tema === "dark" ? "☀️ Tema claro" : "🌙 Tema oscuro"}
    </button>
  );
}
