-- ============================================================================
-- NOVAPLAY · Catálogo real (generado)
-- ----------------------------------------------------------------------------
-- Generado por scripts/build-catalog.py — no lo edites a mano.
-- Ejecútalo en Supabase → SQL Editor DESPUÉS de schema.sql
--
-- Precio de venta = costo del proveedor más barato + $1.000
-- ============================================================================

-- ------------------------------------------------------------- categorías
insert into categories (id, slug, nombre, descripcion, icono, color, orden) values
  ('78154892-e853-5231-9714-7e3e4f66c996', 'streaming', 'Streaming', 'Películas y series bajo demanda.', 'clapperboard', '#a855f7', 1),
  ('2b4d3d87-f316-56b0-b338-0c3ac87fdf39', 'combos', 'Combos', 'Varias plataformas en un solo pago, al mejor precio.', 'layers', '#ff2fd0', 2),
  ('5f51673c-cb96-52a4-b79b-00a0780cb033', 'deportes', 'Deportes', 'Fútbol y eventos en vivo.', 'trophy', '#f97316', 3),
  ('06219c8d-3267-564a-aecb-20c306f17544', 'musica', 'Música', 'Canciones y podcasts sin anuncios.', 'music', '#22c55e', 4),
  ('9becfded-c275-590c-92aa-96a53d751751', 'ia', 'Inteligencia artificial', 'Las mejores IA con cuenta propia.', 'sparkles', '#38bdf8', 5),
  ('c2fdedbc-6d2e-5b60-93a9-832f9636f4ca', 'diseno', 'Diseño', 'Herramientas creativas premium.', 'palette', '#ec4899', 6),
  ('4066e7e3-b9dd-5955-b0e2-f4d5c6b8d366', 'gaming', 'Gaming', 'Suscripciones de consola y PC.', 'gamepad-2', '#8b5cf6', 7),
  ('d8fa66ad-4c6a-5163-a33d-260d437793ca', 'software', 'Software', 'Ofimática y seguridad.', 'monitor', '#64748b', 8)
on conflict (id) do update set nombre = excluded.nombre, descripcion = excluded.descripcion, orden = excluded.orden;

-- ------------------------------------------------------------ proveedores
insert into providers (id, nombre, contacto, whatsapp, email, condiciones, estado) values
  ('e3325edd-b632-534e-a290-6791d1cac62a', 'Proveedor 1', null, '573245338353', null, 'Netflix con vigencia de 33 días (mes + 3 días de cortesía).', 'activo'),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'Proveedor 2', null, '573008777786', null, 'Maneja combos de varias plataformas en una sola compra.', 'activo'),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', 'Proveedor 3', null, '573011216223', null, 'Precios por pantalla, 30 días. Deezer sujeto a disponibilidad.', 'activo'),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'Proveedor 4', null, '573135211240', null, 'Catálogo más amplio: streaming, IA, software y gaming. Garantía y soporte.', 'activo')
on conflict (id) do update set condiciones = excluded.condiciones;

-- -------------------------------------------------------------- servicios
insert into services (id, category_id, slug, nombre, descripcion_corta, descripcion, logo_url, color, destacado, activo, orden) values
  ('6a2ce6eb-df48-529b-be41-22249bc593eb', '78154892-e853-5231-9714-7e3e4f66c996', 'netflix', 'Netflix', 'Series, películas y originales en HD/4K.', 'Acceso a todo el catálogo de Netflix con calidad HD o 4K según el plan. Entrega inmediata, garantía durante toda la vigencia y soporte por WhatsApp.', '/logos/netflix.png', '#e50914', true, true, 1),
  ('165da644-34c2-5724-a1a7-78610dde3be0', '78154892-e853-5231-9714-7e3e4f66c996', 'disney-plus', 'Disney+', 'Disney, Pixar, Marvel, Star Wars y ESPN.', 'Todo el universo Disney en un solo lugar, incluyendo Star y ESPN en el plan premium.', '/logos/disney-plus.png', '#0f2fa5', true, true, 2),
  ('32d051b5-b2a5-5713-9bf6-0b12cd23ab80', '78154892-e853-5231-9714-7e3e4f66c996', 'max', 'Max (HBO)', 'HBO, DC, Warner y los estrenos del año.', 'El catálogo completo de Max con series originales de HBO, cine de Warner y contenido DC.', '/logos/max.png', '#7c3aed', true, true, 3),
  ('b4ef416d-40d2-5ac3-bb36-43502dfb70c4', '78154892-e853-5231-9714-7e3e4f66c996', 'prime-video', 'Prime Video', 'Cine, series y producciones originales de Amazon.', 'Prime Video con acceso a estrenos, series originales y contenido exclusivo de Amazon.', '/logos/prime-video.png', '#00a8e1', true, true, 4),
  ('70fa438e-807e-54ed-9bd0-47d24c902fca', '78154892-e853-5231-9714-7e3e4f66c996', 'paramount-plus', 'Paramount+', 'Cine, series y contenido exclusivo de Paramount.', 'Paramount+ con su catálogo completo de películas y series originales.', '/logos/paramount-plus.png', '#0064ff', false, true, 5),
  ('cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd', '78154892-e853-5231-9714-7e3e4f66c996', 'crunchyroll', 'Crunchyroll', 'El catálogo de anime más grande, con simulcast.', 'Anime sin anuncios, episodios el mismo día de su estreno en Japón y biblioteca completa.', '/logos/crunchyroll.png', '#f47521', false, true, 6),
  ('fd1d6756-633b-568c-8887-c894f766bcd9', '78154892-e853-5231-9714-7e3e4f66c996', 'vix', 'Vix', 'Cine y series en español, novelas y fútbol.', 'Vix Premium con contenido en español, novelas, cine mexicano y deportes.', '/logos/vix.png', '#ff4d4d', false, true, 7),
  ('242f5fb3-59db-5707-9efb-ce34f5338e7e', '78154892-e853-5231-9714-7e3e4f66c996', 'plex', 'Plex', 'Tu biblioteca de películas y series en un solo lugar.', 'Plex Premium con acceso a bibliotecas y contenido gratuito con soporte.', '/logos/plex.png', '#e5a00d', false, true, 8),
  ('5191432a-e8b0-5282-8e96-3b3c4076a61f', '78154892-e853-5231-9714-7e3e4f66c996', 'iptv', 'IPTV', 'Canales en vivo, nacionales e internacionales.', 'Servicio de televisión por internet con canales nacionales, internacionales y deportes.', '/logos/iptv.png', '#38bdf8', false, true, 9),
  ('af53a9b5-5718-5ef7-9f88-5785be0389b3', '78154892-e853-5231-9714-7e3e4f66c996', 'jellyfin', 'Jellyfin', 'Servidor de streaming privado con gran catálogo.', 'Acceso a un servidor Jellyfin con biblioteca de películas y series.', '/logos/jellyfin.png', '#a855f7', false, true, 10),
  ('181df90f-bb63-50e7-bec1-ce441063b27b', '78154892-e853-5231-9714-7e3e4f66c996', 'viki-rakuten', 'Viki Rakuten', 'Doramas coreanos, chinos y japoneses.', 'Rakuten Viki con doramas y series asiáticas subtituladas, sin anuncios.', '/logos/viki-rakuten.png', '#00b0f0', false, true, 11),
  ('261c4478-e59c-5394-9d84-fcc47e8b36d4', '78154892-e853-5231-9714-7e3e4f66c996', 'flujo-tv', 'Flujo TV', 'Canales en vivo y contenido bajo demanda.', 'Plataforma de televisión en línea con canales en vivo y catálogo bajo demanda.', '/logos/flujo-tv.png', '#22d3ee', false, true, 12),
  ('56b8d724-1566-54bc-b97b-c1c75a66e884', '78154892-e853-5231-9714-7e3e4f66c996', 'telelatino', 'Telelatino + WIN', 'Canales latinos con WIN Sports incluido.', 'Telelatino con canales en español y WIN Sports+ para el fútbol colombiano.', '/logos/telelatino.png', '#f59e0b', false, true, 13),
  ('6ed3c7f8-4696-52a8-9e86-bdf4f81c32bf', '78154892-e853-5231-9714-7e3e4f66c996', 'youtube-premium', 'YouTube Premium', 'YouTube sin anuncios, con descargas y música.', 'YouTube Premium: video sin anuncios, reproducción en segundo plano, descargas y YouTube Music.', '/logos/youtube-premium.png', '#ff0000', false, true, 14),
  ('c42d28a8-be84-5cee-9dca-da85927e93b5', '2b4d3d87-f316-56b0-b338-0c3ac87fdf39', 'combo-netflix-prime', 'Netflix + Prime Video', 'Las dos plataformas más pedidas en un solo pago.', 'Perfil propio en Netflix y en Prime Video por un solo precio. Entrega inmediata y garantía durante toda la vigencia.', '/logos/combo-netflix-prime.png', '#e50914', true, true, 15),
  ('59426ef0-7dfd-5781-bbab-5c6b9d5eb592', '2b4d3d87-f316-56b0-b338-0c3ac87fdf39', 'combo-netflix-max', 'Netflix + Max', 'Netflix y todo el catálogo de HBO juntos.', 'Perfil propio en Netflix y en Max (HBO). Ideal si sigues series de HBO y estrenos de Netflix al mismo tiempo. Entrega inmediata y garantía durante toda la vigencia.', '/logos/combo-netflix-max.png', '#7c3aed', true, true, 16),
  ('9168d390-f53d-5c69-b08b-29fba73c62e0', '2b4d3d87-f316-56b0-b338-0c3ac87fdf39', 'combo-netflix-prime-disney', 'Netflix + Prime + Disney+', 'Tres plataformas, un solo pago.', 'Perfil propio en Netflix, Prime Video y Disney+. El combo más completo para toda la familia.', '/logos/combo-netflix-prime-disney.png', '#0f2fa5', true, true, 17),
  ('fc726882-9cee-5865-9317-ed11cba1e3a2', '2b4d3d87-f316-56b0-b338-0c3ac87fdf39', 'combo-netflix-prime-max', 'Netflix + Prime + Max', 'Cine, series y estrenos sin límite.', 'Perfil propio en Netflix, Prime Video y Max.', '/logos/combo-netflix-prime-max.png', '#6d28d9', false, true, 18),
  ('b0862a77-83af-5ad7-852e-c2146fc7234b', '2b4d3d87-f316-56b0-b338-0c3ac87fdf39', 'combo-netflix-prime-spotify', 'Netflix + Prime + Spotify', 'Entretenimiento completo: video y música.', 'Perfil propio en Netflix y Prime Video, más Spotify Premium.', '/logos/combo-netflix-prime-spotify.png', '#1db954', false, true, 19),
  ('4103d0e5-da21-522d-9fe2-b01e7c711f2d', '5f51673c-cb96-52a4-b79b-00a0780cb033', 'paramount-deportes', 'Paramount+ Deportes', 'Fútbol internacional y eventos en vivo.', 'Paramount+ con el paquete de deportes: DSports, fútbol internacional y eventos en directo.', '/logos/paramount-deportes.png', '#0ea5e9', true, true, 20),
  ('cdb7ba23-c1fb-5bc3-a1a4-eecd7467ec96', '5f51673c-cb96-52a4-b79b-00a0780cb033', 'directv-go', 'DIRECTV GO · Plan Oro', 'Canales premium y deportes en vivo.', 'DIRECTV GO Plan Oro con canales premium y deportes en directo (sin WIN Sports).', '/logos/directv-go.png', '#f97316', false, true, 21),
  ('f2813b7c-c914-514e-b234-1a73e89305e4', '06219c8d-3267-564a-aecb-20c306f17544', 'spotify', 'Spotify Premium', 'Música y podcasts sin anuncios, con descargas.', 'Spotify Premium: sin anuncios, reproducción sin conexión, calidad alta y saltos ilimitados.', '/logos/spotify.png', '#1db954', true, true, 22),
  ('27bab71b-e0b9-53e8-8b7a-e90636637097', '06219c8d-3267-564a-aecb-20c306f17544', 'deezer', 'Deezer', 'Millones de canciones sin anuncios.', 'Deezer Premium con música ilimitada, descargas y sin publicidad. Sujeto a disponibilidad.', '/logos/deezer.png', '#a238ff', false, true, 23),
  ('0cfd6eeb-fdf4-50e6-a691-86b8247909fb', '9becfded-c275-590c-92aa-96a53d751751', 'chatgpt', 'ChatGPT Pro', 'El modelo más avanzado de OpenAI, sin límites.', 'Acceso a ChatGPT Pro con los modelos más avanzados, respuestas prioritarias y funciones premium.', '/logos/chatgpt.png', '#10a37f', true, true, 24),
  ('51f6e43d-baaf-58c7-a268-2d761fecbf9c', '9becfded-c275-590c-92aa-96a53d751751', 'gemini-pro', 'Gemini Pro', 'La IA de Google con todas sus funciones.', 'Gemini Pro con acceso a los modelos avanzados de Google, generación de imágenes y más.', '/logos/gemini-pro.png', '#4285f4', false, true, 25),
  ('56d294a9-7e0f-5812-9dcc-c92f83e269c4', '9becfded-c275-590c-92aa-96a53d751751', 'perplexity', 'Perplexity Pro', 'Buscador con IA y fuentes verificadas.', 'Perplexity Pro: búsquedas ilimitadas con IA, modelos avanzados y respuestas con fuentes.', '/logos/perplexity.png', '#20808d', false, true, 26),
  ('ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', 'c2fdedbc-6d2e-5b60-93a9-832f9636f4ca', 'canva-pro', 'Canva Pro', 'Diseño profesional con plantillas premium.', 'Canva Pro con millones de recursos, quitar fondos, kit de marca y almacenamiento ampliado.', '/logos/canva-pro.png', '#8b5cf6', true, true, 27),
  ('869cd590-171f-538d-8335-d910fdb15885', 'c2fdedbc-6d2e-5b60-93a9-832f9636f4ca', 'capcut-pro', 'CapCut Pro', 'Edición de video profesional sin marca de agua.', 'CapCut Pro con efectos premium, exportación en 4K y sin marca de agua.', '/logos/capcut-pro.png', '#000000', false, true, 28),
  ('303ed1e7-6cf3-5cb3-b346-354b01850c3d', '4066e7e3-b9dd-5955-b0e2-f4d5c6b8d366', 'xbox-game-pass', 'Xbox Game Pass', 'Cientos de juegos en consola y PC.', 'Xbox Game Pass con acceso a cientos de juegos, estrenos el día de lanzamiento y juego en la nube.', '/logos/xbox-game-pass.png', '#107c10', false, true, 29),
  ('985e8418-2ee8-5d46-8f67-46d790f63577', '4066e7e3-b9dd-5955-b0e2-f4d5c6b8d366', 'ps-plus', 'PlayStation Plus Deluxe', 'Catálogo de juegos para PS4 y PS5.', 'PS Plus Deluxe con catálogo de juegos, clásicos y multijugador en línea.', '/logos/ps-plus.png', '#0070d1', false, true, 30),
  ('80a96cc9-b585-5e59-8992-326f78b8c674', 'd8fa66ad-4c6a-5163-a33d-260d437793ca', 'office-365', 'Microsoft Office 365', 'Word, Excel, PowerPoint y 1 TB en la nube.', 'Office 365 por un año completo con todas las aplicaciones de escritorio y OneDrive.', '/logos/office-365.png', '#d83b01', false, true, 31),
  ('0577f8f4-e82f-57c8-9420-0dd4c6e71a8d', 'd8fa66ad-4c6a-5163-a33d-260d437793ca', 'mcafee', 'McAfee Antivirus', 'Protección completa para tus dispositivos.', 'McAfee Antivirus por un año con protección en tiempo real y navegación segura.', '/logos/mcafee.png', '#c01818', false, true, 32)
on conflict (id) do update set nombre = excluded.nombre, descripcion_corta = excluded.descripcion_corta, descripcion = excluded.descripcion, logo_url = excluded.logo_url, color = excluded.color, destacado = excluded.destacado, orden = excluded.orden;

-- ----------------------------------------------------------------- planes
insert into service_plans (id, service_id, nombre, descripcion, duracion_dias, precio_venta, pantallas, disponible, activo, orden) values
  ('764f3db0-bf4a-56dc-8cf1-68889ecc0c28', '6a2ce6eb-df48-529b-be41-22249bc593eb', 'Premium · 1 pantalla', 'Perfil propio en HD/4K', 30, 13000, 1, true, true, 1),
  ('71efb27d-3fdc-52ae-a99c-2a13dcd73aa6', '6a2ce6eb-df48-529b-be41-22249bc593eb', 'Cuenta completa', '5 perfiles, control total de la cuenta', 30, 38000, 5, true, true, 2),
  ('5f0fbd1e-a0f2-5d94-be50-d41e2206bf95', '165da644-34c2-5724-a1a7-78610dde3be0', 'Estándar · 1 pantalla', 'Perfil propio, catálogo básico', 30, 7000, 1, true, true, 1),
  ('b78cb344-aa79-56d8-bd8b-217b487cec06', '165da644-34c2-5724-a1a7-78610dde3be0', 'Premium con ESPN · 1 pantalla', 'Perfil propio con deportes incluidos', 30, 10000, 1, true, true, 2),
  ('a3132c40-a66c-5004-823e-f973c168f7cc', '165da644-34c2-5724-a1a7-78610dde3be0', 'Cuenta completa Premium', '7 perfiles, control total', 30, 34000, 7, true, true, 3),
  ('0e724583-fe29-562d-8974-531b983cb503', '32d051b5-b2a5-5713-9bf6-0b12cd23ab80', 'Estándar · 1 pantalla', 'Perfil propio sin anuncios', 30, 6000, 1, true, true, 1),
  ('6c3818c3-632a-576a-acb8-257372aaa72b', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', 'Estándar · 1 pantalla', 'Perfil propio', 30, 6000, 1, true, true, 1),
  ('94b9ef57-9995-59a2-84e7-707b0b3f4cc6', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', 'Cuenta completa', 'Control total de la cuenta', 30, 19000, 6, true, true, 2),
  ('f5d77b06-5613-50cd-9db7-11e9c61b3a03', '70fa438e-807e-54ed-9bd0-47d24c902fca', 'Estándar · 1 pantalla', 'Perfil propio', 30, 6000, 1, true, true, 1),
  ('f5e68862-4d27-5c02-ac2f-babdd070ac99', 'cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd', 'Mega Fan · 1 pantalla', 'Anime sin anuncios', 30, 6000, 1, true, true, 1),
  ('34a204ef-4e42-565b-b7f0-98a78070f4fa', 'fd1d6756-633b-568c-8887-c894f766bcd9', 'Estándar · 1 pantalla', 'Perfil propio', 30, 5000, 1, true, true, 1),
  ('f30b1f6a-5553-5fc7-bc1f-fd267ea4272d', '242f5fb3-59db-5707-9efb-ce34f5338e7e', 'Pantalla', 'Un dispositivo', 30, 6000, 1, true, true, 1),
  ('c7557d89-0332-558a-be4c-496d919c9b33', '242f5fb3-59db-5707-9efb-ce34f5338e7e', 'Premium · 3 dispositivos', 'Hasta 3 dispositivos', 30, 16000, 3, true, true, 2),
  ('de76190a-54b5-51a4-b140-3aba964b20e6', '5191432a-e8b0-5282-8e96-3b3c4076a61f', 'Estándar', 'Canales en vivo', 30, 6000, 1, true, true, 1),
  ('e92223c5-9cba-50a8-9682-991a015282a9', '5191432a-e8b0-5282-8e96-3b3c4076a61f', 'IPTV + WIN Sports', 'Incluye WIN Sports+', 30, 11000, 1, true, true, 2),
  ('7bdabfc8-7fe7-5023-b748-4263091e7f97', 'af53a9b5-5718-5ef7-9f88-5785be0389b3', 'Acceso mensual', 'Un usuario', 30, 16000, 1, true, true, 1),
  ('fddae8b5-cab4-5f17-803a-e0145ee1571e', '181df90f-bb63-50e7-bec1-ce441063b27b', 'Estándar · 1 pantalla', 'Perfil propio', 30, 10000, 1, true, true, 1),
  ('7d4fc099-a8bd-5a22-8891-236b7d3ffe07', '261c4478-e59c-5394-9d84-fcc47e8b36d4', 'Pantalla', 'Un dispositivo', 30, 11000, 1, true, true, 1),
  ('d99fc50b-4494-5773-8a81-fa57475760bf', '261c4478-e59c-5394-9d84-fcc47e8b36d4', 'Cuenta completa', 'Varios dispositivos', 30, 19000, 4, true, true, 2),
  ('7f8e1ad0-246e-5ce4-9436-8701ee4b5535', '56b8d724-1566-54bc-b97b-c1c75a66e884', 'Mensual', 'Canales latinos + WIN', 30, 16000, 1, true, true, 1),
  ('82a5887a-bbe9-55b9-a639-c619e46dd80e', '6ed3c7f8-4696-52a8-9e86-bdf4f81c32bf', 'Premium · 1 mes', 'Cuenta propia', 30, 8000, 1, true, true, 1),
  ('c32317ca-5117-5d74-a714-15a9b02cf175', 'c42d28a8-be84-5cee-9dca-da85927e93b5', 'Combo · 1 pantalla c/u', 'Un perfil en cada plataforma', 30, 20000, 1, true, true, 1),
  ('29f08eb2-4485-55b5-b724-879d77a6c68e', '59426ef0-7dfd-5781-bbab-5c6b9d5eb592', 'Combo · 1 pantalla c/u', 'Un perfil en cada plataforma', 30, 17000, 1, true, true, 1),
  ('367e0489-9e32-5d06-a82d-1916adb3ccc1', '9168d390-f53d-5c69-b08b-29fba73c62e0', 'Combo · 1 pantalla c/u', 'Un perfil en cada plataforma', 30, 30000, 1, true, true, 1),
  ('05c78f34-082e-5c8e-bf2d-9049fd1bcbf2', 'fc726882-9cee-5865-9317-ed11cba1e3a2', 'Combo · 1 pantalla c/u', 'Un perfil en cada plataforma', 30, 27000, 1, true, true, 1),
  ('27ff1fb7-56e2-5735-8d1a-586aa73fdf07', 'b0862a77-83af-5ad7-852e-c2146fc7234b', 'Combo · 1 pantalla c/u', 'Video y música incluidos', 30, 28000, 1, true, true, 1),
  ('c154da2a-b06d-5d55-96c9-a289c4bf4bc5', '4103d0e5-da21-522d-9fe2-b01e7c711f2d', 'Mensual', 'Deportes en vivo', 30, 9000, 1, true, true, 1),
  ('0a766734-0845-538f-99e5-f5088be80981', 'cdb7ba23-c1fb-5bc3-a1a4-eecd7467ec96', 'Plan Oro · mensual', 'Sin WIN Sports', 30, 21000, 1, true, true, 1),
  ('e6cef54e-9177-565f-a862-5e7882a6474c', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'Premium · 1 mes', 'Cuenta propia renovable', 30, 9000, 1, true, true, 1),
  ('ac119ce0-7a53-5611-85f7-8bcd0718b948', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'Premium · 3 meses', 'Ahorra pagando por trimestre', 90, 23000, 1, true, true, 2),
  ('b8cd729f-5873-5b8b-8806-2f4d266761d1', '27bab71b-e0b9-53e8-8b7a-e90636637097', 'Premium · 1 mes', 'Consultar disponibilidad', 30, 4000, 1, true, true, 1),
  ('3219211d-e7de-516d-92c3-df2a28f5bfeb', '0cfd6eeb-fdf4-50e6-a691-86b8247909fb', 'Business Pro · 1 mes', 'Cuenta con acceso completo', 30, 24000, 1, true, true, 1),
  ('ab665406-9ead-5837-9408-cfe0c9e789df', '51f6e43d-baaf-58c7-a268-2d761fecbf9c', 'Pro · 1 mes', 'Cuenta con acceso completo', 30, 11000, 1, true, true, 1),
  ('72608056-ab6a-5454-bfab-5bbacf24a19f', '56d294a9-7e0f-5812-9dcc-c92f83e269c4', 'Pro · 1 mes', 'Cuenta con acceso completo', 30, 21000, 1, true, true, 1),
  ('4fc06b25-fc03-5f9e-a978-197f8fa8cdef', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', 'Pro · 1 mes', 'Correo personal', 30, 6000, 1, true, true, 1),
  ('2f1401fa-e115-5217-b08e-7275b3583d3c', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', 'Pro · 6 meses', 'Correo personal', 180, 26000, 1, true, true, 2),
  ('9fd6c7f2-5df1-56a2-96fa-2c7993ead4f2', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', 'Pro · 1 año', 'Correo personal', 365, 39000, 1, true, true, 3),
  ('20fc4610-81cc-5a1d-97ca-6cbf32799551', '869cd590-171f-538d-8335-d910fdb15885', 'Pro · 1 mes', 'Cuenta con acceso completo', 30, 19000, 1, true, true, 1),
  ('8d9b3c42-3e69-5fa5-9b63-4be09ae9dff9', '303ed1e7-6cf3-5cb3-b346-354b01850c3d', 'Mensual', 'Consola y PC', 30, 46000, 1, true, true, 1),
  ('744c1a4b-b408-5474-bfb6-da70f11acca1', '985e8418-2ee8-5d46-8f67-46d790f63577', 'Mensual · PS4/PS5', 'Cuenta con acceso completo', 30, 77000, 1, true, true, 1),
  ('51906623-ea49-5305-80f2-5a696e389f7c', '80a96cc9-b585-5e59-8992-326f78b8c674', '1 año · compartida', 'Licencia compartida', 365, 71000, 1, true, true, 1),
  ('780afeea-6ce9-52a2-89f0-4136fa11d398', '80a96cc9-b585-5e59-8992-326f78b8c674', '1 año · correo personal', 'Licencia en tu propio correo', 365, 172000, 1, true, true, 2),
  ('19ebfc86-aa7d-5b89-bf31-7433ffecfd4c', '0577f8f4-e82f-57c8-9420-0dd4c6e71a8d', '1 año', 'Licencia anual', 365, 68000, 1, true, true, 1)
on conflict (id) do update set nombre = excluded.nombre, duracion_dias = excluded.duracion_dias, precio_venta = excluded.precio_venta, orden = excluded.orden;

-- ------------------------------------- precios de proveedor (comparador)
delete from provider_prices;
insert into provider_prices (provider_id, service_id, plan_id, etiqueta, costo, duracion_dias, activo) values
  ('e3325edd-b632-534e-a290-6791d1cac62a', '6a2ce6eb-df48-529b-be41-22249bc593eb', '764f3db0-bf4a-56dc-8cf1-68889ecc0c28', 'Premium · 1 pantalla', 14000, 33, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', '6a2ce6eb-df48-529b-be41-22249bc593eb', '764f3db0-bf4a-56dc-8cf1-68889ecc0c28', 'Premium · 1 pantalla', 14000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '6a2ce6eb-df48-529b-be41-22249bc593eb', '764f3db0-bf4a-56dc-8cf1-68889ecc0c28', 'Premium · 1 pantalla', 13000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '6a2ce6eb-df48-529b-be41-22249bc593eb', '764f3db0-bf4a-56dc-8cf1-68889ecc0c28', 'Premium · 1 pantalla', 12000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '6a2ce6eb-df48-529b-be41-22249bc593eb', '71efb27d-3fdc-52ae-a99c-2a13dcd73aa6', 'Cuenta completa', 37000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '165da644-34c2-5724-a1a7-78610dde3be0', '5f0fbd1e-a0f2-5d94-be50-d41e2206bf95', 'Estándar · 1 pantalla', 6000, 30, true),
  ('e3325edd-b632-534e-a290-6791d1cac62a', '165da644-34c2-5724-a1a7-78610dde3be0', 'b78cb344-aa79-56d8-bd8b-217b487cec06', 'Premium con ESPN · 1 pantalla', 11000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', '165da644-34c2-5724-a1a7-78610dde3be0', 'b78cb344-aa79-56d8-bd8b-217b487cec06', 'Premium con ESPN · 1 pantalla', 10000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '165da644-34c2-5724-a1a7-78610dde3be0', 'b78cb344-aa79-56d8-bd8b-217b487cec06', 'Premium con ESPN · 1 pantalla', 10000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '165da644-34c2-5724-a1a7-78610dde3be0', 'b78cb344-aa79-56d8-bd8b-217b487cec06', 'Premium con ESPN · 1 pantalla', 9000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '165da644-34c2-5724-a1a7-78610dde3be0', 'a3132c40-a66c-5004-823e-f973c168f7cc', 'Cuenta completa Premium', 33000, 30, true),
  ('e3325edd-b632-534e-a290-6791d1cac62a', '32d051b5-b2a5-5713-9bf6-0b12cd23ab80', '0e724583-fe29-562d-8974-531b983cb503', 'Estándar · 1 pantalla', 9000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', '32d051b5-b2a5-5713-9bf6-0b12cd23ab80', '0e724583-fe29-562d-8974-531b983cb503', 'Estándar · 1 pantalla', 7000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '32d051b5-b2a5-5713-9bf6-0b12cd23ab80', '0e724583-fe29-562d-8974-531b983cb503', 'Estándar · 1 pantalla', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '32d051b5-b2a5-5713-9bf6-0b12cd23ab80', '0e724583-fe29-562d-8974-531b983cb503', 'Estándar · 1 pantalla', 6000, 30, true),
  ('e3325edd-b632-534e-a290-6791d1cac62a', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', '6c3818c3-632a-576a-acb8-257372aaa72b', 'Estándar · 1 pantalla', 9000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', '6c3818c3-632a-576a-acb8-257372aaa72b', 'Estándar · 1 pantalla', 7000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', '6c3818c3-632a-576a-acb8-257372aaa72b', 'Estándar · 1 pantalla', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', '6c3818c3-632a-576a-acb8-257372aaa72b', 'Estándar · 1 pantalla', 6000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'b4ef416d-40d2-5ac3-bb36-43502dfb70c4', '94b9ef57-9995-59a2-84e7-707b0b3f4cc6', 'Cuenta completa', 18000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', '70fa438e-807e-54ed-9bd0-47d24c902fca', 'f5d77b06-5613-50cd-9db7-11e9c61b3a03', 'Estándar · 1 pantalla', 10000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '70fa438e-807e-54ed-9bd0-47d24c902fca', 'f5d77b06-5613-50cd-9db7-11e9c61b3a03', 'Estándar · 1 pantalla', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '70fa438e-807e-54ed-9bd0-47d24c902fca', 'f5d77b06-5613-50cd-9db7-11e9c61b3a03', 'Estándar · 1 pantalla', 10000, 30, true),
  ('e3325edd-b632-534e-a290-6791d1cac62a', 'cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd', 'f5e68862-4d27-5c02-ac2f-babdd070ac99', 'Mega Fan · 1 pantalla', 6000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd', 'f5e68862-4d27-5c02-ac2f-babdd070ac99', 'Mega Fan · 1 pantalla', 5000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', 'cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd', 'f5e68862-4d27-5c02-ac2f-babdd070ac99', 'Mega Fan · 1 pantalla', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd', 'f5e68862-4d27-5c02-ac2f-babdd070ac99', 'Mega Fan · 1 pantalla', 7000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', 'fd1d6756-633b-568c-8887-c894f766bcd9', '34a204ef-4e42-565b-b7f0-98a78070f4fa', 'Estándar · 1 pantalla', 4000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'fd1d6756-633b-568c-8887-c894f766bcd9', '34a204ef-4e42-565b-b7f0-98a78070f4fa', 'Estándar · 1 pantalla', 6000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '242f5fb3-59db-5707-9efb-ce34f5338e7e', 'f30b1f6a-5553-5fc7-bc1f-fd267ea4272d', 'Pantalla', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '242f5fb3-59db-5707-9efb-ce34f5338e7e', 'f30b1f6a-5553-5fc7-bc1f-fd267ea4272d', 'Pantalla', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '242f5fb3-59db-5707-9efb-ce34f5338e7e', 'c7557d89-0332-558a-be4c-496d919c9b33', 'Premium · 3 dispositivos', 15000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '5191432a-e8b0-5282-8e96-3b3c4076a61f', 'de76190a-54b5-51a4-b140-3aba964b20e6', 'Estándar', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '5191432a-e8b0-5282-8e96-3b3c4076a61f', 'e92223c5-9cba-50a8-9682-991a015282a9', 'IPTV + WIN Sports', 10000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'af53a9b5-5718-5ef7-9f88-5785be0389b3', '7bdabfc8-7fe7-5023-b748-4263091e7f97', 'Acceso mensual', 15000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '181df90f-bb63-50e7-bec1-ce441063b27b', 'fddae8b5-cab4-5f17-803a-e0145ee1571e', 'Estándar · 1 pantalla', 9000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '261c4478-e59c-5394-9d84-fcc47e8b36d4', '7d4fc099-a8bd-5a22-8891-236b7d3ffe07', 'Pantalla', 10000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '261c4478-e59c-5394-9d84-fcc47e8b36d4', 'd99fc50b-4494-5773-8a81-fa57475760bf', 'Cuenta completa', 18000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '56b8d724-1566-54bc-b97b-c1c75a66e884', '7f8e1ad0-246e-5ce4-9436-8701ee4b5535', 'Mensual', 15000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '6ed3c7f8-4696-52a8-9e86-bdf4f81c32bf', '82a5887a-bbe9-55b9-a639-c619e46dd80e', 'Premium · 1 mes', 7000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '6ed3c7f8-4696-52a8-9e86-bdf4f81c32bf', '82a5887a-bbe9-55b9-a639-c619e46dd80e', 'Premium · 1 mes', 10000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'c42d28a8-be84-5cee-9dca-da85927e93b5', 'c32317ca-5117-5d74-a714-15a9b02cf175', 'Combo · 1 pantalla c/u', 19000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', '59426ef0-7dfd-5781-bbab-5c6b9d5eb592', '29f08eb2-4485-55b5-b724-879d77a6c68e', 'Combo · 1 pantalla c/u', 19000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '59426ef0-7dfd-5781-bbab-5c6b9d5eb592', '29f08eb2-4485-55b5-b724-879d77a6c68e', 'Combo · 1 pantalla c/u', 16000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', '9168d390-f53d-5c69-b08b-29fba73c62e0', '367e0489-9e32-5d06-a82d-1916adb3ccc1', 'Combo · 1 pantalla c/u', 29000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'fc726882-9cee-5865-9317-ed11cba1e3a2', '05c78f34-082e-5c8e-bf2d-9049fd1bcbf2', 'Combo · 1 pantalla c/u', 26000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'b0862a77-83af-5ad7-852e-c2146fc7234b', '27ff1fb7-56e2-5735-8d1a-586aa73fdf07', 'Combo · 1 pantalla c/u', 27000, 30, true),
  ('e3325edd-b632-534e-a290-6791d1cac62a', '4103d0e5-da21-522d-9fe2-b01e7c711f2d', 'c154da2a-b06d-5d55-96c9-a289c4bf4bc5', 'Mensual', 8000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '4103d0e5-da21-522d-9fe2-b01e7c711f2d', 'c154da2a-b06d-5d55-96c9-a289c4bf4bc5', 'Mensual', 10000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'cdb7ba23-c1fb-5bc3-a1a4-eecd7467ec96', '0a766734-0845-538f-99e5-f5088be80981', 'Plan Oro · mensual', 20000, 30, true),
  ('e3325edd-b632-534e-a290-6791d1cac62a', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'e6cef54e-9177-565f-a862-5e7882a6474c', 'Premium · 1 mes', 9000, 30, true),
  ('b9bfc7e3-6608-5b77-bf38-71d735258063', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'e6cef54e-9177-565f-a862-5e7882a6474c', 'Premium · 1 mes', 8000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'e6cef54e-9177-565f-a862-5e7882a6474c', 'Premium · 1 mes', 8000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'e6cef54e-9177-565f-a862-5e7882a6474c', 'Premium · 1 mes', 11000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'f2813b7c-c914-514e-b234-1a73e89305e4', 'ac119ce0-7a53-5611-85f7-8bcd0718b948', 'Premium · 3 meses', 22000, 90, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '27bab71b-e0b9-53e8-8b7a-e90636637097', 'b8cd729f-5873-5b8b-8806-2f4d266761d1', 'Premium · 1 mes', 3000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '0cfd6eeb-fdf4-50e6-a691-86b8247909fb', '3219211d-e7de-516d-92c3-df2a28f5bfeb', 'Business Pro · 1 mes', 23000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', '51f6e43d-baaf-58c7-a268-2d761fecbf9c', 'ab665406-9ead-5837-9408-cfe0c9e789df', 'Pro · 1 mes', 10000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '51f6e43d-baaf-58c7-a268-2d761fecbf9c', 'ab665406-9ead-5837-9408-cfe0c9e789df', 'Pro · 1 mes', 20000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '56d294a9-7e0f-5812-9dcc-c92f83e269c4', '72608056-ab6a-5454-bfab-5bbacf24a19f', 'Pro · 1 mes', 20000, 30, true),
  ('a6e91af7-485a-557c-9fb1-678ba79fbbc2', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', '4fc06b25-fc03-5f9e-a978-197f8fa8cdef', 'Pro · 1 mes', 5000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', '4fc06b25-fc03-5f9e-a978-197f8fa8cdef', 'Pro · 1 mes', 6000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', '2f1401fa-e115-5217-b08e-7275b3583d3c', 'Pro · 6 meses', 25000, 180, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', 'ef29bf9c-4925-5dae-98ed-0a4206b5ec1b', '9fd6c7f2-5df1-56a2-96fa-2c7993ead4f2', 'Pro · 1 año', 38000, 365, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '869cd590-171f-538d-8335-d910fdb15885', '20fc4610-81cc-5a1d-97ca-6cbf32799551', 'Pro · 1 mes', 18000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '303ed1e7-6cf3-5cb3-b346-354b01850c3d', '8d9b3c42-3e69-5fa5-9b63-4be09ae9dff9', 'Mensual', 45000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '985e8418-2ee8-5d46-8f67-46d790f63577', '744c1a4b-b408-5474-bfb6-da70f11acca1', 'Mensual · PS4/PS5', 76000, 30, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '80a96cc9-b585-5e59-8992-326f78b8c674', '51906623-ea49-5305-80f2-5a696e389f7c', '1 año · compartida', 70000, 365, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '80a96cc9-b585-5e59-8992-326f78b8c674', '780afeea-6ce9-52a2-89f0-4136fa11d398', '1 año · correo personal', 171000, 365, true),
  ('f914b816-96c2-5bc1-ae7d-66961bda4e51', '0577f8f4-e82f-57c8-9420-0dd4c6e71a8d', '19ebfc86-aa7d-5b89-bf31-7433ffecfd4c', '1 año', 67000, 365, true);

-- ============================================================================
-- Listo. Revisa el catálogo en Supabase → Table Editor → services.
-- Recuerda ponerles nombre y WhatsApp reales a tus proveedores en la tabla
-- `providers` (ahora aparecen como "Proveedor 1", "Proveedor 2"…).
-- ============================================================================
