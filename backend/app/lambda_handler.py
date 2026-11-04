"""Handler de AWS Lambda para la función ``analizar``.

Reutiliza exactamente la misma lógica que la API FastAPI (``analizar_oferta``),
de modo que el cálculo es idéntico se despliegue como contenedor o como Lambda
con Function URL.

Pensado para una Lambda Function URL con CORS. Responde a:
- OPTIONS: preflight de CORS.
- POST:    analiza la oferta.
- GET:     salud.
"""

from __future__ import annotations

import json
import os

from pydantic import ValidationError

from .main import analizar_oferta
from .models import AnalizarRequest

_CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

_CORS_HEADERS = {
    "Access-Control-Allow-Origin": _CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def _respuesta(status: int, cuerpo: dict | list) -> dict:
    return {
        "statusCode": status,
        "headers": _CORS_HEADERS,
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
        return _respuesta(200, {"ok": True})

    if metodo == "GET":
        return _respuesta(200, {"estado": "ok"})

    # POST: analizar.
    try:
        raw = event.get("body") or "{}"
        datos = json.loads(raw)
        payload = AnalizarRequest(**datos)
    except (json.JSONDecodeError, ValidationError, TypeError) as err:
        return _respuesta(400, {"detail": str(err)})

    resultado = analizar_oferta(payload)
    return _respuesta(200, resultado.model_dump())
