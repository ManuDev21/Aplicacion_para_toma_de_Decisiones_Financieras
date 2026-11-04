import { useState } from "react";
import { IconCheck, IconInfo } from "../components/icons.jsx";
import { usePerfil } from "../hooks/usePerfil.js";
import { mxn } from "../services/formato.js";

function aNumero(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

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

  const ingreso = aNumero(form.ingreso_mensual);
  const gastos = aNumero(form.gastos_fijos);
  const deudas = aNumero(form.deudas_actuales);
  const libre = ingreso - gastos - deudas;

  return (
    <div className="content">
      <h2 className="page-title">Tu perfil</h2>
      <p className="page-sub">
        Lo capturas una sola vez. Se guarda en este navegador y se usa en cada
        análisis.
      </p>

      <div className="grid-2">
        {/* Columna izquierda: formulario */}
        <form className="card" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ingreso">Ingreso mensual</label>
            <input
              id="ingreso"
              type="number"
              min="0"
              step="0.01"
              value={form.ingreso_mensual}
              onChange={(e) => actualizar("ingreso_mensual", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="gastos">
              Gastos fijos al mes (renta, servicios, comida)
            </label>
            <input
              id="gastos"
              type="number"
              min="0"
              step="0.01"
              value={form.gastos_fijos}
              onChange={(e) => actualizar("gastos_fijos", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="deudas">Pagos de deudas actuales al mes</label>
            <input
              id="deudas"
              type="number"
              min="0"
              step="0.01"
              value={form.deudas_actuales}
              onChange={(e) => actualizar("deudas_actuales", e.target.value)}
            />
          </div>

          <button className="btn" type="submit">
            Guardar perfil
          </button>
          {guardado && (
            <span className="btn-saved">
              <IconCheck width={16} height={16} />
              Perfil guardado
            </span>
          )}
        </form>

        {/* Columna derecha: dinero libre */}
        <div className="card">
          <h3 className="card-title">Tu dinero libre al mes</h3>

          <div className="libre-row">
            <span className="lbl">Ingreso</span>
            <span>{mxn(ingreso)}</span>
          </div>
          <div className="libre-row">
            <span className="lbl">– Gastos fijos</span>
            <span>{mxn(gastos)}</span>
          </div>
          <div className="libre-row">
            <span className="lbl">– Deudas actuales</span>
            <span>{mxn(deudas)}</span>
          </div>

          <p className="libre-total-label">Te quedan libres</p>
          <p className="libre-total pop" key={libre}>
            {mxn(libre)}
          </p>

          <p className="card-foot">
            Con este dato calculamos qué parte de tu dinero se llevaría una
            oferta.
          </p>
        </div>
      </div>

      <p className="aviso">
        <IconInfo width={14} height={14} />
        Es una estimación informativa. No sustituye el contrato ni la asesoría
        financiera.
      </p>
    </div>
  );
}
