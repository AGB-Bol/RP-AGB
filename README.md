# RP-AGB

Monorepo del proyecto RP-AGB. Inicialmente enfocado en el frontend con Next.js 15, con soporte preparado para incorporar las APIs en .NET en este mismo repositorio.

---

## Requisitos previos

El entorno está diseñado para que no requieras instalar Node, pnpm ni runtimes locales. Únicamente necesitas:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (con Docker Compose activo)
- Git

---

## Levantar el entorno (primera vez)

Ejecuta los siguientes comandos desde la raíz del proyecto:

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd RP-AGB

# 2. Crear el archivo de variables de entorno
cp .env.example .env

# 3. Construir e iniciar el contenedor
docker compose up
```

Nota: La primera vez tomará unos minutos mientras descarga la imagen base e instala las dependencias.

Una vez que la consola muestre el estado listo (`Ready`), abre el navegador en:
**http://localhost:3000**

---

## Comandos frecuentes

| Comando | Descripción |
|---|---|
| `docker compose up` | Inicia todos los servicios configurados |
| `docker compose up -d` | Inicia los servicios en segundo plano |
| `docker compose up --build` | Reconstruye la imagen (usar si cambia `package.json` o Dockerfile) |
| `docker compose down` | Detiene y remueve los contenedores |
| `docker compose logs -f frontend` | Muestra los logs del frontend en tiempo real |

### Recarga en caliente (Hot-reload)

El código fuente local está montado como volumen en el contenedor. Cualquier cambio guardado en `frontend/src/` se reflejará automáticamente en el navegador sin reiniciar Docker.

---

## Configuración del editor e IDE (TypeScript)

Para que tu editor (VS Code, Cursor u otros) resuelva correctamente el autocompletado y los tipos sin errores de importación ni dependencias cruzadas entre Linux (Docker) y Windows:

1. El repositorio incluye `.vscode/settings.json` y `frontend/.npmrc` configurados para usar la versión de TypeScript del proyecto.
2. Si tu editor no toma los tipos automáticamente al abrir un archivo `.tsx`, presiona `Ctrl + Shift + P` (o `F1`), busca **TypeScript: Select TypeScript Version...** y selecciona **Use Workspace Version**.

---

## Cambio de puerto local

Si el puerto `3000` está ocupado en tu máquina, modifica la variable en tu archivo `.env`:

```env
FRONTEND_PORT=3001
```

Luego reinicia el entorno:

```bash
docker compose down
docker compose up
```

---

## Gestión de dependencias

Como el gestor de paquetes (pnpm) corre dentro del contenedor, añade dependencias con los siguientes comandos para mantener sincronizados los archivos locales:

```bash
# Dependencia de producción
docker compose exec frontend pnpm add <nombre-paquete>

# Dependencia de desarrollo
docker compose exec frontend pnpm add -D <nombre-paquete>
```

---

## Estructura del proyecto

```
/
├── frontend/               # Aplicación Next.js 15 (TypeScript + pnpm)
│   ├── src/
│   │   └── app/            # App Router (layouts, páginas y rutas)
│   ├── public/             # Archivos y assets estáticos
│   ├── Dockerfile          # Definición multi-stage para dev y producción
│   ├── .npmrc              # Configuración de compatibilidad de node_modules
│   └── package.json        # Dependencias y scripts
├── .vscode/                # Configuración de TypeScript para el editor
├── docker-compose.yml      # Orquestación de contenedores
├── .env.example            # Plantilla de variables de entorno (versionada)
├── .env                    # Variables locales (ignorado en git)
├── .gitignore              # Reglas de exclusión para control de versiones
└── README.md               # Documentación general del proyecto
```

Nota: La futura carpeta `api/` con las soluciones .NET se integrará como servicio adicional en este mismo `docker-compose.yml`.

---

## Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 15 (App Router) | Framework frontend optimizado para SEO y SSR |
| React | 19 | Biblioteca de componentes de interfaz |
| TypeScript | 5 | Tipado estático y robustez de código |
| pnpm | 9 (aislado) | Gestor eficiente de paquetes |
| Node.js | 20 LTS | Runtime de ejecución (dentro del contenedor) |
| Docker & Compose | Reciente | Estandarización del entorno de desarrollo |
