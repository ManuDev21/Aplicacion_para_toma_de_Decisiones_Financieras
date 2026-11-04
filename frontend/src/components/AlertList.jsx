import { IconAlerta, IconInfo } from "./icons.jsx";

/** Lista de señales de alerta devueltas por el análisis. */
export default function AlertList({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return (
      <div className="alert info">
        <IconInfo />
        <span>No se detectaron señales de alarma en esta oferta.</span>
      </div>
    );
  }

  return (
    <div>
      {alertas.map((a) => (
        <div className={`alert ${a.nivel}`} key={a.codigo}>
          <IconAlerta />
          <span>
            <strong>{a.etiqueta}:</strong> {a.mensaje}
          </span>
        </div>
      ))}
    </div>
  );
}
