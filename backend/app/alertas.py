"""Reglas de alertas del análisis de ofertas.

Cada regla nueva debe venir con su prueba en ``backend/tests/``.
"""

from __future__ import annotations

from .models import Alerta

# Umbrales del MVP. Centralizados para que sea fácil ajustarlos y probarlos.
UMBRAL_CUOTA_INGRESO = 30.0  # % del ingreso disponible
UMBRAL_CUOTA_INGRESO_GRAVE = 50.0
UMBRAL_SOBRECOSTO = 30.0  # % del monto financiado
UMBRAL_SOBRECOSTO_GRAVE = 60.0


def evaluar(
    sobrecosto_porcentaje: float,
    porcentaje_ingreso: float | None,
) -> list[Alerta]:
    """Devuelve la lista de alertas que aplican a un análisis."""
    alertas: list[Alerta] = []

    # Regla 1: sobrecosto frente al monto financiado.
    if sobrecosto_porcentaje >= UMBRAL_SOBRECOSTO_GRAVE:
        alertas.append(
            Alerta(
                nivel="peligro",
                codigo="sobrecosto_alto",
                mensaje=(
                    f"Pagarás un {sobrecosto_porcentaje:.0f}% extra sobre el "
                    "monto. El costo del financiamiento es muy alto."
                ),
            )
        )
    elif sobrecosto_porcentaje >= UMBRAL_SOBRECOSTO:
        alertas.append(
            Alerta(
                nivel="advertencia",
                codigo="sobrecosto_moderado",
                mensaje=(
                    f"El sobrecosto es de un {sobrecosto_porcentaje:.0f}% sobre "
                    "el monto. Revisa si hay opciones más baratas."
                ),
            )
        )

    # Regla 2: peso de la cuota sobre el ingreso disponible.
    if porcentaje_ingreso is not None:
        if porcentaje_ingreso == float("inf") or porcentaje_ingreso >= 100:
            alertas.append(
                Alerta(
                    nivel="peligro",
                    codigo="cuota_insostenible",
                    mensaje=(
                        "La cuota consume todo tu ingreso disponible o más. "
                        "Esta oferta no es sostenible."
                    ),
                )
            )
        elif porcentaje_ingreso >= UMBRAL_CUOTA_INGRESO_GRAVE:
            alertas.append(
                Alerta(
                    nivel="peligro",
                    codigo="cuota_muy_alta",
                    mensaje=(
                        f"La cuota representa el {porcentaje_ingreso:.0f}% de tu "
                        "ingreso disponible. Es un compromiso muy pesado."
                    ),
                )
            )
        elif porcentaje_ingreso >= UMBRAL_CUOTA_INGRESO:
            alertas.append(
                Alerta(
                    nivel="advertencia",
                    codigo="cuota_alta",
                    mensaje=(
                        f"La cuota supera el {UMBRAL_CUOTA_INGRESO:.0f}% de tu "
                        f"ingreso disponible ({porcentaje_ingreso:.0f}%)."
                    ),
                )
            )

    if not alertas:
        alertas.append(
            Alerta(
                nivel="info",
                codigo="sin_alertas",
                mensaje="No se detectaron señales de alarma en esta oferta.",
            )
        )

    return alertas


def recomendacion(alertas: list[Alerta]) -> str:
    """Resume las alertas en una recomendación simple."""
    niveles = {a.nivel for a in alertas}
    if "peligro" in niveles:
        return "No recomendable: revisa las alertas antes de aceptar."
    if "advertencia" in niveles:
        return "Acepta con cautela: hay señales que conviene revisar."
    return "La oferta luce razonable según los datos ingresados."
