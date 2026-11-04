# Stack y reglas técnicas

## Stack
- Frontend: React con Vite, en /frontend. JavaScript simple, sin librerías
  pesadas.
- Backend: Python en /backend. La lógica vive en `app/` (cálculos, alertas,
  modelos) y se expone de dos maneras equivalentes:
  - API FastAPI (`app/main.py`) para desarrollo local y contenedor.
  - Handler AWS Lambda (`app/lambda_handler.py`) para el despliegue con SAM.
- Infraestructura como código con AWS SAM, en /infra/template.yaml.
- API: Lambda Function URL pública con CORS configurado.
- Hosting del frontend: Amplify Hosting, o S3 con CloudFront.
- Región: us-east-2. Todo en capa gratuita o créditos; evitar servicios caros.

## Reglas de cálculo
- Todo el cálculo es determinista, con fórmulas. Nunca usar IA para calcular.
- Las comisiones y anticipos se pagan por adelantado.
- `neto = monto - comisiones`
- `total = pago * plazo + comisiones`
- `extra = total - monto`
- Tasa mensual r: la que cumple `neto = pago * (1 - (1 + r)^(-plazo)) / r`,
  resuelta por bisección. Si `pago * plazo <= neto`, la tasa es 0.
- `tasa_efectiva_anual = (1 + r)^12 - 1`
- `libre = ingreso - gastos - deudas`
- `pct_del_libre = pago / libre` (nulo si libre <= 0, y en ese caso veredicto
  no conviene)

## Alertas (umbrales ajustables, definidos como constantes en un solo lugar)
- Alto: tasa efectiva anual mayor a 100%.
- Alto: comisiones mayores al 10% del monto. Medio: mayores al 5%.
- Alto: pct_del_libre de 35% o más. Medio: de 20% o más.
- Veredicto: "no_conviene" si hay alguna alerta alta, "con_cuidado" si solo hay
  medias, "conviene" si no hay ninguna.

## Frontend
- Todos los colores salen de variables CSS con dos temas, claro y oscuro.
  El tema elegido se guarda en localStorage.
- Perfil en localStorage, guardado como lista de perfiles con un perfil activo,
  aunque la interfaz solo muestre uno.
- Diseño pensado primero para escritorio, con menú lateral fijo. Que también se
  vea bien en celular.
- Montos con formato de pesos mexicanos (es-MX).
- La URL de la API viene de la variable VITE_API_URL.
- Íconos SVG (sin emojis). Estética con glassmorphism, neumorfismo y
  animaciones suaves.
