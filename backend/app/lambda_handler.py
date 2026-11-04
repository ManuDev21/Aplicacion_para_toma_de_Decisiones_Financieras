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
import logging
import os

from pydantic import ValidationError

from .main import analizar_oferta
from .models import AnalizarRequest

logger = logging.getLogger(__name__)

# Tamaño máximo aceptado del cuerpo de la petición (la entrada real pesa < 1 KB).
_MAX_BODY_BYTES = 10_000

# Por defecto solo el dev server de Vite; en producción se define CORS_ORIGIN.
_CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")

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
        if len(raw) > _MAX_BODY_BYTES:
            return _respuesta(413, {"detail": "Cuerpo de la petición demasiado grande."})
        datos = json.loads(raw)
        payload = AnalizarRequest(**datos)
    except ValidationError as err:
        # Solo campo y mensaje: sin valores de entrada ni detalles internos.
        errores = [
            {"campo": ".".join(str(p) for p in e["loc"]), "mensaje": e["msg"]}
            for e in err.errors(include_input=False, include_url=False, include_context=False)
        ]
        return _respuesta(400, {"detail": errores})
    except (json.JSONDecodeError, TypeError):
        return _respuesta(400, {"detail": "Petición inválida."})

    try:
        resultado = analizar_oferta(payload)
    except Exception:  # noqa: BLE001 - nunca exponer detalles internos
        logger.exception("Error inesperado al analizar la oferta")
        return _respuesta(500, {"detail": "Error interno del servidor."})
    return _respuesta(200, resultado.model_dump())
