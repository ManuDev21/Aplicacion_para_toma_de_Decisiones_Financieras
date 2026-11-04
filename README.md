# ¿Cuánto me cuesta de verdad?

App que analiza una oferta de crédito (monto, plazo, pago mensual y comisiones)
y te dice cuánto pagarás de verdad: costo total, cuánto pagas de más, tasa
efectiva anual, qué parte de tu dinero libre se lleva y un veredicto claro.

Pensada para México: textos en español y montos en pesos (MXN).

- **Frontend:** React + Vite (JavaScript simple, sin librerías pesadas)
- **Backend:** Python. Lógica compartida que se expone como API FastAPI (local)
  y como función AWS Lambda (producción)
- **Infra:** AWS SAM (Lambda Function URL con CORS)
- **UI:** menú lateral fijo, tema claro/oscuro, íconos SVG, glassmorphism,
  neumorfismo y animaciones suaves

## Estructura

```
AplicacionDecisionesFinancieras/
├── .kiro/          steering y specs de Kiro
├── frontend/       React + Vite
├── backend/        lógica Python + FastAPI + handler Lambda + pruebas
├── infra/          plantilla SAM y Dockerfile
├── docs/           arquitectura y pitch
├── .gitignore
└── README.md
```

## Reglas de cálculo (deterministas, sin IA)

```
neto  = monto - comisiones
total = pago * plazo + comisiones
extra = total - monto
r (mensual): neto = pago * (1 - (1 + r)^(-plazo)) / r   (bisección; 0 si no hay interés)
tasa_efectiva_anual = (1 + r)^12 - 1
libre = ingreso - gastos - deudas
pct_del_libre = pago / libre     (nulo si libre <= 0 -> veredicto no conviene)
```

### Alertas y veredicto

- Tasa efectiva anual > 100% → alerta alta.
- Comisiones > 10% del monto → alta; > 5% → media.
- Pago ≥ 35% del dinero libre → alta; ≥ 20% → media.
- Veredicto: **no_conviene** si hay alguna alta, **con_cuidado** si solo hay
  medias, **conviene** si no hay ninguna.

## Backend (FastAPI en local)

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements-dev.txt   # incluye pytest y httpx
uvicorn app.main:app --reload
```

API en `http://localhost:8000`, docs en `http://localhost:8000/docs`.

### Pruebas

```bash
cd backend
pytest
```

Incluye el flujo demo de **Ana** (ingreso 8000, gastos 4500, deudas 600) con la
oferta 5000 / 12 meses / 817 → total **$9,804**, extra **$4,804**, tasa
efectiva anual **≈ 300%**, **28%** del dinero libre, veredicto **no conviene**.

## Frontend (React + Vite)

```bash
cd frontend
cp .env.example .env   # ajusta VITE_API_URL si hace falta
npm install
npm run dev
```

App en `http://localhost:5173`. Llama a la API usando `VITE_API_URL`.

## Despliegue con SAM (Lambda + Function URL)

```bash
cd infra
sam build
sam deploy --guided
```

Durante el despliegue se pide `CorsOrigin`: debe ser la URL exacta del frontend
(sin `*`). `MaxConcurrency` (por defecto 5) limita las ejecuciones simultáneas
para acotar abuso y costos; usa `0` si tu cuenta tiene un límite de
concurrencia bajo y no permite reservar.

El output `FunctionUrl` es la URL pública de la API: ponla en `VITE_API_URL`
del frontend antes de publicar. El frontend se puede alojar en Amplify Hosting
o en S3 + CloudFront (región us-east-2).

### Alternativa en contenedor (dev / hosting propio)

```bash
cd infra
docker build -t decisiones-financieras-api -f Dockerfile ../backend
docker run -p 8000:8000 decisiones-financieras-api
```

## Aviso

Es una estimación informativa. No sustituye el contrato ni la asesoría
financiera.
