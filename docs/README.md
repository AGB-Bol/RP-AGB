# Indice de Documentacion del Proyecto RP-AGB

En este directorio se centraliza toda la documentacion tecnica, arquitectonica, de infraestructura y de calidad del proyecto.

---

## Modulos de Documentacion

### 1. Infraestructura y Arquitectura
* [Arquitectura del Sistema e Infraestructura de Servicios](file:///c:/Users/Usuario/Documents/programas/RP-AGB/docs/infraestructura/arquitectura-sistema.md):
  * Diagrama de arquitectura de contenedores.
  * Inventario detallado de imagenes Docker, versiones y roles de cada servicio (Nginx, Next.js, ASP.NET Core, PostgreSQL).
  * Flujo de red, puertos y persistencia de volumenes.
  * Dimensionamiento de hardware para VPS (minimo y recomendado).
  * Requerimientos y hoja de ruta para evolucionar hacia una plataforma de comercio electronico (e-commerce).

* [Guia de Despliegue en VPS y Hardening de Seguridad](file:///c:/Users/Usuario/Documents/programas/RP-AGB/docs/infraestructura/estrategia-despliegue-vps.md):
  * Protocolo paso a paso de puesta en produccion en un servidor VPS.
  * Decisiones de Proxy Inverso (Nginx vs Caddy) y configuracion de certificados SSL/TLS con Let's Encrypt.
  * Checklist de hardening del sistema operativo (SSH keys, deshabilitacion de root, firewall UFW, Fail2ban, configuracion de Swap).
  * Servicio Systemd para auto-reinicio de contenedores.
  * Politica y script de copias de seguridad (backups) de PostgreSQL.
