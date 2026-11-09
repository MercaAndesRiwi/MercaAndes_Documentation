---
title: Deployed APIs and operational consoles
description: Deployed API documentation links, local Swagger UIs, operational consoles, and the simulated purchase confirmation flow.
sidebar_position: 6
---

# Deployed APIs and operational consoles

This page lists the service endpoints shared by the project team, together with their local counterparts for the Compose stack. These services use plain HTTP and should not carry sensitive information in transit; prefer HTTPS-backed domains for public traffic.

## Deployed API documentation

The three APIs are deployed on ECS Fargate tasks reachable through public IPs, in the cluster `mercaandes-ecs-cluster`.

| Service | Purpose | Documentation |
|---|---|---|
| Inventory & Sellers API (F3) | Seller catalog, inventory, and seller scores. | [Open the Swagger UI](http://3.132.51.65:8002/docs) |
| Marketplace API (F4) | Marketplace lifecycle event generation and simulated purchases. | [Open the Swagger UI](http://3.132.51.65:8003/docs) |
| Promotions API (F7) | Weekly promotions ingestion and validation. | [Open the Swagger UI](http://3.132.51.65:8004/docs) |

If an endpoint stops responding, the task may have been redeployed with a different public address; recover the current one from the task network interfaces (`aws ecs describe-tasks` + `aws ec2 describe-network-interfaces`) and update this table.

## API contracts

The Inventory API exposes `GET /api/v1/sellers` (list), `GET /api/v1/sellers/{seller_id}` (detail), `GET /api/v1/sellers/{seller_id}/score` (score), `GET /api/v1/sellers/{seller_id}/inventory` and `/inventory/{sku}` (inventory per seller and SKU), and `GET /api/v1/inventory/stock` (stock level). All routes are documented in the Swagger UI.

The Marketplace API defines `POST /api/v1/marketplace/events` (lifecycle event generation with fault injection), `POST /api/v1/marketplace/purchase` (simulated purchase with notification event), and `GET /api/v1/marketplace/orders/{order_id}/timeline` (order status and timeline). Swagger UIs show the currently deployed request and response contracts.

The Promotions API exposes `GET /health`, `POST /api/v1/promotions/ingest` (Excel/CSV ingestion into `gold_promotions_audit`), and `POST /api/v1/rabbit/ingest` (publishes the file to the ingestion queue).

## Local Swagger UIs

With the Compose stack running, the same APIs answer on their local ports:

| Service | URL |
|---|---|
| Marketplace API (F4) | `http://localhost:8003/docs` |
| Inventory API (F3) | `http://localhost:8002/docs` |
| Promotions API (F7) | `http://localhost:8004/docs` |
| Reports API | `http://localhost:8005/docs` |

## Operational consoles

The platform includes Airflow, RabbitMQ Management, Kafka UI (Kafdrop), and Spark Master UI. These are operator interfaces rather than data-source APIs.

| Console | Deployed URL | Local port | Audience |
|---|---|---:|---|
| Airflow web interface | [Airflow](http://3.132.51.65:8080/) | 8080 | Data-platform operators |
| Airflow Flower | — | 5555 | Distributed-worker monitoring |
| RabbitMQ Management | [RabbitMQ Management](http://3.132.51.65:15672/) | 15672 | Messaging operators |
| Kafka UI (Kafdrop) | [Kafka UI](http://3.132.51.65:9000/) | 9000 | Streaming operators |
| Spark Master UI | [Spark Master UI](http://3.132.51.65:8081/) | 8081 | Processing operators |

Credentials for these consoles live in the `.env` file of `infrastructure_MercAndes` (`AIRFLOW_ADMIN_USER`/`AIRFLOW_ADMIN_PASSWORD`, `RABBITMQ_USER`/`RABBITMQ_PASSWORD`). Do not publish console credentials in this site or in chat; restrict inbound console access to approved administrator IPs and rotate exposed credentials.

## Simulated purchase and email confirmation

The Marketplace purchase flow adds a customer-facing demonstration to the event producer:

1. A purchase request is submitted through the Marketplace API (`POST /api/v1/marketplace/purchase`).
2. The API creates a simulated order (order ID such as `MA-2026-A1B2C`), calculates line totals, and publishes a `PURCHASE_CONFIRMED` message to the durable RabbitMQ queue `mercaandes.notifications.purchase`.
3. The notification worker consumes the message and prepares a confirmation containing the order reference, status, date, purchased items, and total.
4. The deployed demonstration delivers a formatted confirmation email (via SMTP; empty `SMTP_HOST` runs it in dry-run logging mode). The message includes a **Track my order** action that redirects to the order-timeline API.

{/* IMAGEN-AQUI: captura del correo de confirmaciÃ³n de compra (la que tenÃ­as; contiene datos de cliente/orden, decide si la vuelves a incluir). */}

This flow demonstrates a simulated order whose notification event is published and processed asynchronously; it does not represent a real payment authorization.

## Security and verification notes

- Keep database, SSH, Airflow, and RabbitMQ passwords out of this public documentation and source control.
- Use separate credentials for each service; rotate any password that has been shared in chat or committed to a repository.
- Limit SSH access to approved sources and database ingress to the bastion Security Group where the tunnel is used.
- Replace direct HTTP links with HTTPS endpoints before using the APIs with real or sensitive customer information.

## Related documentation

- [Architecture components](02-components.md)
- [AWS infrastructure and costs](aws-infrastructure.md)
- [IAM and security](05-iam-security.md)
- [Marketplace API source repository](https://github.com/MercaAndesRiwi/Marketplace_Api)
- [Inventory API source repository](https://github.com/MercaAndesRiwi/Inventory_Api)
