---
id: start-the-local-platform
title: Start the Local Platform
sidebar_position: 3
description: Docker Compose stack startup, service list, and validation with the smoke test.
---
# Start the Local Platform

Run these commands from the root of `infrastructure_MercAndes` in PowerShell.

## Validate and start the services

```powershell
docker compose config
docker compose up -d --build
```

The first command validates the resolved Compose configuration. The second builds and starts the local platform. On the first run, Docker downloads and builds the images; allow time for this to finish.

## What the stack starts

`docker compose up -d --build` starts the full stack except the local Kafka and RabbitMQ containers, which sit behind the Compose profile `local-streaming`. By default the messaging connections point to the deployed streaming node (`10.0.11.155`, configurable through `RABBITMQ_HOST` and `KAFKA_BOOTSTRAP_SERVERS`).

To run everything locally, start with the profile and point the connections at the local broker services:

```powershell
docker compose --profile local-streaming up -d --build
```

and in `.env` set `RABBITMQ_HOST=rabbitmq` and `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`.

On startup Docker performs these steps automatically:

1. Initializes PostgreSQL and applies the Gold DDL scripts (consolidated schema, seller-score schema, and Power BI views).
2. Applies the POS transactional migrations and seeds shared catalogs, customers, branches, sellers, and sales for the five operational countries (seed parameters come from `.env`).
3. Loads exchange rates (Frankfurter) and holidays (Nager.Date) for the five countries.
4. Starts RabbitMQ and declares the operational queues.
5. Creates the Kafka topics for order events and weekly promotions.
6. Launches the Spark cluster, the Airflow orchestrator (including the celery workers and Flower), and the APIs.

The full service list includes: `postgres`, `gold-seller-score-schema`, `rabbitmq`, `kafka` (+ `kafka-init`, `kafka-ui` with the profile `local-streaming`), `spark-master`, `spark-worker`, `seller-score-job`, `seller-score-ingestion-job`, `airflow-init`, `airflow-apiserver`, `airflow-scheduler`, `airflow-dag-processor`, `airflow-worker-1`, `airflow-worker-2`, `airflow-flower`, `pos-database`, `exchange-rates-seed`, `holidays-seed`, `inventory-api`, `marketplace-api`, `f7-weekly-promotions`, `notification-worker`, `operational-alerts-worker`, and `reports-api` (+ `reports-worker`).

The `airflow-init` service initializes the Airflow metadata database and creates the administrator account, then exits. The Airflow API server, scheduler, and workers wait for initialization.

## Check service status

```powershell
docker compose ps
```

## Run the smoke test

```powershell
.\scripts\smoke.ps1
```

The script checks these endpoints:

| Component           | URL                                    |
| ------------------- | -------------------------------------- |
| Inventory API       | `http://localhost:8002/`               |
| Marketplace API     | `http://localhost:8003/`               |
| Promotions API (F7) | `http://localhost:8004/health`         |
| Reports API         | `http://localhost:8005/health`         |
| RabbitMQ management | `http://localhost:15672`               |
| Spark master UI     | `http://localhost:8081`                |
| Airflow API         | `http://localhost:8080/api/v2/version` |
| Airflow Flower      | `http://localhost:5555`                |

The script also runs `docker compose ps`. A successful smoke test confirms that the checked endpoints respond; it does not by itself prove that every ingestion or workflow has run.
