// Formato de montos en pesos mexicanos (es-MX).

const pesos = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/** Formatea un número como pesos mexicanos sin decimales: $9,804. */
export function mxn(n) {
  const valor = Number.isFinite(n) ? n : 0;
  return pesos.format(valor);
}

/** Redondea un porcentaje a entero y le agrega el símbolo: 28%. */
export function pct(n) {
  const valor = Number.isFinite(n) ? n : 0;
  return `${Math.round(valor)}%`;
}
