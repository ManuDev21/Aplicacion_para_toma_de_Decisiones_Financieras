import { useMemo, useState } from "react";
import AlertList from "../components/AlertList.jsx";
import EstadoPill from "../components/EstadoPill.jsx";
import ValorAnimado from "../components/ValorAnimado.jsx";
import BarraLibre from "../components/charts/BarraLibre.jsx";
import DonaCosto from "../components/charts/DonaCosto.jsx";
import LineaSaldo from "../components/charts/LineaSaldo.jsx";
import { IconBombilla, IconInfo } from "../components/icons.jsx";
import { useAnalisis } from "../hooks/useAnalisis.js";
import { usePerfil } from "../hooks/usePerfil.js";
import { mxn } from "../services/formato.js";

const OFERTA_INICIAL = {
  monto: "5000",
  plazo_meses: "12",
  pago_mensual: "817",
  comisiones: "0",
};

const ETIQUETA_VEREDICTO = {
  no_conviene: "No te conviene",
  con_cuidado: "Con cuidado",
  conviene: "Sí te conviene",
};

/** Página principal: analizar una oferta de financiamiento. */
export default function AnalizarOferta() {
  const { perfilParaApi } = usePerfil();
  const [oferta, setOferta] = useState(OFERTA_INICIAL);

  // El perfil para la API se memoriza para que el hook no se dispare de más.
  const perfilApi = useMemo(() => perfilParaApi(), [perfilParaApi]);

  // Análisis reactivo: se recalcula solo al cambiar cualquier campo.
  const { resultado, estado, error } = useAnalisis(oferta, perfilApi);

  function actualizar(campo, valor) {
    setOferta((o) => ({ ...o, [campo]: valor }));
  }

  return (
    <div className="content">
      <div className="title-row">
        <div>
          <h2 className="page-title">Analizar oferta</h2>
          <p className="page-sub">
            Captura los datos de la oferta y mira cuánto te cuesta de verdad,
            según tu perfil. Se actualiza solo.
          </p>
        </div>
        <EstadoPill estado={estado} />
      </div>

      <div className="grid-2">
        {/* Columna izquierda: formulario */}
        <form className="card" onSubmit={(e) => e.preventDefault()}>
          <h3 className="card-title">Datos de la oferta</h3>

          <div className="field">
            <label htmlFor="monto">Monto recibido</label>
            <input
              id="monto"
              type="number"
              min="0"
              step="0.01"
              value={oferta.monto}
              onChange={(e) => actualizar("monto", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="plazo">Plazo (meses)</label>
            <input
              id="plazo"
              type="number"
              min="1"
              step="1"
              value={oferta.plazo_meses}
              onChange={(e) => actualizar("plazo_meses", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="pago">Pago mensual</label>
            <input
              id="pago"
              type="number"
              min="0"
              step="0.01"
              value={oferta.pago_mensual}
              onChange={(e) => actualizar("pago_mensual", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="comisiones">Comisiones y anticipos</label>
            <input
              id="comisiones"
              type="number"
              min="0"
              step="0.01"
              value={oferta.comisiones}
              onChange={(e) => actualizar("comisiones", e.target.value)}
            />
          </div>

          <p className="hint">
            <IconInfo width={14} height={14} />
            El resultado se recalcula automáticamente mientras escribes.
          </p>

          {error && <p className="error-text">No se pudo calcular: {error}</p>}
        </form>

        {/* Columna derecha: resultado */}
        <div>
          {resultado ? (
            <>
              <div className="card">
                <div className="result-head">
                  <div>
                    <p className="result-caption">
                      Por un préstamo de {mxn(resultado.monto)} pagarías
                    </p>
                    <p className="result-amount">
                      <ValorAnimado valor={resultado.total} formato="mxn" />
                    </p>
                    <p className="result-extra">
                      Son{" "}
                      <ValorAnimado valor={resultado.extra} formato="mxn" /> de
                      más
                    </p>
                  </div>
                  <span className={`badge ${resultado.veredicto}`}>
                    {ETIQUETA_VEREDICTO[resultado.veredicto]}
                  </span>
                </div>
              </div>

              <div className="metric-grid" style={{ marginTop: "1.1rem" }}>
                <div className="metric">
                  <div className="m-label">Tasa efectiva anual</div>
                  <div className="m-value">
                    ≈{" "}
                    <ValorAnimado
                      valor={resultado.tasa_efectiva_anual}
                      formato="pct"
                    />
                  </div>
                </div>
                <div className="metric">
                  <div className="m-label">Pago vs. tu dinero libre</div>
                  <div className="m-value">
                    {resultado.pct_del_libre != null ? (
                      <ValorAnimado
                        valor={resultado.pct_del_libre}
                        formato="pct"
                      />
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              {/* Gráficas */}
              <div className="card" style={{ marginTop: "1.1rem" }}>
                <h3 className="card-title">Visual del costo</h3>
                <div className="charts-grid">
                  <DonaCosto monto={resultado.monto} extra={resultado.extra} />
                  <BarraLibre pct={resultado.pct_del_libre} />
                </div>
                <div style={{ marginTop: "0.6rem" }}>
                  <p className="chart-titulo">Cómo baja tu deuda</p>
                  <LineaSaldo
                    neto={resultado.neto}
                    pago={resultado.pago_mensual}
                    plazo={resultado.plazo_meses}
                    tasaMensualPct={resultado.tasa_mensual}
                  />
                </div>
              </div>

              <div className="card" style={{ marginTop: "1.1rem" }}>
                <h3 className="card-title">Señales de alerta</h3>
                <AlertList alertas={resultado.alertas} />

                <p className="subtitle" style={{ marginTop: "1.2rem" }}>
                  <IconBombilla
                    width={16}
                    height={16}
                    style={{ verticalAlign: "-3px", marginRight: "6px" }}
                  />
                  Qué hacer
                </p>
                <p className="sugerencia">{resultado.sugerencia}</p>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="alert info">
                <IconInfo />
                <span>
                  Captura el monto, el plazo y el pago mensual para ver el
                  análisis al instante.
                </span>
              </div>
            </div>
          )}
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
