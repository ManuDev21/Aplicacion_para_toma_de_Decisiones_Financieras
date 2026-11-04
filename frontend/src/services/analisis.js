// Análisis financiero que corre 100% en el navegador (sin backend).
// Portado 1:1 desde la lógica Python (backend/app/calculos.py y alertas.py).
// Todo es determinista, basado en fórmulas. Nunca se usa IA.

// --- Umbrales ajustables (un solo lugar) ---
export const UMBRALES = {
  TASA_ANUAL_ALTA: 100.0, // % tasa efectiva anual
  COMISIONES_ALTO: 10.0, // % del monto
  COMISIONES_MEDIO: 5.0,
  PCT_LIBRE_ALTO: 35.0, // % del dinero libre
  PCT_LIBRE_MEDIO: 20.0,
};

/** Redondea a n decimales (equivalente a round() de Python para estos casos). */
function redondear(valor, decimales = 2) {
  const f = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * f) / f;
}

// --- Cálculos ---

export function calcNeto(monto, comisiones) {
  return redondear(monto - comisiones);
}

export function calcTotal(pagoMensual, plazoMeses, comisiones) {
  return redondear(pagoMensual * plazoMeses + comisiones);
}

export function calcExtra(totalPagado, monto) {
  return redondear(totalPagado - monto);
}

/**
 * Estima la tasa mensual r por bisección, resolviendo:
 *   neto = pago * (1 - (1 + r)^-plazo) / r
 * Devuelve la tasa mensual en tanto por uno. 0 si no hay interés.
 */
export function calcTasaMensual(netoRecibido, pagoMensual, plazoMeses, iteraciones = 200) {
  if (plazoMeses <= 0 || netoRecibido <= 0) return 0;
  if (pagoMensual * plazoMeses <= netoRecibido) return 0;

  const pagoParaTasa = (r) => {
    if (r === 0) return netoRecibido / plazoMeses;
    return (netoRecibido * r) / (1 - (1 + r) ** -plazoMeses);
  };

  let bajo = 0;
  let alto = 1; // 0% a 100% mensual
  for (let i = 0; i < iteraciones; i++) {
    const medio = (bajo + alto) / 2;
    if (pagoParaTasa(medio) < pagoMensual) bajo = medio;
    else alto = medio;
  }
  return redondear((bajo + alto) / 2, 6);
}

export function calcTasaEfectivaAnual(rMensual) {
  return redondear(((1 + rMensual) ** 12 - 1) * 100);
}

export function calcLibre(ingreso, gastos, deudas) {
  return redondear(ingreso - gastos - deudas);
}

/** % del dinero libre que se lleva el pago. null si el libre es <= 0. */
export function calcPctDelLibre(pagoMensual, dineroLibre) {
  if (dineroLibre <= 0) return null;
  return redondear((pagoMensual / dineroLibre) * 100);
}

// --- Alertas ---

function evaluarAlertas(tasaAnual, comisiones, monto, pctLibre, libre) {
  const alertas = [];

  // Tasa efectiva anual muy alta.
  if (tasaAnual > UMBRALES.TASA_ANUAL_ALTA) {
    alertas.push({
      nivel: "alto",
      codigo: "tasa_alta",
      etiqueta: "Alto",
      mensaje: "tasa efectiva muy por encima de un crédito regulado.",
    });
  }

  // Comisiones / anticipos frente al monto.
  const pctComisiones = monto > 0 ? (comisiones / monto) * 100 : 0;
  if (pctComisiones > UMBRALES.COMISIONES_ALTO) {
    alertas.push({
      nivel: "alto",
      codigo: "comisiones_altas",
      etiqueta: "Alto",
      mensaje: "pide un anticipo antes de entregar el dinero.",
    });
  } else if (pctComisiones > UMBRALES.COMISIONES_MEDIO) {
    alertas.push({
      nivel: "medio",
      codigo: "comisiones_medias",
      etiqueta: "Ojo",
      mensaje: "las comisiones encarecen la oferta; revísalas con calma.",
    });
  }

  // Peso del pago sobre el dinero libre.
  if (pctLibre === null || pctLibre === undefined) {
    if (libre !== null && libre !== undefined && libre <= 0) {
      alertas.push({
        nivel: "alto",
        codigo: "sin_dinero_libre",
        etiqueta: "Alto",
        mensaje: "no te queda dinero libre al mes para este pago.",
      });
    }
  } else if (pctLibre >= UMBRALES.PCT_LIBRE_ALTO) {
    alertas.push({
      nivel: "alto",
      codigo: "pago_excesivo",
      etiqueta: "Alto",
      mensaje: `el pago se lleva el ${Math.round(pctLibre)}% de tu dinero libre al mes.`,
    });
  } else if (pctLibre >= UMBRALES.PCT_LIBRE_MEDIO) {
    alertas.push({
      nivel: "medio",
      codigo: "pago_alto",
      etiqueta: "Ojo",
      mensaje: `el pago se lleva el ${Math.round(pctLibre)}% de tu dinero libre al mes.`,
    });
  }

  return alertas;
}

function calcVeredicto(alertas, libre) {
  if (libre !== null && libre !== undefined && libre <= 0) return "no_conviene";
  const niveles = new Set(alertas.map((a) => a.nivel));
  if (niveles.has("alto")) return "no_conviene";
  if (niveles.has("medio")) return "con_cuidado";
  return "conviene";
}

const SUGERENCIAS = {
  no_conviene:
    "Compara con un crédito de banco regulado, o revisa si hay meses sin intereses sin comisión.",
  con_cuidado:
    "Puede servir, pero compara con otra opción antes de aceptar y revisa las comisiones.",
  conviene: "La oferta luce razonable. Aun así, lee el contrato antes de firmar.",
};

/**
 * Analiza una oferta completa. Mismo contrato de salida que la antigua API.
 *
 * @param {{oferta: {monto, plazo_meses, pago_mensual, comisiones},
 *          perfil?: {ingreso_mensual, gastos_fijos, deudas_actuales}|null}} payload
 * @returns {object} resultado del análisis
 */
export function analizar(payload) {
  const o = payload.oferta;
  const monto = Number(o.monto) || 0;
  const plazo = parseInt(o.plazo_meses, 10) || 0;
  const pago = Number(o.pago_mensual) || 0;
  const comisiones = Number(o.comisiones) || 0;

  const neto = calcNeto(monto, comisiones);
  const total = calcTotal(pago, plazo, comisiones);
  const extra = calcExtra(total, monto);
  const rMensual = calcTasaMensual(neto, pago, plazo);
  const tea = calcTasaEfectivaAnual(rMensual);

  let libre = null;
  let pctLibre = null;
  if (payload.perfil) {
    const p = payload.perfil;
    libre = calcLibre(
      Number(p.ingreso_mensual) || 0,
      Number(p.gastos_fijos) || 0,
      Number(p.deudas_actuales) || 0
    );
    pctLibre = calcPctDelLibre(pago, libre);
  }

  const alertas = evaluarAlertas(tea, comisiones, monto, pctLibre, libre);
  const veredicto = calcVeredicto(alertas, libre);

  return {
    monto,
    plazo_meses: plazo,
    pago_mensual: pago,
    comisiones,
    neto,
    total,
    extra,
    tasa_mensual: redondear(rMensual * 100, 4),
    tasa_efectiva_anual: tea,
    libre,
    pct_del_libre: pctLibre,
    veredicto,
    sugerencia: SUGERENCIAS[veredicto],
    alertas,
  };
}
