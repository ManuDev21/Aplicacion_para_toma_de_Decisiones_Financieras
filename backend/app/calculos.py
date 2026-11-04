"""Cálculos financieros del análisis de ofertas.

Este módulo es la única fuente de verdad de la matemática del producto.
Todo el cálculo es determinista, basado en fórmulas. Nunca se usa IA.
"""

from __future__ import annotations


def neto(monto: float, comisiones: float) -> float:
    """Dinero que realmente recibe la persona (las comisiones se adelantan)."""
    return round(monto - comisiones, 2)


def total(pago_mensual: float, plazo_meses: int, comisiones: float) -> float:
    """Total pagado a lo largo del plazo, más las comisiones adelantadas."""
    return round(pago_mensual * plazo_meses + comisiones, 2)


def extra(total_pagado: float, monto: float) -> float:
    """Dinero pagado por encima del monto recibido."""
    return round(total_pagado - monto, 2)


def tasa_mensual(
    neto_recibido: float,
    pago_mensual: float,
    plazo_meses: int,
    iteraciones: int = 200,
) -> float:
    """Estima la tasa mensual ``r`` del préstamo por bisección.

    Resuelve la ``r`` que cumple la fórmula de anualidad sobre el neto:

        neto = pago * (1 - (1 + r) ** -plazo) / r

    Devuelve la tasa mensual en tanto por uno (p. ej. 0.05 = 5 %). Si
    ``pago * plazo <= neto`` no hay interés y devuelve 0.0.
    """
    if plazo_meses <= 0 or neto_recibido <= 0:
        return 0.0

    # Sin sobrecosto sobre el neto no hay tasa que estimar.
    if pago_mensual * plazo_meses <= neto_recibido:
        return 0.0

    def pago_para_tasa(r: float) -> float:
        if r == 0:
            return neto_recibido / plazo_meses
        return neto_recibido * r / (1 - (1 + r) ** -plazo_meses)

    bajo, alto = 0.0, 1.0  # 0 % a 100 % mensual: rango amplio y seguro.
    for _ in range(iteraciones):
        medio = (bajo + alto) / 2
        if pago_para_tasa(medio) < pago_mensual:
            bajo = medio
        else:
            alto = medio
    return round((bajo + alto) / 2, 6)


def tasa_efectiva_anual(r_mensual: float) -> float:
    """Convierte la tasa mensual (tanto por uno) a tasa efectiva anual en %."""
    return round(((1 + r_mensual) ** 12 - 1) * 100, 2)


def libre(ingreso: float, gastos: float, deudas: float) -> float:
    """Dinero libre al mes tras gastos fijos y pagos de deudas."""
    return round(ingreso - gastos - deudas, 2)


def pct_del_libre(pago_mensual: float, dinero_libre: float) -> float | None:
    """Porcentaje del dinero libre que se llevaría el pago.

    Devuelve ``None`` si el dinero libre es cero o negativo.
    """
    if dinero_libre <= 0:
        return None
    return round((pago_mensual / dinero_libre) * 100, 2)
