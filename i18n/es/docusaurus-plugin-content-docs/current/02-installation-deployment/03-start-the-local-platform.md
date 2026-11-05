---
title: Iniciar la plataforma local
description: Instrucciones para levantar y comprobar los servicios locales con Docker Compose.
---

# Iniciar la plataforma local

Ejecuta estos comandos en PowerShell desde la raíz de `infrastructure_MercAndes`.

## Validar e iniciar los servicios

```powershell
docker compose config
docker compose up -d --build
```

El primer comando valida la configuración Compose resultante. El segundo construye e inicia la plataforma local. En la primera ejecución, Docker descarga las imágenes de los servicios; espera a que termine.

El stack Compose del repositorio de infraestructura incluye PostgreSQL, RabbitMQ, Kafka, Kafka UI, Spark Master y Worker, servicios de inicialización, API y scheduler de Airflow, además de las APIs POS, inventario y marketplace.

El servicio `airflow-init` inicializa los metadatos de Airflow y crea la cuenta administradora; luego finaliza. La API y el scheduler de Airflow esperan a que esa inicialización concluya.

## Consultar el estado de los servicios

```powershell
docker compose ps
```

## Ejecutar la comprobación rápida

```powershell
.\scripts\smoke.ps1
```

El script consulta los siguientes endpoints:

| Componente | URL |
|---|---|
| API POS | `http://localhost:8001/health` |
| API de inventario | `http://localhost:8002/health` |
| API de marketplace | `http://localhost:8003/health` |
| Administración de RabbitMQ | `http://localhost:15672` |
| Interfaz de Spark Master | `http://localhost:8081` |
| API de Airflow | `http://localhost:8080/api/v2/version` |

El script también ejecuta `docker compose ps`. Una comprobación rápida exitosa confirma que responden los endpoints consultados; por sí sola, no demuestra que todas las cargas o transformaciones de datos se hayan ejecutado correctamente.

Esta guía es para desarrollo local. No sustituye la documentación de [infraestructura y despliegue en AWS](../03-architecture/03-infrastructure.md).
