# Estrategia de Despliegue (VPS) - Proyecto SICI

## 1. Estrategia de Reverse Proxy y SSL Automático
Se investigaron las opciones para exponer la solución de forma segura, comparando Nginx + Certbot frente a alternativas modernas como Caddy o Traefik.

* **Decisión del equipo:** Elegimos Caddy porque automatiza el SSL nativamente / Elegimos Nginx por la experiencia previa del equipo.
* **Gestión de SSL:** El componente que gestionará los certificados HTTPS/SSL de manera desatendida será [ESCRIBIR AQUÍ: Certbot o el propio Caddy/Traefik].

## 2. Dimensionamiento de Hardware (VPS)
Para soportar concurrentemente los contenedores de PostgreSQL, la API en .NET y el Frontend en React:

* **Requisitos Mínimos de la VPS:** 2 vCPU, 2GB de RAM, 20GB de almacenamiento
* **Requisitos Recomendados:** 4 vCPU, 4GB de RAM.

## 3. Estrategia de Despliegue y Actualización
* **Herramienta:** Se utilizará **Docker Compose directo** para levantar toda la infraestructura desde el VPS.
* **Proceso:** Nos conectaremos por SSH, haremos un `git pull` de la rama principal y ejecutaremos `docker compose up -d --build`.

## 4. Checklist de Seguridad Inicial del Servidor
Al recibir la VPS genérica (Ubuntu Server), se aplicarán obligatoriamente las siguientes medidas:
- [ ] Configurar el **Firewall (UFW)** permitiendo únicamente el tráfico por los puertos 80 (HTTP), 443 (HTTPS) y 22 (SSH).
- [ ] Instalar y habilitar **Fail2ban** para bloquear intentos de acceso por fuerza bruta.
- [ ] Deshabilitar el acceso por contraseña estándar y configurar la autenticación exclusiva mediante **SSH Keys**.