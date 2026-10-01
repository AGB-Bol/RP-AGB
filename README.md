# RP-AGB

Monorepo del proyecto RP-AGB. Frontend en Next.js 15, APIs en .NET (próximamente).

## Requisitos

> **Solo necesitás tener Docker instalado.** Node, pnpm, .NET — todo corre dentro de contenedores.

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)

---

## ⚡ Levantar el entorno (primera vez)

```bash
# 1. Clonar el repo
git clone <url-del-repo>
cd RP-AGB

# 2. Crear tu archivo de variables de entorno
cp .env.example .env

# 3. Levantar todo
docker compose up
```

La primera vez tarda un poco más porque descarga la imagen de Node y construye los contenedores. Las veces siguientes es mucho más rápido.

Abrí el navegador en: **http://localhost:3000**

---

## 🔄 Comandos del día a día

| Comando | Descripción |
|---|---|
| `docker compose up` | Levanta todos los servicios |
| `docker compose up --build` | Levanta y reconstruye las imágenes (usar cuando cambia el `package.json`) |
| `docker compose down` | Baja todos los servicios |
| `docker compose logs -f frontend` | Ver logs del frontend en tiempo real |

### Hot-reload

El código fuente está montado como volumen. Cualquier cambio que hagas en `frontend/src/` se refleja **automáticamente** en el navegador sin necesidad de reiniciar Docker.

---

## 🔧 Cambiar el puerto

Si el puerto `3000` ya está ocupado en tu máquina, editá el `.env`:

```env
FRONTEND_PORT=3001
```

Luego reiniciá: `docker compose down && docker compose up`

---

## 📁 Estructura del proyecto

```
/
├── frontend/               ← App Next.js 15 (TypeScript + pnpm)
│   ├── src/
│   │   └── app/            ← App Router (layouts, pages, etc.)
│   ├── public/             ← Assets estáticos
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      ← Orquestación de servicios
├── .env.example            ← Template de variables de entorno
├── .gitignore
└── README.md
```

> **Próximamente:** El directorio `api/` con los servicios .NET se agregará al mismo `docker-compose.yml`.

---

## 📦 Agregar dependencias de npm

Como el proyecto usa pnpm dentro de Docker, instalá paquetes así:

```bash
docker compose exec frontend pnpm add <paquete>
docker compose exec frontend pnpm add -D <paquete-dev>
```

Esto actualiza el `package.json` y `pnpm-lock.yaml` dentro del contenedor, y los cambios se sincronizan al volumen local.

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15 | Framework frontend (SSR/SSG para SEO) |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Tipado estático |
| [pnpm](https://pnpm.io/) | 9+ | Package manager |
| [Node.js](https://nodejs.org/) | 20 LTS | Runtime (embebido en Docker) |
| [Docker](https://www.docker.com/) | — | Entorno de desarrollo y producción |
