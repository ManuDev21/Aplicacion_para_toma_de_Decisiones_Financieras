import { useState } from "react";
import AlertList from "../components/AlertList.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { usePerfil } from "../hooks/usePerfil.js";
import { analizarOferta } from "../services/api.js";

const OFERTA_VACIA = { monto: "", plazo_meses: "", cuota_mensual: "" };

function money(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/** Página principal: analizar una oferta de financiamiento. */
export default function AnalizarOferta() {
  const { perfilParaApi } = usePerfil();
  const [oferta, setOferta] = useState(OFERTA_VACIA);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  function actualizar(campo, valor) {
    setOferta((o) => ({ ...o, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const payload = {
        oferta: {
          monto: parseFloat(oferta.monto),
          plazo_meses: parseInt(oferta.plazo_meses, 10),
          cuota_mensual: parseFloat(oferta.cuota_mensual),
        },
        perfil: perfilParaApi(),
      };
      const data = await analizarOferta(payload);
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="content">
      <h2>Analizar oferta</h2>
      <p>
        Introduce el monto, el plazo y la cuota mensual de la oferta para ver su
        costo real y recibir alertas.
      </p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="monto">Monto financiado</label>
          <input
            id="monto"
            type="number"
            min="0"
            step="0.01"
            required
            value={oferta.monto}
            onChange={(e) => actualizar("monto", e.target.value)}
            placeholder="Ej. 5000"
          />
        </div>

        <div className="field">
          <label htmlFor="plazo">Plazo (meses)</label>
          <input
            id="plazo"
            type="number"
            min="1"
            step="1"
            required
            value={oferta.plazo_meses}
            onChange={(e) => actualizar("plazo_meses", e.target.value)}
            placeholder="Ej. 12"
          />
        </div>

        <div className="field">
          <label htmlFor="cuota">Cuota mensual</label>
          <input
            id="cuota"
            type="number"
            min="0"
            step="0.01"
            required
            value={oferta.cuota_mensual}
            onChange={(e) => actualizar("cuota_mensual", e.target.value)}
            placeholder="Ej. 817"
          />
        </div>

        <button className="btn" type="submit" disabled={cargando}>
          {cargando ? "Analizando..." : "Analizar"}
        </button>
      </form>

      {error && (
        <p className="error-text" style={{ marginTop: "1rem" }}>
          No se pudo analizar: {error}
        </p>
      )}

      {resultado && (
        <div style={{ marginTop: "1.5rem" }}>
          <p className="recomendacion">{resultado.recomendacion}</p>

          <MetricCard
            titulo="Resumen del costo"
            metricas={[
              { label: "Total a pagar", value: money(resultado.total_pagado) },
              { label: "Sobrecosto", value: money(resultado.sobrecosto) },
              {
                label: "Sobrecosto %",
                value: `${resultado.sobrecosto_porcentaje}%`,
              },
              {
                label: "Tasa anual estimada",
                value: `${resultado.tasa_anual_estimada}%`,
              },
            ]}
          />

          {resultado.porcentaje_ingreso_disponible != null && (
            <MetricCard
              titulo="Impacto en tu ingreso"
              metricas={[
                {
                  label: "Cuota vs. ingreso disponible",
                  value: `${resultado.porcentaje_ingreso_disponible}%`,
                },
              ]}
            />
          )}

          <AlertList alertas={resultado.alertas} />
        </div>
      )}
    </div>
  );
}
