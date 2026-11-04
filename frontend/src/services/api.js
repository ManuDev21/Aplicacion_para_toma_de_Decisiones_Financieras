// Llamadas a la API FastAPI. La URL base viene de la variable de entorno
// VITE_API_URL (ver .env.example). Nunca se escribe directamente aquí.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Envía una oferta (y opcionalmente el perfil) al backend y devuelve el
 * análisis.
 *
 * @param {{oferta: object, perfil?: object|null}} payload
 * @returns {Promise<object>} resultado del análisis
 */
export async function analizarOferta(payload) {
  const res = await fetch(`${BASE_URL}/analizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detalle = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) detalle = JSON.stringify(data.detail);
    } catch {
      // respuesta sin cuerpo JSON; se queda el mensaje por defecto
    }
    throw new Error(detalle);
  }

  return res.json();
}

/** Comprueba que la API responde. */
export async function comprobarSalud() {
  const res = await fetch(`${BASE_URL}/salud`);
  return res.ok;
}
