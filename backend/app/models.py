"""Modelos de entrada y salida de la API (Pydantic)."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class Perfil(BaseModel):
    """Perfil financiero del usuario (todo en MXN)."""

    nombre: str = Field("", description="Nombre del usuario")
    ingreso_mensual: float = Field(..., ge=0, description="Ingreso mensual neto")
    gastos_fijos: float = Field(
        0, ge=0, description="Gastos fijos mensuales (renta, servicios, comida)"
    )
    deudas_actuales: float = Field(
        0, ge=0, description="Pagos de deudas actuales al mes"
    )


class Oferta(BaseModel):
    """Datos de la oferta de financiamiento a analizar."""

    monto: float = Field(..., gt=0, description="Monto recibido")
    plazo_meses: int = Field(..., gt=0, description="Número de pagos mensuales")
    pago_mensual: float = Field(..., gt=0, description="Pago mensual")
    comisiones: float = Field(
        0, ge=0, description="Comisiones y anticipos (se pagan por adelantado)"
    )


class AnalizarRequest(BaseModel):
    """Cuerpo de la petición a /analizar."""

    oferta: Oferta
    perfil: Optional[Perfil] = None


class Alerta(BaseModel):
    """Una alerta emitida por las reglas de negocio."""

    nivel: Literal["alto", "medio"]
    codigo: str
    etiqueta: str
    mensaje: str


Veredicto = Literal["conviene", "con_cuidado", "no_conviene"]


class AnalisisResponse(BaseModel):
    """Resultado del análisis de una oferta."""

    monto: float
    plazo_meses: int
    pago_mensual: float
    comisiones: float
    neto: float
    total: float
    extra: float
    tasa_mensual: float
    tasa_efectiva_anual: float
    libre: Optional[float] = None
    pct_del_libre: Optional[float] = None
    veredicto: Veredicto
    sugerencia: str
    alertas: list[Alerta]
