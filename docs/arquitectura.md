# Arquitectura

Aquí va el diagrama de arquitectura (`arquitectura.png`) y su archivo fuente.

Flujo general:

```
Navegador (React + Vite)
    │  POST /analizar  (fetch con VITE_API_URL)
    ▼
API FastAPI (Uvicorn)
    ├─ app/calculos.py   → total, sobrecosto, tasa estimada
    └─ app/alertas.py    → reglas de alerta y recomendación
    │  JSON con el análisis
    ▼
Navegador muestra tarjetas + alertas
```
