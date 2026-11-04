# ¿Cuánto me cuesta de verdad?

App que analiza una oferta de crédito (monto, plazo, pago mensual y comisiones)
y te dice cuánto pagarás de verdad: costo total, cuánto pagas de más, tasa
efectiva anual, qué parte de tu dinero libre se lleva y un veredicto claro.

Pensada para México: textos en español y montos en pesos (MXN).

**Es una app 100% frontend.** Todo el cálculo corre en tu navegador: no hay
backend, no hay API, no hay base de datos y no necesita conexión a internet una
vez cargada. Tus datos nunca salen de tu equipo.

- **Stack:** React + Vite (JavaScript simple, sin librerías pesadas)
- **Hosting:** AWS Amplify Hosting
- **UI:** menú lateral fijo, tema claro/oscuro, íconos SVG, glassmorphism,
  neumorfismo, animaciones y gráficas en SVG
- **App en vivo:** https://main.ddt6q7wyxg0ov.amplifyapp.com

## Estructura

```
AplicacionDecisionesFinancieras/
├── .kiro/          steering y specs de Kiro
├── frontend/       la app React + Vite (todo el código y el cálculo)
├── docs/           arquitectura y pitch
├── amplify.yml     build spec de Amplify (frontend/)
├── .gitignore
└── README.md
```

Toda la lógica vive en `frontend/src/services/analisis.js`.

## Correr en local

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. No hay que configurar variables de entorno.

Para generar la versión de producción:

```bash
cd frontend
npm run build      # genera frontend/dist/
npm run preview    # sirve el build localmente para probarlo
```

## Reglas de cálculo (deterministas, sin IA)

Definidas en `frontend/src/services/analisis.js`:

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

### Caso de referencia (Ana)

Perfil: ingreso 8000, gastos 4500, deudas 600 → dinero libre 2900.
Oferta: 5000 a 12 meses, pago 817, sin comisiones.

Resultado: total **$9,804**, extra **$4,804**, tasa efectiva anual **≈ 300%**,
**28%** del dinero libre, veredicto **no conviene**.

## Despliegue en AWS Amplify

El repositorio ya trae `amplify.yml` configurado (monorepo, `appRoot: frontend`).

1. Sube el proyecto a un repositorio Git.
2. En la consola de AWS: **Amplify → conecta tu repo y la rama `main`**.
3. Amplify detecta `amplify.yml`, corre `npm ci` + `npm run build` y publica
   `frontend/dist/` con HTTPS y CDN.

Cada push a `main` dispara un nuevo despliegue automático. No hay que configurar
variables de entorno.

> Como la app es estática, también se puede alojar en S3 + CloudFront, Netlify,
> Vercel o GitHub Pages sin cambios.

## Aviso

Es una estimación informativa. No sustituye el contrato ni la asesoría
financiera.
