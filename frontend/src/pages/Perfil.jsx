import { useState } from "react";
import { usePerfil } from "../hooks/usePerfil.js";

/** Página para guardar el perfil financiero del usuario. */
export default function Perfil() {
  const { perfil, guardar } = usePerfil();
  const [form, setForm] = useState(perfil);
  const [guardado, setGuardado] = useState(false);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setGuardado(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    guardar(form);
    setGuardado(true);
  }

  return (
    <div className="content">
      <h2>Mi perfil</h2>
      <p>
        Guarda tu ingreso y gastos para que el análisis calcule qué parte de tu
        ingreso disponible se lleva cada cuota. Se guarda solo en este
        navegador.
      </p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="ingreso">Ingreso mensual neto</label>
          <input
            id="ingreso"
            type="number"
            min="0"
            step="0.01"
            value={form.ingreso_mensual}
            onChange={(e) => actualizar("ingreso_mensual", e.target.value)}
            placeholder="Ej. 2000"
          />
        </div>

        <div className="field">
          <label htmlFor="gastos">Gastos fijos mensuales</label>
          <input
            id="gastos"
            type="number"
            min="0"
            step="0.01"
            value={form.gastos_fijos}
            onChange={(e) => actualizar("gastos_fijos", e.target.value)}
            placeholder="Ej. 800"
          />
        </div>

        <button className="btn" type="submit">
          Guardar perfil
        </button>
        {guardado && (
          <span style={{ marginLeft: "1rem" }}>Perfil guardado ✅</span>
        )}
      </form>
    </div>
  );
}
