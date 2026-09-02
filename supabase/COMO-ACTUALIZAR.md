# Cómo aplicar los cambios en Supabase

Entra a **Supabase → SQL Editor → New query**, pega el contenido del archivo
y dale Run. En este orden:

| # | Archivo | Para qué | ¿Borra datos? |
|---|---------|----------|----------------|
| 1 | `seed.sql` | Actualiza el catálogo: precios de los 4 proveedores y precios de venta (+$2.000) | Solo reemplaza la tabla de precios de proveedor. **No toca** clientes, cuentas ni ventas |
| 2 | `migracion-plazas.sql` | Plazas, suscripciones y las funciones de renovar/mover | No borra nada. Se puede correr varias veces |
| 3 | `migracion-clientes.sql` | Clientes por número **o** por @usuario, nombre opcional, y la alerta de «cuenta mala» | No borra nada. Se puede correr varias veces |

Los dos se pueden volver a correr cuando quieras: no duplican ni destruyen nada.

## Qué cambió esta vez

- **Precio de venta = costo del proveedor más barato + $2.000** (antes era +$1.000).
- **La cuenta ya no lleva "precio de venta".** Solo lleva lo que te costó.
  El precio se decide en cada venta, que es donde de verdad vive.
- **La ganancia usa el costo real de la cuenta, no el costo por plaza.**
  El costo se descuenta **una sola vez**, en la primera venta de esa cuenta:

  ```
  Cuenta de Paramount+ que te costó $4.000, con 5 plazas
  Venta 1 → cobras $7.000, costo $4.000  → ganas $3.000
  Venta 2 → cobras $7.000, costo $0      → ganas $7.000
  Venta 3 → cobras $7.000, costo $0      → ganas $7.000
  ─────────────────────────────────────────────────────
  Vendido $21.000 · Costo $4.000 · Ganancia $17.000
  ```

  Así el primer número coincide con tu cabeza ($7 − $4 = $3) y el total
  nunca queda inflado por contar la misma cuenta cinco veces.


## Clientes por número o por @usuario

WhatsApp ya deja tener un **@usuario** público además del número, y los dos
conviven: el número sigue siendo la base de la cuenta, pero mucha gente ya solo
comparte el usuario.

Desde ahora un cliente se guarda con lo que tengas — el número, el usuario, o
los dos — y **el nombre es opcional**. En las listas se muestra el nombre si lo
pusiste; si no, el `@usuario`; si no, el número.

Una advertencia honesta: **el botón de «Escribir» necesita el número.** WhatsApp
todavía no tiene un enlace que abra un chat a partir del usuario, así que a los
clientes que solo tengan `@usuario` les vas a tener que escribir desde la app.
Cuando puedas, pídeles también el número.


## Cuando marcas una cuenta como vencida

Antes el panel solo avisaba si la **fecha** de la cuenta se vencía antes que los
días del cliente. Si tú entrabas y le cambiabas el estado a *vencida* o
*suspendida* a mano, no avisaba nada.

Ahora avisa por las dos razones, y en **Vencimientos** sale la lista completa con
nombre y apellido: quién es, qué servicio tiene, en qué cuenta está, hasta
cuándo tiene derecho, y el botón para pasarlo a otra cuenta ahí mismo.

En **Cuentas**, si una cuenta que marcaste como mala todavía tiene gente adentro,
sus nombres salen en ámbar con un enlace directo para moverlos.
