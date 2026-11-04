"""Pruebas del caso de referencia: $5,000 / 12 meses / $817."""

from fastapi.testclient import TestClient

from app.calculos import (
    sobrecosto,
    sobrecosto_porcentaje,
    tasa_mensual_estimada,
    total_pagado,
)
from app.main import analizar_oferta, app
from app.models import AnalizarRequest, Oferta, Perfil

client = TestClient(app)

MONTO = 5000.0
PLAZO = 12
CUOTA = 817.0


def test_total_pagado():
    # 817 * 12 = 9804
    assert total_pagado(CUOTA, PLAZO) == 9804.0


def test_sobrecosto():
    total = total_pagado(CUOTA, PLAZO)
    # 9804 - 5000 = 4804
    assert sobrecosto(MONTO, total) == 4804.0


def test_sobrecosto_porcentaje():
    total = total_pagado(CUOTA, PLAZO)
    sobre = sobrecosto(MONTO, total)
    # 4804 / 5000 = 96.08 %
    assert sobrecosto_porcentaje(MONTO, sobre) == 96.08


def test_tasa_mensual_estimada_en_rango():
    # Para este caso la tasa mensual implícita ronda el 12 %.
    tasa = tasa_mensual_estimada(MONTO, CUOTA, PLAZO)
    assert 0.10 < tasa < 0.14


def test_analisis_emite_alertas_de_peligro():
    req = AnalizarRequest(
        oferta=Oferta(monto=MONTO, plazo_meses=PLAZO, cuota_mensual=CUOTA),
        perfil=Perfil(ingreso_mensual=2000, gastos_fijos=800),
    )
    res = analizar_oferta(req)

    assert res.total_pagado == 9804.0
    assert res.sobrecosto == 4804.0
    assert res.sobrecosto_porcentaje == 96.08

    codigos = {a.codigo for a in res.alertas}
    # Sobrecosto > 60 % -> peligro por costo.
    assert "sobrecosto_alto" in codigos
    # Cuota 817 sobre disponible 1200 = 68 % -> peligro por cuota.
    assert "cuota_muy_alta" in codigos
    assert res.recomendacion.startswith("No recomendable")


def test_endpoint_analizar_responde_200():
    body = {
        "oferta": {"monto": MONTO, "plazo_meses": PLAZO, "cuota_mensual": CUOTA},
        "perfil": {"ingreso_mensual": 2000, "gastos_fijos": 800},
    }
    r = client.post("/analizar", json=body)
    assert r.status_code == 200
    data = r.json()
    assert data["total_pagado"] == 9804.0
    assert data["sobrecosto"] == 4804.0


def test_endpoint_salud():
    r = client.get("/salud")
    assert r.status_code == 200
    assert r.json() == {"estado": "ok"}


def test_oferta_sin_perfil_no_evalua_ingreso():
    req = AnalizarRequest(
        oferta=Oferta(monto=MONTO, plazo_meses=PLAZO, cuota_mensual=CUOTA),
    )
    res = analizar_oferta(req)
    assert res.porcentaje_ingreso_disponible is None
