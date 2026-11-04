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

pip install -r requirements.txt
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

## Despliegue en AWS (Amplify + SAM)

Guía paso a paso: [`docs/despliegue-aws.md`](docs/despliegue-aws.md).

En resumen:

1. **API con SAM** (Lambda + Function URL con CORS):
   ```bash
   cd infra
   sam build
   sam deploy --guided
   ```
   El output `FunctionUrl` es la URL pública de la API.

2. **Frontend con Amplify Hosting**: conecta el repo en la consola de Amplify.
   Ya existe `amplify.yml` en la raíz (configurado para el subdirectorio
   `frontend/`). En las variables de entorno de Amplify define
   `VITE_API_URL` con la `FunctionUrl` del paso 1.

3. **CORS**: vuelve a desplegar la API pasando la URL de Amplify para
   restringir el acceso:
   ```bash
   sam deploy --parameter-overrides CorsOrigin=https://tu-app.amplifyapp.com
   ```

Región sugerida: us-east-2 (capa gratuita o créditos).

### Alternativa en contenedor (dev / hosting propio)

```bash
cd infra
docker build -t decisiones-financieras-api -f Dockerfile ../backend
docker run -p 8000:8000 decisiones-financieras-api
```

## Aviso

Es una estimación informativa. No sustituye el contrato ni la asesoría
financiera.
