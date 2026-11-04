# Producto

## Problema
Muchas personas reciben ofertas de crédito o financiamiento (compras a plazos,
préstamos personales, tarjetas) y no tienen una forma rápida de saber si la
oferta les conviene. Comparar tasa, plazo y cuota mensual a mano es tedioso y
propenso a errores.

## Usuario
Persona sin formación financiera que quiere una respuesta clara y honesta antes
de aceptar una oferta de financiamiento.

## Alcance del MVP
- El usuario guarda un **perfil** sencillo (ingreso mensual, gastos fijos).
- El usuario pega los datos de una **oferta**: monto, plazo en meses y cuota
  mensual (o tasa).
- La app calcula el costo total, el interés implícito y el porcentaje de la
  cuota sobre el ingreso disponible.
- La app devuelve **alertas** claras (por ejemplo: "la cuota supera el 30 % de
  tu ingreso disponible") y una recomendación simple.

## Caso de prueba de referencia
Monto $5,000, plazo 12 meses, cuota $817 → la app debe calcular el total
pagado, el sobrecosto frente al monto y emitir las alertas correspondientes.

## Fuera de alcance (por ahora)
- Autenticación de usuarios.
- Persistencia en base de datos (el perfil vive en el navegador).
- Asesoría financiera personalizada o regulada.
