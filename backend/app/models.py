"""Modelos de entrada y salida de la API (Pydantic)."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class Perfil(BaseModel):
    """Perfil financiero sencillo del usuario."""

    ingreso_mensual: float = Field(..., gt=0, description="Ingreso mensual neto")
    gastos_fijos: float = Field(
        0, ge=0, description="Gastos fijos mensuales (renta, servicios, etc.)"
    )


class Oferta(BaseModel):
    """Datos de la oferta de financiamiento a analizar."""

    monto: float = Field(..., gt=0, description="Monto financiado")
    plazo_meses: int = Field(..., gt=0, description="Número de cuotas mensuales")
    cuota_mensual: float = Field(..., gt=0, description="Cuota mensual a pagar")


class AnalizarRequest(BaseModel):
    """Cuerpo de la petición a /analizar."""

    oferta: Oferta
    perfil: Optional[Perfil] = None


class Alerta(BaseModel):
    """Una alerta emitida por las reglas de negocio."""

    nivel: Literal["info", "advertencia", "peligro"]
    codigo: str
    mensaje: str


class AnalisisResponse(BaseModel):
    """Resultado del análisis de una oferta."""

    monto: float
    plazo_meses: int
    cuota_mensual: float
    total_pagado: float
    sobrecosto: float
    sobrecosto_porcentaje: float
    tasa_mensual_estimada: float
    tasa_anual_estimada: float
    porcentaje_ingreso_disponible: Optional[float] = None
    recomendacion: str
    alertas: list[Alerta]
