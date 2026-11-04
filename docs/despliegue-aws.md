# Despliegue en AWS (Amplify + SAM)

La app se despliega en dos piezas que se enlazan con una sola variable:

- **Backend (API):** AWS SAM crea una Lambda con Function URL pública y CORS.
- **Frontend (SPA):** AWS Amplify Hosting compila React + Vite y lo publica
  con CDN y HTTPS.
- **Enlace:** la Function URL de la Lambda se pone en `VITE_API_URL` del
  frontend.

Región sugerida: **us-east-2** (según `tech.md`). Todo cabe en capa gratuita o
créditos.

---

## 1. Desplegar la API con SAM

Requisitos: [AWS CLI](https://aws.amazon.com/cli/) y
[AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
con credenciales configuradas (`aws configure`).

```bash
cd infra
sam build
sam deploy --guided
```

En el asistente:
- Stack name: `cuanto-me-cuesta` (o el que prefieras)
- Region: `us-east-2`
- `CorsOrigin`: por ahora `*`. Cuando tengas la URL de Amplify, vuelve a
  desplegar poniendo esa URL exacta para restringir CORS.

Al terminar, SAM imprime el output **`FunctionUrl`**. Cópialo: es la URL de tu
API (algo como `https://xxxx.lambda-url.us-east-2.on.aws/`).

Pruébala:

```bash
curl -X POST "<FunctionUrl>" \
  -H "Content-Type: application/json" \
  -d '{"oferta":{"monto":5000,"plazo_meses":12,"pago_mensual":817,"comisiones":0},"perfil":{"nombre":"Ana","ingreso_mensual":8000,"gastos_fijos":4500,"deudas_actuales":600}}'
```

---

## 2. Desplegar el frontend en Amplify Hosting

El repositorio ya incluye `amplify.yml` en la raíz, configurado para un
monorepo con el frontend en `frontend/` (`appRoot: frontend`).

### Opción A: desde la consola (recomendada)

1. Sube el proyecto a un repositorio Git (GitHub, GitLab o CodeCommit).
2. En la consola de AWS: **Amplify -> Deploy an app -> conecta tu repo y rama**.
3. Amplify detecta el `amplify.yml`. Confirma que el **app root** es `frontend`.
4. En **Environment variables**, agrega:
   - `VITE_API_URL` = la `FunctionUrl` del paso 1.
5. Guarda y despliega. Amplify corre `npm ci` + `npm run build` y publica `dist/`.

### Opción B: con la CLI de Amplify Hosting

```bash
npm install -g @aws-amplify/cli
amplify configure
# luego conecta el repo e indica frontend/ como app root
```

### Rewrite para SPA (si agregas rutas)

Hoy la navegación es por estado (no usa rutas de URL), así que no hace falta.
Si en el futuro agregas rutas de navegador, añade en Amplify
(**Rewrites and redirects**) una regla:

| Source address | Target address | Type |
|----------------|----------------|------|
| `/<*>`         | `/index.html`  | 200 (Rewrite) |

---

## 3. Cerrar el círculo de CORS

Cuando Amplify te dé la URL del sitio (algo como
`https://main.xxxx.amplifyapp.com`):

1. Vuelve a `infra/` y redepliega la API con esa URL:
   ```bash
   sam deploy --parameter-overrides CorsOrigin=https://main.xxxx.amplifyapp.com
   ```
2. Así la Lambda solo acepta peticiones desde tu frontend, en vez de `*`.

---

## Resumen del flujo

```
SAM deploy  ->  FunctionUrl
                   │
                   ▼
Amplify env var VITE_API_URL = FunctionUrl
                   │
                   ▼
Amplify build (npm run build) -> publica dist/ con HTTPS + CDN
                   │
                   ▼
Frontend llama a la Lambda  ->  CORS restringido a la URL de Amplify
```

---

## Problemas comunes

### "CORS policy… blocked" apuntando a `http://localhost:8000`

Si en la consola del navegador ves algo como:

```
Access to fetch at 'http://localhost:8000/analizar' from origin
'https://main.xxxx.amplifyapp.com' has been blocked by CORS policy
```

El verdadero problema **no es el CORS**: tu frontend desplegado está llamando a
`localhost` en vez de a tu Lambda. Vite "hornea" `VITE_API_URL` en el momento
del build, así que si la variable no existía al compilar, usó el valor por
defecto del código (`http://localhost:8000`).

Solución:
1. En Amplify → App settings → Environment variables, define
   `VITE_API_URL` con la `FunctionUrl` (empieza con `https://`, sin barra final).
2. **Redeploy** en Amplify (Deployments → Redeploy this version). Sin recompilar,
   la variable no entra al bundle.
3. Luego ajusta el CORS de la Lambda a tu dominio (sección 3).

Para comprobar qué URL quedó compilada, abre el sitio, F12 → pestaña Network, y
mira a qué host va la petición `analizar`.

### El preflight (OPTIONS) falla con header duplicado

La Function URL ya inyecta encabezados `Access-Control-*` por su bloque `Cors`.
El handler está escrito para reflejar el origen sin duplicar. Si cambiaste el
`template.yaml`, mantén el CORS en **un solo lugar** (preferible el bloque
`FunctionUrlConfig.Cors`).
