# Stack técnico

## Frontend
- **React + Vite** (JavaScript).
- Componentes: menú lateral, interruptor de tema claro/oscuro, tarjetas de
  resultados.
- Páginas: `Perfil` y `AnalizarOferta`.
- Hooks propios: perfil guardado (localStorage) y tema claro/oscuro.
- Estilos con variables CSS para tema claro y oscuro.
- Las llamadas a la API viven en `src/services/`.

## Backend
- **FastAPI + Python** servido con **Uvicorn**.
- Una sola responsabilidad: recibir una oferta, ejecutar los cálculos y las
  reglas de alertas, y devolver el análisis en JSON.
- CORS habilitado para que el frontend (Vite) pueda llamar a la API.
- Pruebas con **pytest** sobre el caso $5,000 / 12 meses / $817.

## Infraestructura
- `infra/` contiene la definición de despliegue de la API FastAPI
  (contenedor + variables de entorno + CORS).

## Convenciones
- La URL de la API en el frontend se lee de una variable de entorno
  (`VITE_API_URL`), nunca se escribe directamente en el código.
- Nada de secretos reales en el repo: solo archivos `.env.example`.
