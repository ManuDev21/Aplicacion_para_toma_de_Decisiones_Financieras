"""Pruebas del flujo demo de Ana.

Perfil: ingreso 8000, gastos 4500, deudas 600 -> libre 2900.
Oferta: 5000 a 12 meses, pago 817, comisiones 0.
Esperado: total 9804, extra 4804, tasa efectiva anual ~300%, 28% del libre,
veredicto "no_conviene".
"""

from fastapi.testclient import TestClient

from app import alertas as reglas
from app import calculos
from app.main import analizar_oferta, app
from app.models import AnalizarRequest, Oferta, Perfil

client = TestClient(app)

# Oferta demo
MONTO = 5000.0
PLAZO = 12
PAGO = 817.0
COMISIONES = 0.0

# Perfil demo (Ana)
INGRESO = 8000.0
GASTOS = 4500.0
DEUDAS = 600.0


def test_neto_sin_comisiones():
    assert calculos.neto(MONTO, COMISIONES) == 5000.0


def test_total():
    # 817 * 12 + 0 = 9804
    assert calculos.total(PAGO, PLAZO, COMISIONES) == 9804.0


def test_extra():
    total = calculos.total(PAGO, PLAZO, COMISIONES)
    assert calculos.extra(total, MONTO) == 4804.0


def test_tasa_efectiva_anual_cercana_a_300():
    neto = calculos.neto(MONTO, COMISIONES)
    r = calculos.tasa_mensual(neto, PAGO, PLAZO)
    tea = calculos.tasa_efectiva_anual(r)
    # Cercana a 300 %.
    assert 290 < tea < 310


def test_libre_de_ana():
    # 8000 - 4500 - 600 = 2900
    assert calculos.libre(INGRESO, GASTOS, DEUDAS) == 2900.0


def test_pct_del_libre_28():
    dinero_libre = calculos.libre(INGRESO, GASTOS, DEUDAS)
    # 817 / 2900 = 28.17 % -> redondea a 28 % al mostrar
    assert round(calculos.pct_del_libre(PAGO, dinero_libre)) == 28


def test_analisis_ana_no_conviene():
    req = AnalizarRequest(
        oferta=Oferta(
            monto=MONTO, plazo_meses=PLAZO, pago_mensual=PAGO, comisiones=COMISIONES
        ),
        perfil=Perfil(
            nombre="Ana",
            ingreso_mensual=INGRESO,
            gastos_fijos=GASTOS,
            deudas_actuales=DEUDAS,
        ),
    )
    res = analizar_oferta(req)

    assert res.total == 9804.0
    assert res.extra == 4804.0
    assert 290 < res.tasa_efectiva_anual < 310
    assert res.libre == 2900.0
    assert round(res.pct_del_libre) == 28
    assert res.veredicto == "no_conviene"

    codigos = {a.codigo for a in res.alertas}
    # Tasa > 100 % -> alerta alta de tasa.
    assert "tasa_alta" in codigos


def test_comisiones_altas_disparan_alerta():
    # Comisiones de 600 sobre 5000 = 12 % (> 10 %) -> alerta alta.
    alertas = reglas.evaluar(
        tasa_efectiva_anual=50.0,
        comisiones=600.0,
        monto=5000.0,
        pct_del_libre=10.0,
        libre=2900.0,
    )
    codigos = {a.codigo for a in alertas}
    assert "comisiones_altas" in codigos


def test_comisiones_medias():
    # 300 sobre 5000 = 6 % (> 5 % y <= 10 %) -> alerta media.
    alertas = reglas.evaluar(
        tasa_efectiva_anual=50.0,
        comisiones=300.0,
        monto=5000.0,
        pct_del_libre=10.0,
        libre=2900.0,
    )
    codigos = {a.codigo for a in alertas}
    assert "comisiones_medias" in codigos


def test_veredicto_conviene_sin_alertas():
    alertas = reglas.evaluar(
        tasa_efectiva_anual=20.0,
        comisiones=0.0,
        monto=5000.0,
        pct_del_libre=10.0,
        libre=5000.0,
    )
    assert alertas == []
    assert reglas.veredicto(alertas, 5000.0) == "conviene"


def test_veredicto_con_cuidado_solo_medias():
    alertas = reglas.evaluar(
        tasa_efectiva_anual=20.0,
        comisiones=300.0,  # 6 % -> media
        monto=5000.0,
        pct_del_libre=25.0,  # 20-35 % -> media
        libre=5000.0,
    )
    niveles = {a.nivel for a in alertas}
    assert niveles == {"medio"}
    assert reglas.veredicto(alertas, 5000.0) == "con_cuidado"


def test_libre_no_positivo_no_conviene():
    assert reglas.veredicto([], 0.0) == "no_conviene"
    assert calculos.pct_del_libre(817.0, 0.0) is None


def test_endpoint_analizar_responde_200():
    body = {
        "oferta": {
            "monto": MONTO,
            "plazo_meses": PLAZO,
            "pago_mensual": PAGO,
            "comisiones": COMISIONES,
        },
        "perfil": {
            "nombre": "Ana",
            "ingreso_mensual": INGRESO,
            "gastos_fijos": GASTOS,
            "deudas_actuales": DEUDAS,
        },
    }
    r = client.post("/analizar", json=body)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 9804.0
    assert data["extra"] == 4804.0
    assert data["veredicto"] == "no_conviene"


def test_endpoint_salud():
    r = client.get("/salud")
    assert r.status_code == 200
    assert r.json() == {"estado": "ok"}


# ---------- Handler Lambda ----------


def test_lambda_handler_post_analiza():
    import json

    from app.lambda_handler import handler

    event = {
        "requestContext": {"http": {"method": "POST"}},
        "body": json.dumps(
            {
                "oferta": {
                    "monto": MONTO,
                    "plazo_meses": PLAZO,
                    "pago_mensual": PAGO,
                    "comisiones": COMISIONES,
                },
                "perfil": {
                    "nombre": "Ana",
                    "ingreso_mensual": INGRESO,
                    "gastos_fijos": GASTOS,
                    "deudas_actuales": DEUDAS,
                },
            }
        ),
    }
    res = handler(event, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body["total"] == 9804.0
    assert body["extra"] == 4804.0
    assert body["veredicto"] == "no_conviene"


def test_lambda_handler_options_preflight():
    from app.lambda_handler import handler

    event = {"requestContext": {"http": {"method": "OPTIONS"}}}
    res = handler(event, None)
    assert res["statusCode"] == 200
    assert "Access-Control-Allow-Origin" in res["headers"]


def test_lambda_handler_body_invalido():
    from app.lambda_handler import handler

    event = {"requestContext": {"http": {"method": "POST"}}, "body": "{no-json"}
    res = handler(event, None)
    assert res["statusCode"] == 400


def test_lambda_handler_refleja_origen_con_asterisco(monkeypatch):
    # Con CORS_ORIGIN="*" debe reflejar el Origin de la petición.
    import importlib

    import app.lambda_handler as lh

    monkeypatch.setenv("CORS_ORIGIN", "*")
    importlib.reload(lh)

    origen = "https://main.ddt6q7wyxg0ov.amplifyapp.com"
    event = {
        "requestContext": {"http": {"method": "OPTIONS"}},
        "headers": {"origin": origen},
    }
    res = lh.handler(event, None)
    assert res["headers"]["Access-Control-Allow-Origin"] == origen
    assert res["headers"]["Vary"] == "Origin"

    importlib.reload(lh)  # restaura el estado por defecto


def test_lambda_handler_origen_fijo(monkeypatch):
    # Con CORS_ORIGIN fijo debe devolver esa URL exacta.
    import importlib

    import app.lambda_handler as lh

    permitido = "https://mi-frontend.example.com"
    monkeypatch.setenv("CORS_ORIGIN", permitido)
    importlib.reload(lh)

    event = {
        "requestContext": {"http": {"method": "OPTIONS"}},
        "headers": {"Origin": "https://otro-sitio.com"},
    }
    res = lh.handler(event, None)
    assert res["headers"]["Access-Control-Allow-Origin"] == permitido

    monkeypatch.delenv("CORS_ORIGIN", raising=False)
    importlib.reload(lh)
