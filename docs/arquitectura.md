# Arquitectura

La app es 100% frontend (estática): todo el cálculo corre en el navegador, no
hay backend ni llamadas de red.

Flujo general:

```
Navegador (React + Vite)
    │  el usuario captura perfil y oferta
    ▼
src/hooks/useAnalisis.js   (recalcula al cambiar cualquier dato)
    │
    ▼
src/services/analisis.js
    ├─ fórmulas: neto, total, extra, tasa mensual (bisección), TEA
    ├─ libre y % del dinero libre
    └─ alertas, veredicto y sugerencia
    │
    ▼
La UI muestra tarjetas, métricas animadas, gráficas (SVG) y alertas
```

Despliegue: AWS Amplify Hosting compila el frontend (`amplify.yml`) y lo publica
con HTTPS y CDN. Al ser estática, también funciona en cualquier hosting estático.
