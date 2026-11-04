"""Handler de AWS Lambda para la función ``analizar``.

Reutiliza exactamente la misma lógica que la API FastAPI (``analizar_oferta``),
de modo que el cálculo es idéntico se despliegue como contenedor o como Lambda
con Function URL.

Pensado para una Lambda Function URL con CORS. Responde a:
- OPTIONS: preflight de CORS.
- POST:    analiza la oferta.
- GET:     salud.

Nota sobre CORS: cuando la Function URL tiene su propio bloque ``Cors`` (ver
infra/template.yaml), AWS ya inyecta los encabezados Access-Control-* y resuelve
el preflight OPTIONS. Para no duplicar encabezados (lo que rompe el navegador),
aquí solo reflejamos el origen permitido en las respuestas, de forma compatible.
"""

from __future__ import annotations

import json
import os

from pydantic import ValidationError

from .main import analizar_oferta
from .models import AnalizarRequest

# Origen permitido. "*" permite cualquiera; o la URL exacta del frontend.
_CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")


def _origen_de(event: dict) -> str | None:
    """Lee el header Origin de la petición (insensible a mayúsculas)."""
    headers = event.get("headers") or {}
    for clave, valor in headers.items():
        if clave.lower() == "origin":
            return valor
    return None


def _cabeceras_cors(event: dict) -> dict:
    """Calcula el valor de Access-Control-Allow-Origin a devolver.

    - Si CORS_ORIGIN es "*", refleja el origen de la petición (o "*").
    - Si CORS_ORIGIN es una URL concreta, usa esa URL.
    """
    origen_peticion = _origen_de(event)
    if _CORS_ORIGIN == "*":
        permitido = origen_peticion or "*"
    else:
        permitido = _CORS_ORIGIN

    return {
        "Access-Control-Allow-Origin": permitido,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
        "Content-Type": "application/json",
    }


def _respuesta(status: int, cuerpo: dict | list, event: dict) -> dict:
    return {
        "statusCode": status,
        "headers": _cabeceras_cors(event),
        "body": json.dumps(cuerpo, ensure_ascii=False),
    }


def _metodo(event: dict) -> str:
    # Compatible con Function URL (v2) y API Gateway (v1).
    ctx = event.get("requestContext", {})
    http = ctx.get("http", {})
    return (http.get("method") or event.get("httpMethod") or "POST").upper()


def handler(event: dict, _context=None) -> dict:
    metodo = _metodo(event)

    if metodo == "OPTIONS":
        return _respuesta(200, {"ok": True}, event)

    if metodo == "GET":
        return _respuesta(200, {"estado": "ok"}, event)

    # POST: analizar.
    try:
        raw = event.get("body") or "{}"
        datos = json.loads(raw)
        payload = AnalizarRequest(**datos)
    except (json.JSONDecodeError, ValidationError, TypeError) as err:
        return _respuesta(400, {"detail": str(err)}, event)

    resultado = analizar_oferta(payload)
    return _respuesta(200, resultado.model_dump(), event)
