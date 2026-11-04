"""Cálculos financieros del análisis de ofertas.

Este módulo es la única fuente de verdad de la matemática del producto.
"""

from __future__ import annotations


def total_pagado(cuota_mensual: float, plazo_meses: int) -> float:
    """Total que se paga a lo largo de todo el plazo."""
    return round(cuota_mensual * plazo_meses, 2)


def sobrecosto(monto: float, total: float) -> float:
    """Dinero pagado por encima del monto financiado (intereses + cargos)."""
    return round(total - monto, 2)


def sobrecosto_porcentaje(monto: float, sobre: float) -> float:
    """Sobrecosto expresado como porcentaje del monto financiado."""
    if monto <= 0:
        return 0.0
    return round((sobre / monto) * 100, 2)


def tasa_mensual_estimada(
    monto: float, cuota_mensual: float, plazo_meses: int, iteraciones: int = 200
) -> float:
    """Estima la tasa de interés mensual de un préstamo de cuota fija.

    Resuelve, por bisección, la tasa ``i`` que satisface la fórmula de
    anualidad:

        cuota = monto * i / (1 - (1 + i) ** -plazo)

    Devuelve la tasa mensual en tanto por uno (p. ej. 0.05 = 5 %). Si no hay
    interés (la suma de cuotas no supera al monto), devuelve 0.0.
    """
    if plazo_meses <= 0 or monto <= 0:
        return 0.0

    # Sin sobrecosto no hay interés que estimar.
    if cuota_mensual * plazo_meses <= monto:
        return 0.0

    def cuota_para_tasa(i: float) -> float:
        if i == 0:
            return monto / plazo_meses
        return monto * i / (1 - (1 + i) ** -plazo_meses)

    bajo, alto = 0.0, 1.0  # 0 % a 100 % mensual: rango amplio y seguro.
    for _ in range(iteraciones):
        medio = (bajo + alto) / 2
        if cuota_para_tasa(medio) < cuota_mensual:
            bajo = medio
        else:
            alto = medio
    return round((bajo + alto) / 2, 6)


def tasa_anual_desde_mensual(tasa_mensual: float) -> float:
    """Convierte una tasa mensual (tanto por uno) a tasa anual efectiva en %."""
    return round(((1 + tasa_mensual) ** 12 - 1) * 100, 2)


def ingreso_disponible(ingreso_mensual: float, gastos_fijos: float) -> float:
    """Ingreso que queda tras cubrir los gastos fijos."""
    return round(ingreso_mensual - gastos_fijos, 2)


def porcentaje_ingreso_disponible(cuota_mensual: float, disponible: float) -> float:
    """Qué porcentaje del ingreso disponible se lleva la cuota."""
    if disponible <= 0:
        return float("inf")
    return round((cuota_mensual / disponible) * 100, 2)
