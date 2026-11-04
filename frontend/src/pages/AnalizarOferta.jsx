import { useState } from "react";
import AlertList from "../components/AlertList.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { IconBombilla, IconInfo } from "../components/icons.jsx";
import { usePerfil } from "../hooks/usePerfil.js";
import { analizarOferta } from "../services/api.js";
import { mxn, pct } from "../services/formato.js";

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

function aNumero(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** Página principal: analizar una oferta de financiamiento. */
export default function AnalizarOferta() {
  const { perfilParaApi } = usePerfil();
  const [oferta, setOferta] = useState(OFERTA_INICIAL);
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

    try {
      const payload = {
        oferta: {
          monto: aNumero(oferta.monto),
          plazo_meses: parseInt(oferta.plazo_meses, 10) || 0,
          pago_mensual: aNumero(oferta.pago_mensual),
          comisiones: aNumero(oferta.comisiones),
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
      <h2 className="page-title">Analizar oferta</h2>
      <p className="page-sub">
        Captura los datos de la oferta y mira cuánto te cuesta de verdad, según
        tu perfil.
      </p>

      <div className="grid-2">
        {/* Columna izquierda: formulario */}
        <form className="card" onSubmit={onSubmit}>
          <h3 className="card-title">Datos de la oferta</h3>

          <div className="field">
            <label htmlFor="monto">Monto recibido</label>
            <input
              id="monto"
              type="number"
              min="0"
              step="0.01"
              required
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
              required
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
              required
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

          <button className="btn" type="submit" disabled={cargando}>
            {cargando ? "Calculando..." : "Calcular costo real"}
          </button>

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
                    <p className="result-amount">{mxn(resultado.total)}</p>
                    <p className="result-extra">
                      Son {mxn(resultado.extra)} de más
                    </p>
                  </div>
                  <span className={`badge ${resultado.veredicto}`}>
                    {ETIQUETA_VEREDICTO[resultado.veredicto]}
                  </span>
                </div>
              </div>

              <div className="metric-grid" style={{ marginTop: "1.1rem" }}>
                <MetricCard
                  label="Tasa efectiva anual"
                  value={`≈ ${pct(resultado.tasa_efectiva_anual)}`}
                />
                <MetricCard
                  label="Pago vs. tu dinero libre"
                  value={
                    resultado.pct_del_libre != null
                      ? pct(resultado.pct_del_libre)
                      : "—"
                  }
                />
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
                  Captura la oferta y pulsa <strong>Calcular costo real</strong>{" "}
                  para ver el análisis.
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
