# Producto: ¿Cuánto me cuesta de verdad?

## Problema
Muchas personas en México aceptan préstamos de apps, tarjetas departamentales
o "meses sin intereses" sin saber cuánto pagarán en realidad ni si la oferta es
una trampa. Queremos que lo sepan justo antes de endeudarse.

## Usuario
Persona joven o adulta con ingresos limitados que recibe una oferta de crédito.
Textos en español de México, montos en pesos (MXN).

## Qué hace la app (alcance del MVP, no agregar más)
1. Perfil: nombre, ingreso mensual, gastos fijos y pagos de deudas actuales.
   Se guarda en el navegador y se conserva aunque se cierre la app.
2. Analizar oferta: monto, plazo en meses, pago mensual y comisiones.
3. Cálculo del costo total, cuánto se paga de más, tasa efectiva anual y qué
   porcentaje del dinero libre se llevaría el pago.
4. Alertas por reglas simples (anticipo o comisiones, tasa muy alta, pago
   excesivo).
5. Resultado con veredicto (conviene, con cuidado, no conviene) y sugerencias
   fijas.
6. Menú lateral y modo claro/oscuro.

## Fuera de alcance (no construir)
Foto de la oferta, puntaje de salud financiera, registro de gastos, historial
de ofertas, cuentas de usuario, base de datos, IA en el cálculo.

## Flujo de la demo (debe funcionar siempre)
Perfil guardado de "Ana" (ingreso 8000, gastos 4500, deudas 600) y oferta de
5000 a 12 meses con pago de 817. Resultado esperado: total 9804, extra 4804,
tasa efectiva anual cercana a 300%, 28% del dinero libre, veredicto
"no conviene".

## Aviso visible en la app
Es una estimación informativa. No sustituye el contrato ni la asesoría
financiera.
