# Estructura y reglas del equipo

## Estructura del repositorio

```
AplicacionDecisionesFinancieras/
├── .kiro/
│   ├── steering/        product.md, tech.md, structure.md
│   └── specs/           requirements, design y tasks por feature
├── frontend/            React + Vite (JS simple, sin librerías pesadas)
│   ├── src/
│   │   ├── components/  Sidebar, ThemeToggle, MetricCard, AlertList, icons,
│   │   │                EstadoPill, ValorAnimado y charts/ (dona, barra, línea)
│   │   ├── pages/       Perfil y AnalizarOferta
│   │   ├── hooks/       usePerfil, useTheme, useAnalisis, useContador
│   │   ├── services/    analisis.js (cálculo local) y formato.js (MXN)
│   │   ├── styles/      theme.css (variables) y app.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── arquitectura.md  diagrama y notas
│   └── pitch/           diapositivas y guion
├── amplify.yml          build spec de Amplify Hosting (appRoot: frontend)
├── .gitignore
└── README.md
```

## Reglas del equipo
- Toda la lógica (fórmulas, umbrales, alertas, veredicto) vive en un solo lugar:
  `frontend/src/services/analisis.js`. Es la única fuente de verdad del cálculo.
- El cálculo es determinista, sin IA, y corre en el navegador. No hay backend.
- Los commits se hacen a ramas; `main` es la rama de producción de Amplify.
- Nada de credenciales ni valores reales en los archivos versionados.
- Textos en español de México; montos en MXN (es-MX).
- Íconos SVG, sin emojis.
