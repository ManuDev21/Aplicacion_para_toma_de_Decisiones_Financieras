# Estructura y reglas del equipo

## Estructura del repositorio

```
AplicacionDecisionesFinancieras/
├── .kiro/
│   ├── steering/        product.md, tech.md, structure.md
│   └── specs/           requirements, design y tasks por feature
├── frontend/            React + Vite (JS simple, sin librerías pesadas)
│   ├── src/
│   │   ├── components/  Sidebar, ThemeToggle, MetricCard, AlertList, icons
│   │   ├── pages/       Perfil y AnalizarOferta
│   │   ├── hooks/       usePerfil (localStorage) y useTheme
│   │   ├── services/    api.js (fetch) y formato.js (MXN)
│   │   ├── styles/      theme.css (variables) y app.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── .env.example
├── backend/             Python (lógica compartida FastAPI + Lambda)
│   ├── app/
│   │   ├── calculos.py       fórmulas (determinista, sin IA)
│   │   ├── alertas.py        umbrales, alertas y veredicto
│   │   ├── models.py         modelos Pydantic
│   │   ├── main.py           API FastAPI
│   │   └── lambda_handler.py handler para AWS Lambda
│   ├── tests/           pruebas del flujo demo de Ana
│   └── requirements.txt
├── infra/               AWS SAM
│   ├── template.yaml    Lambda + Function URL con CORS
│   └── Dockerfile       alternativa en contenedor (dev / hosting propio)
├── docs/
│   ├── arquitectura.md  diagrama y notas
│   └── pitch/           diapositivas y guion
├── .gitignore
└── README.md
```

## Reglas del equipo
- El frontend no asume la URL de la API: siempre vía `VITE_API_URL`.
- El backend (`app/`) es la única fuente de verdad de los cálculos y las
  alertas. FastAPI y Lambda comparten la misma función `analizar_oferta`.
- Toda regla o umbral nuevo debe venir con una prueba en `backend/tests/`.
- Los commits se hacen a ramas, nunca directo a `main`.
- Nada de credenciales ni valores reales en los archivos versionados.
- Textos en español de México; montos en MXN (es-MX).
- Íconos SVG, sin emojis.
