---
id: stop-and-cleanup
title: Stop and Cleanup Environment
sidebar_position: 6
description: Commands to stop the Compose stack, remove containers, and manage persistent volumes.
---

# Stop and Cleanup Environment

Run these commands from the root of `infrastructure_MercAndes`.

## Stop the platform

```powershell
docker compose down
```

When running the local streaming profile, include it in the command to stop the local brokers as well:

```powershell
docker compose --profile local-streaming down
```

## Stop and remove persisted volumes

```powershell
docker compose down -v
```

This deletes the PostgreSQL, RabbitMQ, Kafka, and Spark data volumes for a clean slate; the next `up --build` re-initializes the schemas and re-runs the seeds.

## Rebuild a single service

After code changes in one component, rebuild only that service to shorten the cycle:

```powershell
docker compose up -d --build inventory-api
```
