# Guia de Despliegue en VPS y Hardening de Seguridad

Este documento describe el procedimiento detallado para el despliegue del proyecto RP-AGB en un servidor virtual privado (VPS), la configuracion del proxy inverso con certificados SSL/TLS y las directivas de seguridad para el sistema operativo anfitrion.

---

## 1. Decision de Proxy Inverso y Gestion de Certificados SSL/TLS

El proyecto incluye en su configuracion actual un contenedor con **Nginx** como proxy inverso (`nginx/nginx.conf`).

### 1.1. Comparativa Tecnica

* **Nginx + Certbot (Configuracion actual del repositorio):**
  * Ventajas: Gran rendimiento, estandar consolidado en la industria, bajo consumo de memoria (15 MB), amplio soporte para reglas complejas y compatibilidad probada con cabeceras de proxy y WebSockets.
  * Gestion de SSL: Requiere integrar un contenedor complementario con `certbot/certbot` o ejecutar Certbot en el host para generar y renovar los certificados via Let's Encrypt cada 60-90 dias.
* **Caddy (Alternativa recomendada para simplificar operacion):**
  * Ventajas: Gestion de certificados HTTPS completamente automatizada sin necesidad de Certbot ni tareas programadas adicionales. La renovacion y desafio ACME se gestionan internamente en el binario.
  * Consideracion: Consumo ligeramente superior de memoria respecto a Nginx Alpine (~30 MB vs ~15 MB), aunque insignificante para el dimensionamiento del servidor.

### 1.2. Implementacion de SSL con Nginx y Certbot
Para habilitar HTTPS en produccion sobre la infraestructura actual con Nginx, se debe agregar el servicio de Certbot al `docker-compose.yml` compartiendo dos volumenes:
1. `certbot_conf`: Montado en `/etc/letsencrypt` en ambos contenedores para compartir los certificados generados.
2. `certbot_www`: Montado en `/var/www/certbot` en ambos contenedores para responder a los desafios HTTP-01 de Let's Encrypt.

Fragmento de configuracion recomendado para Nginx en produccion:
```nginx
server {
    listen 80;
    server_name midominio.com www.midominio.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name midominio.com www.midominio.com;

    ssl_certificate /etc/letsencrypt/live/midominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/midominio.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 2. Checklist y Protocolo de Hardening Inicial en el VPS

Al aprovisionar un servidor nuevo con Ubuntu Server (22.04 LTS o 24.04 LTS), deben ejecutarse obligatoriamente las siguientes directivas antes de levantar los contenedores.

### 2.1. Actualizacion del Sistema y Creacion de Usuario Operativo
```bash
# 1. Actualizar repositorios y paquetes del sistema
sudo apt update && sudo apt upgrade -y

# 2. Crear usuario de administracion sin privilegios directos de root
sudo adduser deployer
sudo usermod -aG sudo deployer

# 3. Copiar las llaves SSH autorizadas al nuevo usuario
sudo mkdir -p /home/deployer/.ssh
sudo cp ~/.ssh/authorized_keys /home/deployer/.ssh/
sudo chown -R deployer:deployer /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh
sudo chmod 600 /home/deployer/.ssh/authorized_keys
```

### 2.2. Fortalecimiento del Servicio SSH
Editar el archivo `/etc/ssh/sshd_config` o crear un archivo en `/etc/ssh/sshd_config.d/hardening.conf`:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 4
ClientAliveInterval 300
ClientAliveCountMax 2
```
Reiniciar el demonio SSH:
```bash
sudo systemctl restart ssh
```

### 2.3. Configuracion de Firewall (UFW)
Restringir el accesoUnicamente a los puertos estrictamente necesarios:
```bash
# Establecer politicas por defecto
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir trafico esencial
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP Nginx'
sudo ufw allow 443/tcp comment 'HTTPS Nginx'

# Habilitar el cortafuegos
sudo ufw enable
sudo ufw status verbose
```
Nota: NUNCA permitir acceso publico a los puertos 5432 (PostgreSQL) ni 8080 (Backend .NET). La comunicacion entre ellos se realiza a traves de la red virtual de Docker (`app_network`).

### 2.4. Instalacion y Habilitacion de Fail2ban
Para proteger el puerto SSH contra ataques de fuerza bruta:
```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2.5. Configuracion Obligatoria de Swap (Memoria de Intercambio)
En servidores con 2 GB o 4 GB de RAM, la creacion de Swap es critica para prevenir caidas por Out-Of-Memory (OOM):
```bash
# Crear un archivo swap de 4 GB
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacerlo persistente en reinicios
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Ajustar la agresividad del intercambio (swappiness)
sudo sysctl vm.swappiness=20
echo 'vm.swappiness=20' | sudo tee -a /etc/sysctl.conf
```

---

## 3. Instalacion de Docker y Despliegue de la Aplicacion

### 3.1. Instalacion de Docker Engine Oficial
```bash
# Instalar dependencias preliminares
sudo apt install -y ca-certificates curl gnupg

# Configurar repositorio oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Agregar al usuario deployer al grupo docker
sudo usermod -aG docker deployer
```

### 3.2. Puesta en Marcha con Docker Compose
1. Iniciar sesion con el usuario `deployer`.
2. Clonar el repositorio en `/opt/rp-agb` o en `/home/deployer/rp-agb`:
   ```bash
   git clone <URL_DEL_REPOSITORIO> app
   cd app
   ```
3. Crear el archivo `.env` de produccion asegurando contrasenas seguras para PostgreSQL:
   ```bash
   cp .env.example .env
   nano .env
   ```
4. Construir y levantar los contenedores en segundo plano:
   ```bash
   docker compose up -d --build
   ```
5. Verificar el estado de los servicios:
   ```bash
   docker compose ps
   docker compose logs -f --tail=50
   ```

---

## 4. Servicio Systemd para Auto-Arranque de la Infraestructura

Para garantizar que todos los contenedores inicien automaticamente si el servidor se reinicia fisicamente, se recomienda crear una unidad de servicio systemd en `/etc/systemd/system/rp-agb.service`:

```ini
[Unit]
Description=Servicios Docker Compose de RP-AGB
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deployer/app
User=deployer
Group=docker
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Habilitar el servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable rp-agb.service
```

---

## 5. Politica de Respaldos de la Base de Datos

Para proteger los datos persistentes de PostgreSQL alojados en el volumen `postgres_data`, se debe programar un respaldo diario mediante un script bash en cron:

```bash
#!/bin/bash
# /home/deployer/backup_db.sh
FECHA=$(date +"%Y%m%d_%H%M%S")
DESTINO="/home/deployer/backups"
mkdir -p $DESTINO

docker exec postgres_db pg_dump -U admin proyecto_db | gzip > $DESTINO/db_backup_$FECHA.sql.gz

# Retener solo los respaldos de los ultimos 14 dias
find $DESTINO -type f -name "*.sql.gz" -mtime +14 -delete
```

Hacerlo ejecutable y programarlo en el crontab (`crontab -e`):
```
0 3 * * * /home/deployer/backup_db.sh > /dev/null 2>&1
```
