# Estructura y reglas del equipo

## Estructura del repositorio

```
AplicacionDecisionesFinancieras/
├── .kiro/
│   ├── steering/        product.md, tech.md, structure.md
│   └── specs/           requirements, design y tasks por feature
├── frontend/            React + Vite
│   ├── public/
│   ├── src/
│   │   ├── components/  menú lateral, interruptor de tema, tarjetas
│   │   ├── pages/       Perfil y AnalizarOferta
│   │   ├── hooks/       perfil guardado y tema claro/oscuro
│   │   ├── services/    llamadas a la API
│   │   ├── styles/      variables de color claro y oscuro
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── .env.example
├── backend/             FastAPI + Python
│   ├── app/             la API: main, cálculos y reglas de alertas
│   ├── tests/           pruebas del caso $5,000 / 12 meses / $817
│   └── requirements.txt
├── infra/               despliegue de la API (contenedor + CORS)
│   └── template.yaml
├── docs/
│   ├── arquitectura.png diagrama (y su archivo fuente)
│   └── pitch/           diapositivas y guion
├── .gitignore
└── README.md
```

## Reglas del equipo
- El frontend no asume la URL de la API: siempre vía `VITE_API_URL`.
- El backend es la única fuente de verdad de los cálculos y las alertas.
- Toda regla de alerta nueva debe venir acompañada de una prueba en
  `backend/tests/`.
- Los commits se hacen a ramas, nunca directo a `main`.
- Nada de credenciales ni valores reales en los archivos versionados.
