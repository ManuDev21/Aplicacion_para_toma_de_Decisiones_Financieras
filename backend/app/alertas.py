"""Reglas de alertas y veredicto del análisis de ofertas.

Los umbrales están centralizados aquí como constantes para que sea fácil
ajustarlos y probarlos. Cada regla nueva debe venir con su prueba en
``backend/tests/``.
"""

from __future__ import annotations

from .models import Alerta, Veredicto

# --- Umbrales ajustables (un solo lugar) ---
UMBRAL_TASA_ANUAL_ALTA = 100.0  # % tasa efectiva anual

UMBRAL_COMISIONES_ALTO = 10.0  # % del monto
UMBRAL_COMISIONES_MEDIO = 5.0

UMBRAL_PCT_LIBRE_ALTO = 35.0  # % del dinero libre
UMBRAL_PCT_LIBRE_MEDIO = 20.0


def evaluar(
    tasa_efectiva_anual: float,
    comisiones: float,
    monto: float,
    pct_del_libre: float | None,
    libre: float | None,
) -> list[Alerta]:
    """Devuelve la lista de alertas que aplican a un análisis."""
    alertas: list[Alerta] = []

    # Regla: tasa efectiva anual muy alta.
    if tasa_efectiva_anual > UMBRAL_TASA_ANUAL_ALTA:
        alertas.append(
            Alerta(
                nivel="alto",
                codigo="tasa_alta",
                etiqueta="Alto",
                mensaje="tasa efectiva muy por encima de un crédito regulado.",
            )
        )

    # Regla: comisiones / anticipos frente al monto.
    pct_comisiones = (comisiones / monto * 100) if monto > 0 else 0.0
    if pct_comisiones > UMBRAL_COMISIONES_ALTO:
        alertas.append(
            Alerta(
                nivel="alto",
                codigo="comisiones_altas",
                etiqueta="Alto",
                mensaje="pide un anticipo antes de entregar el dinero.",
            )
        )
    elif pct_comisiones > UMBRAL_COMISIONES_MEDIO:
        alertas.append(
            Alerta(
                nivel="medio",
                codigo="comisiones_medias",
                etiqueta="Ojo",
                mensaje="las comisiones encarecen la oferta; revísalas con calma.",
            )
        )

    # Regla: peso del pago sobre el dinero libre.
    if pct_del_libre is None:
        # libre <= 0: no hay margen, se trata como señal alta.
        if libre is not None and libre <= 0:
            alertas.append(
                Alerta(
                    nivel="alto",
                    codigo="sin_dinero_libre",
                    etiqueta="Alto",
                    mensaje="no te queda dinero libre al mes para este pago.",
                )
            )
    elif pct_del_libre >= UMBRAL_PCT_LIBRE_ALTO:
        alertas.append(
            Alerta(
                nivel="alto",
                codigo="pago_excesivo",
                etiqueta="Alto",
                mensaje=(
                    f"el pago se lleva el {pct_del_libre:.0f}% de tu dinero "
                    "libre al mes."
                ),
            )
        )
    elif pct_del_libre >= UMBRAL_PCT_LIBRE_MEDIO:
        alertas.append(
            Alerta(
                nivel="medio",
                codigo="pago_alto",
                etiqueta="Ojo",
                mensaje=(
                    f"el pago se lleva el {pct_del_libre:.0f}% de tu dinero "
                    "libre al mes."
                ),
            )
        )

    return alertas


def veredicto(alertas: list[Alerta], libre: float | None) -> Veredicto:
    """Determina el veredicto a partir de las alertas y el dinero libre."""
    # Sin dinero libre, nunca conviene.
    if libre is not None and libre <= 0:
        return "no_conviene"

    niveles = {a.nivel for a in alertas}
    if "alto" in niveles:
        return "no_conviene"
    if "medio" in niveles:
        return "con_cuidado"
    return "conviene"


# Sugerencias fijas por veredicto.
SUGERENCIAS: dict[Veredicto, str] = {
    "no_conviene": (
        "Compara con un crédito de banco regulado, o revisa si hay meses sin "
        "intereses sin comisión."
    ),
    "con_cuidado": (
        "Puede servir, pero compara con otra opción antes de aceptar y revisa "
        "las comisiones."
    ),
    "conviene": (
        "La oferta luce razonable. Aun así, lee el contrato antes de firmar."
    ),
}


def sugerencia(v: Veredicto) -> str:
    """Texto de recomendación fijo según el veredicto."""
    return SUGERENCIAS[v]
