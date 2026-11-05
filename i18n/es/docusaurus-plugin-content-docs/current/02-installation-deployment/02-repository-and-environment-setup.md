---
title: Configuración de repositorios y entorno
description: Organización de los repositorios y variables de entorno para el desarrollo local.
---

# Configuración de repositorios y entorno

La plataforma se distribuye entre repositorios con responsabilidades distintas:

- `infrastructure_MercAndes`: Docker Compose, imágenes de servicios, integración de la plataforma, CI y pruebas de conectividad.
- `data-processing-dev`: ingesta, catálogo, simuladores POS, migraciones, pruebas y dependencias de procesamiento.

Para ejecutar el archivo Compose de infraestructura, el repositorio de procesamiento debe estar disponible como una carpeta hermana llamada `data-processing`, porque los servicios API montan `../data-processing` en `/opt/domain` en modo de solo lectura. Organiza o clona los repositorios para que esa ruta relativa exista al ejecutar Compose desde el repositorio de infraestructura.

## Configurar el entorno de infraestructura

Desde la raíz de `infrastructure_MercAndes`, crea el archivo local de entorno:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y reemplaza los valores de ejemplo con las credenciales locales que utilizarás. El archivo de ejemplo sirve como plantilla; `.env` contiene valores locales y no debe subirse al repositorio.

El README de infraestructura documenta estos grupos de configuración:

- PostgreSQL: `POS_DB_NAME`, `POS_DB_USER`, `POS_DB_PASSWORD`.
- RabbitMQ: `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_VHOST`.
- Base de metadatos y administrador de Airflow: `AIRFLOW_DB_NAME`, `AIRFLOW_DB_USER`, `AIRFLOW_DB_PASSWORD`, `AIRFLOW_ADMIN_USER`, `AIRFLOW_ADMIN_PASSWORD`.
- Puertos publicados, recursos de Spark y opciones de los simuladores.

## Configurar el entorno de procesamiento de datos

Desde la raíz de `data-processing-dev`, crea su archivo local de entorno:

```powershell
Copy-Item .env.example .env
```

Edita `.env` para indicar la base de datos PostgreSQL y las credenciales de la ejecución local. El README de procesamiento enumera `POS_DB_HOST`, `POS_DB_PORT`, `POS_DB_NAME`, `POS_DB_USER` y `POS_DB_PASSWORD`, además de las fechas y el modo de generación POS, la carga del catálogo compartido y la configuración de los simuladores.

Para ejecutar un comando desde el equipo anfitrión, el README especifica `POS_DB_HOST=localhost`. Los contenedores de infraestructura se conectan usando el nombre del servicio PostgreSQL dentro de la red Docker. Usa el valor que corresponda al lugar desde donde ejecutes el comando.

No subas archivos `.env` ni credenciales reales al repositorio.
