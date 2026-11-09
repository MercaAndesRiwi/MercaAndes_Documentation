---
id: start-the-local-platform
title: Arrancar la plataforma local
sidebar_position: 3
description: Arranque del stack Docker Compose, lista de servicios y validación con la prueba de humo.
---

# Arrancar la plataforma local

Ejecuta estos comandos desde la raíz de `infrastructure_MercAndes` en PowerShell.

## Valida y arranca los servicios

```powershell
docker compose config
docker compose up -d --build
```

El primer comando valida la configuración resuelta de Compose. El segundo compila y arranca la plataforma local. En la primera ejecución Docker descarga y compila las imágenes; espera a que termine.

## Lo que arranca el stack

`docker compose up -d --build` arranca el stack completo excepto los contenedores locales de Kafka y RabbitMQ, que están detrás del perfil Compose `local-streaming`. Por defecto las conexiones de mensajería apuntan al nodo de streaming desplegado (IP privada `10.0.11.155`, configurable con `RABBITMQ_HOST` y `KAFKA_BOOTSTRAP_SERVERS`).

Para correr todo localmente, arranca con el perfil y apunta las conexiones a los servicios locales de broker:

```powershell
docker compose --profile local-streaming up -d --build
```

y en `.env` define `RABBITMQ_HOST=rabbitmq` y `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`.

En el arranque Docker realiza automáticamente estos pasos:

1. Inicializa PostgreSQL y aplica los scripts DDL Gold (esquema consolidado, esquema de seller score y vistas de Power BI).
2. Aplica las migraciones transaccionales POS y siembra los catálogos compartidos, clientes, tiendas, sellers y ventas de los cinco países operativos (parámetros de `.env`).
3. Carga tasas de cambio (Frankfurter) y festivos (Nager.Date) para los cinco países.
4. Arranca RabbitMQ y declara las colas operativas.
5. Crea los tópics de Kafka para eventos de pedidos y promociones semanales.
6. Lanza el cluster Spark, el orquestador Airflow (incluyendo los workers celery y Flower) y las APIs.

La lista completa de servicios incluye: `postgres`, `gold-seller-score-schema`, `rabbitmq`, `kafka` (+ `kafka-init`, `kafka-ui` con el perfil `local-streaming`), `spark-master`, `spark-worker`, `seller-score-job`, `seller-score-ingestion-job`, `airflow-init`, `airflow-apiserver`, `airflow-scheduler`, `airflow-dag-processor`, `airflow-worker-1`, `airflow-worker-2`, `airflow-flower`, `pos-database`, `exchange-rates-seed`, `holidays-seed`, `inventory-api`, `marketplace-api`, `f7-weekly-promotions`, `notification-worker`, `operational-alerts-worker` y `reports-api` (+ `reports-worker`).

El servicio `airflow-init` inicializa la base de datos de metadatos de Airflow y crea la cuenta de administrador, luego termina. El API server de Airflow, el scheduler y los workers esperan la inicialización.

## Verifica el estado de los servicios

```powershell
docker compose ps
```

## Ejecuta la prueba de humo

```powershell
.\scripts\smoke.ps1
```

El script verifica estos endpoints:

| Componente           | URL                                    |
| -------------------- | -------------------------------------- |
| Inventory API        | `http://localhost:8002/`               |
| Marketplace API      | `http://localhost:8003/`               |
| Promotions API (F7)  | `http://localhost:8004/health`         |
| Reports API          | `http://localhost:8005/health`         |
| RabbitMQ management  | `http://localhost:15672`               |
| Spark master UI      | `http://localhost:8081`                |
| Airflow API          | `http://localhost:8080/api/v2/version` |
| Airflow Flower       | `http://localhost:5555`                |

Además el script corre `docker compose ps`. Una prueba de humo exitosa confirma que los endpoints verificados responden; por sí sola no demuestra que cada ingesta o workflow se haya ejecutado.
