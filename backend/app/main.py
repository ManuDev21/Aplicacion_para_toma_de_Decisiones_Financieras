"""API FastAPI para analizar ofertas de financiamiento."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import alertas as reglas
from . import calculos
from .models import AnalisisResponse, AnalizarRequest

app = FastAPI(
    title="Analizador de decisiones financieras",
    description=(
        "Recibe una oferta de financiamiento y devuelve el costo real, el "
        "sobrecosto, la tasa estimada y alertas claras."
    ),
    version="1.0.0",
)

# CORS: por defecto permite el dev server de Vite. Se puede sobreescribir con la
# variable de entorno CORS_ORIGINS (lista separada por comas).
_origins_env = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/salud", tags=["sistema"])
def salud() -> dict[str, str]:
    """Endpoint de salud para comprobar que la API responde."""
    return {"estado": "ok"}


def analizar_oferta(payload: AnalizarRequest) -> AnalisisResponse:
    """Ejecuta los cálculos y las reglas sobre una oferta.

    Separado del endpoint para poder probarlo sin servidor HTTP.
    """
    oferta = payload.oferta

    total = calculos.total_pagado(oferta.cuota_mensual, oferta.plazo_meses)
    sobre = calculos.sobrecosto(oferta.monto, total)
    sobre_pct = calculos.sobrecosto_porcentaje(oferta.monto, sobre)
    tasa_mensual = calculos.tasa_mensual_estimada(
        oferta.monto, oferta.cuota_mensual, oferta.plazo_meses
    )
    tasa_anual = calculos.tasa_anual_desde_mensual(tasa_mensual)

    pct_ingreso: float | None = None
    if payload.perfil is not None:
        disponible = calculos.ingreso_disponible(
            payload.perfil.ingreso_mensual, payload.perfil.gastos_fijos
        )
        pct_ingreso = calculos.porcentaje_ingreso_disponible(
            oferta.cuota_mensual, disponible
        )

    lista_alertas = reglas.evaluar(sobre_pct, pct_ingreso)
    reco = reglas.recomendacion(lista_alertas)

    # El JSON no admite infinito; lo normalizamos a None en la respuesta.
    pct_ingreso_salida = (
        None if pct_ingreso == float("inf") else pct_ingreso
    )

    return AnalisisResponse(
        monto=oferta.monto,
        plazo_meses=oferta.plazo_meses,
        cuota_mensual=oferta.cuota_mensual,
        total_pagado=total,
        sobrecosto=sobre,
        sobrecosto_porcentaje=sobre_pct,
        tasa_mensual_estimada=round(tasa_mensual * 100, 4),
        tasa_anual_estimada=tasa_anual,
        porcentaje_ingreso_disponible=pct_ingreso_salida,
        recomendacion=reco,
        alertas=lista_alertas,
    )


@app.post("/analizar", response_model=AnalisisResponse, tags=["analisis"])
def analizar(payload: AnalizarRequest) -> AnalisisResponse:
    """Analiza una oferta de financiamiento y devuelve el resultado."""
    return analizar_oferta(payload)
