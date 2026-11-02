# Arquitectura del Sistema e Infraestructura de Servicios

Este documento detalla la arquitectura de infraestructura, componentes de software, imagenes de contenedores, flujo de datos, estrategias de despliegue y requerimientos de dimensionamiento para el proyecto RP-AGB, contemplando su posible evolucion hacia una plataforma de comercio electronico (e-commerce).

---

## 1. Vision General de la Arquitectura

El sistema esta implementado bajo una arquitectura orientada a servicios contenerizados, orquestados mediante Docker Compose sobre una red interna aislada. El acceso externo se centraliza a traves de un Reverse Proxy que actua como punto unico de entrada (API Gateway / Ingress).

```
                      INTERNET / CLIENTE (Navegador)
                                    |
                            HTTP:80 / HTTPS:443
                                    v
                     +------------------------------+
                     |    nginx_proxy (Nginx)       |
                     |  Reverse Proxy & SSL Entry   |
                     +--------------+---------------+
                                    |
               +--------------------+--------------------+
        /api/* |                                         | /*
               v                                         v
+------------------------------+         +------------------------------+
|   rp-agb-backend (ASP.NET)   |         |   rp-agb-frontend (Next.js)  |
|  Clean Architecture (.NET 10)|         |    App Router (Node 20 LTS)  |
|  Puerto interno: 8080        |         |    Puerto interno: 3000      |
+--------------+---------------+         +------------------------------+
               |
               | TCP:5432 (Interno)
               v
+------------------------------+
|     postgres_db (PostgreSQL) |
|     PostgreSQL 16 Alpine     |
|     Volumen: postgres_data   |
+------------------------------+
```

---

## 2. Inventario de Contenedores e Imagenes

A continuacion se detallan las caracteristicas tecnicas, versiones y responsabilidades de cada contenedor definido en la orquestacion.

### 2.1. Nginx Reverse Proxy
* Nombre del contenedor: `nginx_proxy`
* Servicio en Docker Compose: `reverse-proxy`
* Imagen base: `nginx:alpine`
* Version: Nginx mainline / stable basada en Alpine Linux (tamano aproximado de imagen: 25 MB a 40 MB).
* Rol y Responsabilidad:
  * Recepcion de todo el trafico HTTP (puerto 80) y HTTPS (puerto 443 en produccion).
  * Enrutamiento de peticiones:
    * Prefijo `/api/`: Redirige al contenedor `backend:8080`.
    * Raiz `/`: Redirige al contenedor `frontend:3000`.
  * Preservacion de cabeceras de red (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`).
  * Soporte de WebSockets (`Upgrade` y `Connection "upgrade"`) para comunicacion bidireccional y hot-reload.
  * Ocultamiento de la topologia interna: evita la exposicion directa del backend y la base de datos a internet.

### 2.2. Frontend (Aplicacion Web)
* Nombre del contenedor: `rp-agb-frontend`
* Servicio en Docker Compose: `frontend`
* Imagen base: `node:20-alpine`
* Version de runtime y dependencias:
  * Node.js: 20 LTS (Alpine Linux).
  * Gestor de paquetes: pnpm 9.15.9 (habilitado mediante Corepack con version fija).
  * Framework: Next.js 15.3.4 (App Router, soporte SSR/SSG y compilacion con Turbopack).
  * Biblioteca de interfaz: React 19.0.0.
  * Lenguaje: TypeScript 5.
* Estrategia de construccion (Multi-stage Dockerfile):
  * Stage 1 (`base`): Inicializa Node.js 20 Alpine y prepara `pnpm` con Corepack.
  * Stage 2 (`dev`): Utilizado en desarrollo local. Monta el volumen de codigo del host, corre `pnpm install` al iniciar y arranca con `pnpm dev` soportando polling de archivos en Windows (`WATCHPACK_POLLING=true`).
  * Stage 3 (`deps`): Instala dependencias con `pnpm install --frozen-lockfile` para reproducibilidad en produccion.
  * Stage 4 (`builder`): Compila la aplicacion con `pnpm build` generando la salida `standalone`.
  * Stage 5 (`prod`): Imagen minima para produccion. Configura un usuario sin privilegios (`nextjs` UID 1001), copia unicamente los archivos de `.next/standalone`, `.next/static` y `public`, y ejecuta `node server.js` en el puerto 3000.
* Rol y Responsabilidad:
  * Renderizado del lado del servidor (SSR) para optimizacion de motores de busqueda (SEO) y rendimiento inicial.
  * Entrega de la interfaz de usuario interactiva y consumo de la API mediante llamadas REST.

### 2.3. Backend (API REST)
* Nombre del contenedor: `rp-agb-backend`
* Servicio en Docker Compose: `backend`
* Imagenes de construccion y runtime:
  * Build: `mcr.microsoft.com/dotnet/sdk:10.0`
  * Runtime: `mcr.microsoft.com/dotnet/aspnet:10.0-alpine` (tamano reducido, libre de herramientas de compilacion innecesarias en produccion).
* Version del framework y dependencias:
  * Plataforma: .NET 10.0 (`net10.0`).
  * ORM: Entity Framework Core 10 con proveedor `Npgsql.EntityFrameworkCore.PostgreSQL` version 10.0.3.
  * Seguridad y Criptografia: `BCrypt.Net-Next` version 4.2.0 para hashing seguro de contrasenas.
  * Documentacion: `Microsoft.AspNetCore.OpenApi` y `Swashbuckle.AspNetCore` para generacion de OpenAPI / Swagger UI.
* Estructura arquitectonica del codigo:
  * `RPAGB.Domain`: Entidades centrales del negocio (`User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `RefreshToken`), independientes de frameworks externos.
  * `RPAGB.Application`: Casos de uso, interfaces de servicios y contratos de aplicacion.
  * `RPAGB.Infrastructure`: Implementacion de acceso a base de datos (`AppDbContext`), migraciones, configuracion de entidades y hashing.
  * `RPAGB.Api`: Controladores REST, middleware de autenticacion y autorizacion, configuracion de CORS y pipeline HTTP.
* Rol y Responsabilidad:
  * Procesamiento de logica de negocio.
  * Control de acceso basado en roles (RBAC) y emision/renovacion de tokens JWT.
  * Gestion transaccional de datos contra la base de datos PostgreSQL.

### 2.4. Base de Datos (PostgreSQL)
* Nombre del contenedor: `postgres_db`
* Servicio en Docker Compose: `db`
* Imagen base: `postgres:16-alpine`
* Version: PostgreSQL 16.
* Rol y Responsabilidad:
  * Persistencia relacional de todas las entidades del sistema.
  * Esquema inicial (`database/schema_auth.sql`):
    * Extensiones criptograficas y de identificadores unicos: `uuid-ossp` y `pgcrypto`.
    * Tablas: `roles`, `permissions`, `users`, `user_roles`, `role_permissions`, `refresh_tokens`.
    * Politicas de seguridad nativas en base de datos: control de intentos fallidos de inicio de sesion (`failed_login_attempts`), bloqueo temporal de cuentas (`locked_until`), auditoria con marcas de tiempo en UTC (`TIMESTAMP WITH TIME ZONE`) y borrado en cascada controlado en relaciones N:M.

---

## 3. Redes, Persistencia y Manejo de Archivos

### 3.1. Topologia de Red (`app_network`)
* Tipo de red: Docker bridge network privada (`app_network`).
* Resolucion DNS interna: Cada servicio resuelve a los demas mediante su nombre de servicio (`http://backend:8080`, `http://frontend:3000`, `db:5432`).
* Politica de exposicion de puertos:
  * Entorno de desarrollo: Se encuentran mapeados los puertos 3000 (frontend), 8080 (backend), 5432 (PostgreSQL) y 80 (Nginx) para facilitar la depuracion.
  * Entorno de produccion: UNICAMENTE el puerto 80 (HTTP) y 443 (HTTPS) de Nginx deben estar expuestos al exterior. Las directivas de puertos para `db` (5432) y `backend` (8080) deben eliminarse o ligarse a `127.0.0.1` para impedir accesos directos desde internet no autorizados.

### 3.2. Persistencia y Ciclo de Vida de los Datos
* Base de Datos: Volumen persistente administrado por Docker (`postgres_data`) montado en `/var/lib/postgresql/data`. La informacion sobrevive a reinicios, caidas y recreaciones de contenedores.
* Frontend:
  * En desarrollo: Se montan `./frontend:/app` y un volumen anonimo `/app/.next` para proteger la cache de construccion local.
  * En produccion: El contenedor es autocontenido (stateless); los assets estaticos residen dentro de la imagen (`.next/standalone`, `.next/static`, `public`).
* Archivos dinamicos y multimedia (adjuntos, comprobantes, imagenes):
  * Actualmente el sistema no cuenta con un volumen dedicado para archivos multimedia subidos por usuarios.
  * Almacenar archivos dentro del contenedor es un antipatron, ya que se destruirian al actualizar la imagen. En secciones posteriores se define la estrategia de almacenamiento adecuada.

---

## 4. Estrategia de Despliegue en Servidor VPS

### 4.1. Flujo Operativo de Puesta en Produccion
1. Provisionamiento del servidor con distribucion Linux (ej. Ubuntu Server 24.04 LTS).
2. Instalacion del motor Docker oficial y el plugin Docker Compose.
3. Configuracion de usuario administrativo sin privilegios root con membresia al grupo `docker`.
4. Clonacion del repositorio mediante Git y preparacion del archivo `.env` con credenciales de produccion de alta entropia.
5. Ejecucion del build de produccion:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
6. Inicializacion y migraciones de base de datos ejecutadas automaticamente por el backend al iniciar o mediante script de arranque.

### 4.2. Gestion de Certificados SSL/TLS (HTTPS)
Para un despliegue seguro en produccion se debe implementar HTTPS obligatorio:
* Opcion A (Nginx + Certbot): Contenedor secundario de Certbot con renovacion automatica via cron o contenedor sidecar que comparte el volumen `/var/www/certbot` y `/etc/letsencrypt`.
* Opcion B (Alternativa moderna Caddy): Sustituir Nginx por Caddy como reverse proxy, el cual gestiona, emite y renueva certificados Let's Encrypt de forma completamente automatica y nativa sin configuracion adicional de tareas programadas.

---

## 5. Dimensionamiento de Hardware Recomendado (VPS)

El calculo de recursos se basa en el consumo proyectado de los cuatro contenedores concurrentes bajo carga de produccion.

### 5.1. Desglose Estimado de Recursos por Servicio

| Servicio | Consumo CPU Base | Consumo CPU en Carga | Consumo RAM Base | Consumo RAM en Carga |
|---|---|---|---|---|
| Nginx Reverse Proxy | < 1% | 2% - 5% | 15 MB - 30 MB | 40 MB - 60 MB |
| PostgreSQL 16 | 1% - 3% | 15% - 40% | 150 MB - 250 MB | 500 MB - 1024 MB |
| ASP.NET Core Backend (.NET 10) | 1% - 2% | 20% - 50% | 120 MB - 200 MB | 350 MB - 600 MB |
| Next.js Frontend (SSR Node 20) | 1% - 3% | 25% - 60% | 150 MB - 250 MB | 400 MB - 700 MB |
| Sistema Operativo y Demonios | 1% - 2% | 5% | 250 MB - 350 MB | 400 MB |
| Total Estimado | 5% - 10% | Variable segun concurrencia | ~700 MB - 1.1 GB | ~1.7 GB - 2.8 GB |

### 5.2. Especificaciones Minimas del VPS (Entorno Piloto / Pruebas / MVP)
Adecuado para desarrollo, pruebas de concepto y primeros usuarios concurrentes (1 a 10 usuarios simultaneos).
* vCPU: 2 vCPU dedicadas o compartidas de buen rendimiento.
* Memoria RAM: 2 GB fisicos + 2 GB a 4 GB obligatorios de archivo Swap en disco.
  * Nota critica: Con 2 GB de RAM fisica, es indispensable configurar Swap en el sistema operativo. De lo contrario, los procesos de Node.js o .NET pueden ser terminados repentinamente por el Out Of Memory (OOM) Killer del kernel Linux durante picos de compilacion o ejecucion.
* Almacenamiento: 25 GB a 30 GB SSD o NVMe.
* Ancho de banda: Minimo 100 Mbps con 1 TB de transferencia mensual.

### 5.3. Especificaciones Recomendadas del VPS (Produccion Estable)
Adecuado para soportar entre 30 y 150 usuarios concurrentes sin degradacion de tiempos de respuesta.
* vCPU: 4 vCPU.
* Memoria RAM: 4 GB a 8 GB fisicos (permite alojar caches de PostgreSQL en memoria y garantiza holgura para el recolector de basura de .NET y Node.js).
* Swap: 2 GB como margen de proteccion.
* Almacenamiento: 60 GB a 100 GB SSD NVMe (con redundancia o snapshots diarios).
* Red: 1 Gbps con transferencia no medida o minimo 2 TB mensuales.
* Proveedores recomendados: Hetzner Cloud (lineas CPX21/CPX31 o CX32/CX42 por relacion costo/rendimiento), DigitalOcean, Linode/Akamai o AWS Lightsail.

---

## 6. Proyeccion hacia Comercio Electronico (E-Commerce)

La transformacion de este nucleo arquitectonico hacia una plataforma de comercio electronico requiere incorporar componentes especializados para resolver los desafios de transaccionalidad, catalogo, pagos y concurrencia.

### 6.1. Almacenamiento de Archivos Multimedia (Imagenes de Productos)
* Problema: Un e-commerce maneja miles de fotografias en multiples resoluciones (miniaturas, detalle, zoom). Guardarlas en el disco del VPS agota el espacio y consume memoria en el servidor web.
* Solucion recomendada:
  * Utilizar almacenamiento de objetos compatible con S3 (Cloudflare R2, AWS S3, Wasabi, o MinIO alojado en contenedor para entornos privados).
  * Servir las imagenes a traves de una red de distribucion de contenido (CDN como Cloudflare), reduciendo la latencia de carga y aprovechando la optimizacion nativa de imagenes de Next.js (`next/image`).

### 6.2. Motor de Busqueda y Filtrado de Productos
* A medida que el catalogo crece en categorias, atributos (marcas, tallas, colores, rangos de precio) y variantes:
  * Etapa inicial: Indices Full-Text Search en PostgreSQL (`tsvector`, indices GIN) y extension `pg_trgm` para busqueda por similitud tipografica.
  * Etapa avanzada: Incorporacion de un motor de busqueda dedicado como Meilisearch o Elasticsearch conectado mediante eventos o sincronizacion continua para entregar autocompletado y busqueda instantanea tolerante a errores tipograficos.

### 6.3. Gestion de Estado, Cache y Carrito de Compras
* Requisito: Un contenedor adicional con **Redis 7 Alpine**.
* Casos de uso:
  * Persistencia rapida de carritos de compras no autenticados y sesiones temporales.
  * Cache de lectura para categorias y productos mas consultados (evita saturar la base de datos relacional).
  * Limitador de tasa de peticiones (Rate Limiting) para mitigar intentos de scraping en precios o ataques de fuerza bruta en el checkout.

### 6.4. Control de Concurrencia e Inventario (Evitar Sobreventa / Overselling)
* Desafio critico: Evitar que dos clientes compren simultaneamente la ultima unidad de un producto en stock.
* Requerimientos tecnicos en Backend y Base de Datos:
  * Transacciones ACID estrictas con nivel de aislamiento adecuado.
  * Uso de bloqueos a nivel de fila (`SELECT ... FOR UPDATE` en PostgreSQL) durante el paso final del checkout o reservas con tiempo de expiracion (ej. 15 minutos de reserva mientras se procesa el pago).
  * Tablas de auditoria de movimientos de inventario (tipo libro mayor / ledger contable) donde cada ingreso o egreso de stock quede registrado como una transaccion inmutable.

### 6.5. Integracion con Pasarelas de Pago y Seguridad (PCI-DSS)
* Normativa PCI-DSS: La aplicacion NUNCA debe almacenar numeros de tarjeta de credito, fechas de expiracion ni codigos CVV en su base de datos local.
* Arquitectura de integracion:
  * El frontend se comunica con el SDK o iframe seguro de la pasarela de pago (Stripe Elements, Mercado Pago SDK, PagosNet, QR Simple / bancos locales) para tokenizar la tarjeta directamente en los servidores del procesador de pagos.
  * El backend recibe unicamente un `token_pago` seguro y ejecuta el cobro mediante llamadas server-to-server autenticadas con claves privadas.
  * **Manejo de Webhooks con Idempotencia:** La pasarela notificara el exito o fallo de la transaccion de forma asincrona. El backend debe registrar cada `event_id` en una tabla de eventos procesados para garantizar que reintentos de red no dupliquen pedidos o cobros.

### 6.6. Cola de Tareas Asincronas y Notificaciones
* Procesos que no deben bloquear la respuesta HTTP al usuario:
  * Envio de correos de confirmacion de pedido y cambio de estado.
  * Generacion de facturas y recibos en PDF.
  * Notificaciones por mensajeria (SMS / WhatsApp).
* Solucion: Implementacion de colas de mensajes con RabbitMQ o colas livianas respaldadas en Redis (ej. Hangfire o MassTransit en .NET) con reintentos automaticos y cola de mensajes muertos (Dead Letter Queue).

### 6.7. Trazabilidad, Auditoria y Observabilidad
* Registro de logs estructurados mediante Serilog en .NET, exportando trazas a stdout en formato JSON para ingestion en herramientas como Grafana Loki o Datadog.
* Registro estricto de auditoria en base de datos para cambios de estado en pedidos, reembolsos y ajustes manuales de stock por parte de administradores.
