"""API FastAPI para analizar ofertas de financiamiento (MXN)."""

from __future__ import annotations

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import alertas as reglas
from . import calculos
from .models import AnalisisResponse, AnalizarRequest

app = FastAPI(
    title="¿Cuánto me cuesta de verdad?",
    description=(
        "Recibe una oferta de crédito y devuelve el costo real, la tasa "
        "efectiva anual, cuánto se paga de más y alertas claras."
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
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RequestValidationError)
async def _validacion(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """Errores 422 sin eco de la entrada (evita fallos con NaN/inf y fugas)."""
    errores = [
        {
            "campo": ".".join(str(p) for p in e["loc"] if p != "body"),
            "mensaje": e["msg"],
        }
        for e in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": errores})


@app.get("/salud", tags=["sistema"])
def salud() -> dict[str, str]:
    """Endpoint de salud para comprobar que la API responde."""
    return {"estado": "ok"}


def analizar_oferta(payload: AnalizarRequest) -> AnalisisResponse:
    """Ejecuta los cálculos y las reglas sobre una oferta.

    Separado del endpoint para poder probarlo sin servidor HTTP.
    """
    o = payload.oferta

    neto = calculos.neto(o.monto, o.comisiones)
    total = calculos.total(o.pago_mensual, o.plazo_meses, o.comisiones)
    extra = calculos.extra(total, o.monto)
    r_mensual = calculos.tasa_mensual(neto, o.pago_mensual, o.plazo_meses)
    tea = calculos.tasa_efectiva_anual(r_mensual)

    dinero_libre: float | None = None
    pct_libre: float | None = None
    if payload.perfil is not None:
        p = payload.perfil
        dinero_libre = calculos.libre(
            p.ingreso_mensual, p.gastos_fijos, p.deudas_actuales
        )
        pct_libre = calculos.pct_del_libre(o.pago_mensual, dinero_libre)

    lista_alertas = reglas.evaluar(
        tasa_efectiva_anual=tea,
        comisiones=o.comisiones,
        monto=o.monto,
        pct_del_libre=pct_libre,
        libre=dinero_libre,
    )
    v = reglas.veredicto(lista_alertas, dinero_libre)
    sug = reglas.sugerencia(v)

    return AnalisisResponse(
        monto=o.monto,
        plazo_meses=o.plazo_meses,
        pago_mensual=o.pago_mensual,
        comisiones=o.comisiones,
        neto=neto,
        total=total,
        extra=extra,
        tasa_mensual=round(r_mensual * 100, 4),
        tasa_efectiva_anual=tea,
        libre=dinero_libre,
        pct_del_libre=pct_libre,
        veredicto=v,
        sugerencia=sug,
        alertas=lista_alertas,
    )


@app.post("/analizar", response_model=AnalisisResponse, tags=["analisis"])
def analizar(payload: AnalizarRequest) -> AnalisisResponse:
    """Analiza una oferta de financiamiento y devuelve el resultado."""
    return analizar_oferta(payload)
