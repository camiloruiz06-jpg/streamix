# Streamix · Plataforma de venta y gestión de servicios de streaming

Tienda pública + panel administrativo + base de datos, en un solo proyecto.

```
🌐 TIENDA  →  💬 WHATSAPP  →  🖥️ DASHBOARD
```

---

## 1. Arranque rápido (5 minutos)

Necesitas **Node.js 18 o superior** ([descárgalo aquí](https://nodejs.org)).

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

El proyecto arranca en **modo demostración** con datos de ejemplo, así que puedes
navegar la tienda y el panel (<http://localhost:3000/admin>) antes de configurar nada.

---

## 2. Conectar tu base de datos (Supabase)

### 2.1 Crear el proyecto

1. Entra a <https://supabase.com> y crea una cuenta (el plan gratuito sobra para empezar).
2. **New project** → ponle un nombre, elige región *East US* o *South America* y guarda
   la contraseña de la base de datos.
3. Espera 1–2 minutos a que termine de crearse.

### 2.2 Crear las tablas

1. En el menú lateral entra a **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** el contenido,
   pégalo y pulsa **Run**.
3. Repite lo mismo con `supabase/seed.sql` si quieres empezar con datos de ejemplo
   (puedes borrarlos después con el bloque de limpieza que trae al final).

### 2.3 Copiar las claves

1. **Project Settings** → **API**.
2. Copia el *Project URL* y la clave *anon public*.
3. En la carpeta del proyecto, duplica `.env.local.example` y renómbralo a `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_WHATSAPP=573014605500
NEXT_PUBLIC_BRAND_NAME=Streamix
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Reinicia el servidor (`Ctrl+C` y de nuevo `npm run dev`). El aviso amarillo de
   "modo demostración" desaparece: ya estás leyendo de tu base real.

### 2.4 Crear tu usuario administrador

1. En Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Escribe tu correo y una contraseña, y marca **Auto Confirm User**.
3. Entra a <http://localhost:3000/admin/login> con esos datos.

> El perfil de administrador se crea solo (hay un trigger en `schema.sql`).
> Cualquier usuario que crees en Authentication tendrá acceso al panel, así que
> **no habilites el registro público** en Supabase.

---

## 3. Cómo se administra el negocio

Todo se controla desde **Supabase → Table Editor**. Los cambios aparecen en la
tienda automáticamente, sin tocar código.

| Tabla | Para qué sirve |
|---|---|
| `categories` | Categorías del catálogo (Streaming, Música, Deportes…) |
| `services` | Cada servicio: nombre, logo, descripción, color, si está publicado |
| `service_plans` | Los planes de cada servicio: duración, precio, pantallas, descuento |
| `providers` | Tus proveedores: contacto, WhatsApp, condiciones, estado |
| `provider_prices` | Precio de cada proveedor por servicio → alimenta el **comparador** |
| `customers` | Clientes: nombre, WhatsApp, correo, estado |
| `accounts` | Inventario: cada cuenta/cupo comprado, con costo, precio y vencimiento |
| `sales` | Ventas: precio, costo y ganancia (se calcula sola) |
| `settings` | Número de WhatsApp, nombre de marca y otros ajustes |

### Agregar un servicio nuevo

1. `services` → **Insert row**: `slug` (sin espacios ni tildes, ej. `apple-tv`),
   `nombre`, `descripcion_corta`, `color` (hex de la marca), `category_id`, `activo = true`.
2. `service_plans` → una fila por cada plan: `service_id`, `nombre`,
   `duracion_dias`, `precio_venta`.
3. Listo, ya aparece en `/servicios`.

> **Logos:** si dejas `logo_url` vacío, la tarjeta muestra un monograma elegante con
> el color de la marca. Para usar imágenes reales, súbelas a Supabase → **Storage**
> y pega la URL pública en `logo_url`.

### Registrar una venta

1. `accounts` → crea la cuenta que compraste (servicio, proveedor, costo, fechas).
2. Cuando la vendas: asígnale `customer_id`, pon `fecha_activacion`,
   `fecha_vencimiento` y cambia `estado` a `activa`.
3. `sales` → inserta la venta con `precio` y `costo`. La ganancia se calcula sola.

### Mantener los estados al día

En el SQL Editor puedes ejecutar cuando quieras:

```sql
select * from refresh_account_statuses();
```

Marca como `vencida` lo que ya pasó de fecha y como `por_vencer` lo que caduca en
los próximos 7 días. Si quieres automatizarlo, actívalo con `pg_cron` en Supabase.

---

## 3.bis Tus proveedores y tus precios

El catálogo ya viene cargado con **32 servicios, 43 planes y 70 precios** de tus
**4 proveedores**, tomados de las listas que pasaste.

**Regla de precio aplicada:** `precio de venta = costo del proveedor más barato + $1.000`.

| Ejemplo | Costo más barato | Se vende en |
|---|---|---|
| Netflix Premium 1 pantalla | $12.000 (Proveedor 4) | **$13.000** |
| Max (HBO) 1 pantalla | $5.000 (Proveedor 3) | **$6.000** |
| Disney+ Premium con ESPN | $9.000 (Proveedor 4) | **$10.000** |
| Combo Netflix + Prime | $19.000 (Proveedor 2) | **$20.000** |

### Cambiar precios o agregar servicios

Todo el catálogo se genera desde un solo archivo: **`scripts/build-catalog.py`**.

```bash
python3 scripts/build-catalog.py
```

Ese comando regenera dos cosas a la vez:

- `src/lib/catalog-data.ts` → lo que ve la app en modo demostración
- `supabase/seed.sql` → lo que cargas en la base de datos real

Dentro del script encuentras la constante `MARGEN = 1000`. Si algún día quieres
subir el margen, cambias ese número, vuelves a ejecutar y listo.

Para agregar un servicio nuevo, copia un bloque `srv(...)` existente y ajusta el
nombre, la categoría y los costos por proveedor. Cada plan recibe un diccionario
`{"p1": (costo, dias), "p2": (costo, dias)}` con lo que cobra cada proveedor: eso
es exactamente lo que alimenta el **comparador**.

Los WhatsApp de tus proveedores ya están cargados:

| Proveedor | WhatsApp |
|---|---|
| Proveedor 1 | +57 324 533 8353 |
| Proveedor 2 | +57 300 877 7786 |
| Proveedor 3 | +57 301 121 6223 |
| Proveedor 4 | +57 313 521 1240 |

Desde **Panel → Proveedores** puedes escribirles con un clic.

> ⚠️ **Falta ponerles nombre real.** Aparecen como "Proveedor 1", "Proveedor 2"…
> Cámbialos en `scripts/build-catalog.py` y vuelve a ejecutarlo, o directamente
> en la tabla `providers` de Supabase.

### Decisiones del catálogo

- **Netflix + Max** y **Netflix + HBO** eran el mismo combo (Max y HBO Max son la
  misma plataforma), así que quedaron unidos en uno solo. Se toma el costo más
  barato: $16.000 del Proveedor 4 → se vende en **$17.000**.
- **Metegol Web** se eliminó del catálogo.

### Cosas que asumí y deberías revisar

- **Proveedor 1 · Netflix:** interpreté "mes y tres días" como **33 días** de vigencia.
- **Proveedor 2:** tenía Disney+ y Crunchyroll repetidos con dos precios. Como pediste,
  dejé **solo el más barato** ($10.000 y $5.000).
- **Disney+ del Proveedor 3:** lo separé en dos planes, "Estándar" ($6.000, el básico) y
  "Premium con ESPN" ($10.000, el full).
- **Paramount+ Deportes** quedó como servicio aparte, con el precio de DSports del
  Proveedor 1 ($8.000) y el de deportes del Proveedor 3 ($10.000).

### Métodos de pago publicados

Llaves (Bre-B) · Nequi · Daviplata · Bancolombia · PayPal.
Se editan en `src/config/site.ts` → `metodosPago`.

---

## 3.ter Logos de los servicios

**Los 32 servicios tienen su logo.** Los individuales salen de las imágenes que
subiste a la carpeta `logos/` del proyecto; los de los combos los genera un
script combinando los logos de las plataformas que incluyen.

| Combo | Cómo se arma el logo |
|---|---|
| 2 plataformas | los dos iconos superpuestos en diagonal |
| 3 plataformas | dos arriba y uno centrado abajo |

Para regenerarlos después de cambiar un logo individual:

```bash
python3 scripts/combos-logos.py
python3 scripts/build-catalog.py
```

### Agregar los que faltan

1. Deja la imagen en la carpeta **`logos/`** del proyecto (la de la raíz, no la
   de `public`). Puede ser PNG, JPG o SVG, con cualquier nombre.
2. Abre `scripts/procesar-logos.py` y agrega una línea al diccionario `MAPA`
   con el nombre del archivo y el slug del servicio:

```python
MAPA = {
    ...
    "mi-logo-de-disney.png": "disney-plus",
}
```

3. Ejecuta los dos comandos:

```bash
python3 scripts/procesar-logos.py
python3 scripts/build-catalog.py
```

El primero recorta la imagen a un cuadrado de 256×256, y si tiene fondo
transparente la pone sobre una placa oscura del color de la marca. El segundo
la conecta con su servicio. Las imágenes procesadas quedan en `public/logos/`.

Los slugs los ves en la URL de cada servicio: `/servicios/disney-plus` → slug
`disney-plus`.

> **Sobre las marcas:** usar el logo de una plataforma para identificar el
> producto que revendes es una práctica común, pero las marcas son de sus
> dueños. El pie de página ya aclara que eres un servicio independiente y no
> afiliado. Si alguna vez te piden retirar uno, borras el archivo de
> `public/logos`, vuelves a ejecutar el script y queda el monograma.

---

## 4. Personalizar la marca

Un solo archivo: **`src/config/site.ts`**

- Nombre, eslogan, descripción, ciudad, horario, correo y redes.
- Número de WhatsApp y **todas las plantillas de mensaje** (`waTemplates`).
- Métodos de pago, pasos de "cómo funciona" y preguntas frecuentes.

**El logo** vive en `public/brand/streamix.png`. Si lo reemplazas por otro archivo
con el mismo nombre, se actualiza en el navbar, el pie de página, el panel y el
login a la vez. Los iconos de pestaña son `src/app/icon.png` y
`src/app/apple-icon.png`.

Los colores están en **`tailwind.config.ts`** (paleta `brand` y `ink`) y en
`src/app/globals.css`.

---

## 5. Estructura del proyecto

```
src/
├── app/
│   ├── (tienda)/           → sitio público (portada, catálogo, FAQ, legales…)
│   ├── admin/
│   │   ├── login/          → acceso al panel
│   │   └── (panel)/        → dashboard, ventas, clientes, cuentas, comparador…
│   └── layout.tsx
├── components/
│   ├── site/               → hero, tarjetas, navbar, footer, botón de WhatsApp
│   ├── admin/              → sidebar, tablas, gráficas, KPIs
│   └── ui/                 → piezas compartidas (badges, animaciones, logos)
├── config/site.ts          → 👈 marca, WhatsApp, textos
└── lib/
    ├── supabase/           → clientes de servidor, navegador y middleware
    ├── queries.ts          → acceso a datos (con respaldo de demostración)
    ├── whatsapp.ts         → generación de enlaces wa.me
    └── types.ts            → tipos del dominio
supabase/
├── schema.sql              → tablas, vistas, funciones y seguridad (RLS)
└── seed.sql                → datos de ejemplo
```

---

## 6. Por qué estas tecnologías

| Elección | Motivo |
|---|---|
| **Next.js 15 (App Router)** | Frontend y backend en un solo proyecto: las páginas se renderizan en el servidor (rápidas y bien posicionadas en Google) y las rutas de API viven al lado. Menos piezas que mantener. |
| **TypeScript** | Detecta errores antes de que lleguen al navegador. Cuando el negocio crezca y haya más tablas, evita romper cosas sin darte cuenta. |
| **Tailwind CSS** | Todo el diseño vive junto al componente. Cambiar la paleta morada o los espaciados es cuestión de segundos. |
| **Framer Motion** | Las animaciones (aparición al hacer scroll, hover en tarjetas, modales) sin escribir CSS complejo. |
| **Supabase (PostgreSQL)** | Base de datos **relacional** real —necesaria para relacionar clientes, cuentas, proveedores y ventas—, más autenticación y almacenamiento incluidos. Tiene panel visual para administrar filas sin saber SQL. |
| **Row Level Security** | La seguridad vive en la base de datos, no solo en el código: el público solo puede leer el catálogo activo, y todo lo demás exige sesión de administrador. |
| **Recharts** | Gráficas del dashboard en React, con tooltips y responsive por defecto. |

---

## 7. Publicar en internet

1. Sube el proyecto a GitHub.
2. Entra a <https://vercel.com>, **Add New → Project** e importa el repositorio.
3. En **Environment Variables** pega las mismas del `.env.local`
   (cambia `NEXT_PUBLIC_SITE_URL` por tu dominio).
4. **Deploy**. Vercel te da una URL gratis y puedes conectar tu dominio propio.

---

## 8. Seguridad — lee esto antes de publicar

- **Nunca subas `.env.local` a GitHub.** Ya está en `.gitignore`.
- La clave *anon* es pública por diseño; lo que protege tus datos es el **RLS** de
  `schema.sql`. No lo desactives.
- **No guardes contraseñas de las cuentas en texto plano.** Lo recomendable es
  registrar solo el correo o identificador y enviar la contraseña al cliente
  directamente por WhatsApp.
- En Supabase → **Authentication → Providers**, deja el registro público
  deshabilitado: los administradores se crean a mano.
- Revisa `/terminos` y `/privacidad` con un abogado antes de publicar. Son
  plantillas ajustadas a la Ley 1480 (Estatuto del Consumidor) y la Ley 1581
  (protección de datos), pero no sustituyen asesoría profesional. Verifica también
  que tu operación cumpla las condiciones de uso de las plataformas con las que
  trabajas.

---

## 9. Lo que sigue (ideas para la versión 2)

- Formularios de creación y edición dentro del propio panel (hoy se usa el Table
  Editor de Supabase).
- Recordatorios automáticos de vencimiento por la API oficial de WhatsApp Business.
- Roles diferenciados (administrador vs. operador) usando el campo `rol` de
  `admin_profiles`.
- Exportar ventas a Excel y reportes por período.
- Subida de logos de servicios desde el panel a Supabase Storage.
