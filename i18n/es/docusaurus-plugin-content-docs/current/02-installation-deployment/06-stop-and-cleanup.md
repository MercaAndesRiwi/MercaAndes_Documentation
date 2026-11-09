---
id: stop-and-cleanup
title: Detener y limpiar el entorno
sidebar_position: 6
description: Comandos para detener el stack Compose, eliminar contenedores y gestionar los volúmenes persistentes.
---

# Detener y limpiar el entorno

Ejecuta estos comandos desde la raíz de `infrastructure_MercAndes`.

## Detener la plataforma

```powershell
docker compose down
```

Al usar el perfil local de streaming, inclúyelo en el comando para detener también los brokers locales:

```powershell
docker compose --profile local-streaming down
```

## Detener y eliminar los volúmenes persistidos

```powershell
docker compose down -v
```

Esto elimina los volúmenes de datos de PostgreSQL, RabbitMQ, Kafka y Spark para partir de cero; el próximo `up --build` reinicializa los esquemas y vuelve a correr las semillas.

## Reconstruir un servicio único

Tras cambios de código en un componente, reconstruye solo ese servicio para acortar el ciclo:

```powershell
docker compose up -d --build inventory-api
```
