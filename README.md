# RP-AGB

Monorepo del proyecto RP-AGB. Frontend en Next.js 15, API en ASP.NET Core (.NET 10), Base de Datos PostgreSQL 16 y Proxy Inverso Nginx.

## Requisitos

> **Solo necesitas tener Docker instalado.** Node, pnpm, .NET, PostgreSQL y Nginx corren dentro de contenedores.

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)

---

## Levantar el entorno (primera vez)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd RP-AGB

# 2. Crear tu archivo de variables de entorno
cp .env.example .env

# 3. Compilar y levantar todos los servicios
docker compose up -d --build
```

La primera vez tardara unos minutos mientras descarga las imagenes base y compila las aplicaciones. Las ejecuciones posteriores seran mucho mas rapidas.

---

## Validar el estado de los servicios

Para confirmar que los 4 contenedores (Frontend, Backend, Base de Datos y Nginx) estan en ejecucion:

```bash
docker compose ps
```

Todos los contenedores deben aparecer en estado `Up` o `healthy`.

---

## Acceso a la aplicacion

Abre tu navegador e ingresa a las siguientes direcciones:

* **Frontend (a traves del Proxy Nginx):** http://localhost
* **Backend API (Healthcheck de Base de Datos):** http://localhost/api/auth/test-db
* **Backend API (Prueba WeatherForecast):** http://localhost/api/weatherforecast
* **Documentacion interactiva Swagger (.NET):** http://localhost:8080/swagger (puerto directo de desarrollo)

---

## Comandos del dia a dia

| Comando | Descripcion |
|---|---|
| `docker compose up -d` | Levanta todos los servicios en segundo plano |
| `docker compose up -d --build` | Reconstruye y levanta imagenes (usar tras cambios de dependencias) |
| `docker compose down` | Detiene y apaga todos los contenedores preservando los datos |
| `docker compose logs -f frontend` | Ver logs del frontend en tiempo real |
| `docker compose logs -f backend` | Ver logs de la API .NET en tiempo real |
| `docker compose logs -f db` | Ver logs de PostgreSQL en tiempo real |

### Hot-reload en Frontend
El codigo fuente de `frontend/src/` esta montado como volumen. Cualquier cambio que guardes se reflejara de inmediato en el navegador sin reiniciar Docker.

---

## Estructura del proyecto

```text
/
├── backend/                # API ASP.NET Core (.NET 10) con Clean Architecture
│   ├── RPAGB.Api/          # Controladores REST, Swagger y endpoints HTTP
│   ├── RPAGB.Application/  # Casos de uso, logica de aplicacion y DTOs
│   ├── RPAGB.Domain/       # Entidades del negocio (User, Role, Permission)
│   ├── RPAGB.Infrastructure/ # Acceso a datos con EF Core y PostgreSQL
│   ├── BACKEND.slnx        # Solucion .NET
│   └── Dockerfile          # Multi-stage build (.NET SDK -> Alpine Runtime)
├── frontend/               # Aplicacion Web Next.js 15 (React 19 + TypeScript)
│   ├── src/app/            # App Router (vistas, componentes, layouts)
│   ├── public/             # Assets estaticos
│   └── Dockerfile          # Multi-stage build con pnpm 9
├── database/               # Scripts SQL de inicializacion (schema_auth.sql)
├── nginx/                  # Configuracion del Proxy Inverso (nginx.conf)
├── docs/                   # Documentacion tecnica de arquitectura y despliegue
│   ├── infraestructura/    # Especificaciones de hardware, VPS y hardening
│   └── README.md           # Indice de la documentacion
├── docker-compose.yml      # Orquestacion de los 4 servicios
├── .env.example            # Plantilla de variables de entorno
└── README.md
```

---

## Agregar dependencias en Frontend

Como el proyecto utiliza pnpm dentro de Docker, instala dependencias de la siguiente manera:

```bash
docker compose exec frontend pnpm add <paquete>
docker compose exec frontend pnpm add -D <paquete-dev>
```

Esto actualizara `package.json` y `pnpm-lock.yaml` dentro del contenedor y se sincronizara con tu maquina local.

---

## Tecnologias

| Tecnologia | Version | Uso |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15.3.4 | Framework Frontend con soporte SSR/SSG |
| [React](https://react.dev/) | 19.0.0 | Biblioteca de interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipado estatico |
| [.NET / C#](https://dotnet.microsoft.com/) | 10.0 | API Backend con Clean Architecture |
| [Entity Framework Core](https://learn.microsoft.com/ef/core/) | 10.0 | ORM y mapeo de datos |
| [PostgreSQL](https://www.postgresql.org/) | 16 Alpine | Motor de base de datos relacional con RBAC |
| [Nginx](https://nginx.org/) | Alpine | Reverse Proxy y punto de entrada unificado |
| [Docker](https://www.docker.com/) | Compose v2 | Orquestacion de contenedores y despliegue |

---

## Documentacion Detallada

Para consultar la arquitectura del sistema, inventario de imagenes, dimensionamiento de servidores VPS y consideraciones para e-commerce, visita el directorio [docs/](docs/README.md):

* [docs/infraestructura/arquitectura-sistema.md](docs/infraestructura/arquitectura-sistema.md)
* [docs/infraestructura/estrategia-despliegue-vps.md](docs/infraestructura/estrategia-despliegue-vps.md)
