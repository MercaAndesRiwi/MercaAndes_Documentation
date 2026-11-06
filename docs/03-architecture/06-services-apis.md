---
title: Deployed APIs and operational consoles
description: Current API documentation links, platform consoles, and the simulated purchase confirmation flow.
sidebar_position: 6
---

# Deployed APIs and operational consoles

This page records the deployed service endpoints shared by the project team. API documentation links are included for integration and demonstration. They use plain HTTP and should not be used to transmit sensitive information. Prefer a domain behind HTTPS for public API access.

## Public API documentation

| Service | Purpose | Documentation |
|---|---|---|
| Inventory API (F3) | Seller catalog and inventory queries. | [Open the Inventory API Swagger UI](http://3.132.51.65:8002/docs) |
| Marketplace API (F4) | Marketplace lifecycle event generation and simulated purchases. | [Open the Marketplace API Swagger UI](http://3.132.51.65:8003/docs) |

The Marketplace API source defines `POST /api/v1/marketplace/events` to generate lifecycle events and `POST /api/v1/marketplace/purchase` to simulate a purchase and publish its notification event. Check the Swagger UI for the currently deployed request and response contracts.

## Operational consoles

The deployed platform includes Airflow, RabbitMQ Management, Kafka UI, and the Spark Master UI. These are operator interfaces rather than data-source APIs.

These consoles are available on a public EC2 host over plain HTTP.

| Console | Port | Audience |
|---|---:|---|
| Airflow web interface | 8080 | Data-platform operators |
| RabbitMQ Management | 15672 | Messaging operators |
| Kafka UI | 9000 | Streaming operators |
| Spark Master UI | 8081 | Processing operators |

Do not publish console credentials or direct public links in this site. Keep exact access addresses and credentials in a restricted operations runbook. Restrict inbound access to a VPN, Systems Manager, or an approved administrator IP range; rotate exposed credentials and use separate, unique secrets for each service. These dashboards should not be left openly reachable over HTTP.

## Simulated purchase and email confirmation

The Marketplace purchase flow adds a customer-facing demonstration to the event producer:

1. A purchase request is submitted through the Marketplace API.
2. The API creates a simulated order, calculates its line totals, and publishes a `PURCHASE_CONFIRMED` message to the durable RabbitMQ notification queue.
3. The notification worker consumes the message and prepares a confirmation containing the order reference, status, date, purchased items, and total.
4. The deployed demonstration delivers a visually formatted confirmation email. The message includes a **Track my order** action that redirects to a MercaAndes API.

This demonstrates a simulated order whose notification event is actually published and processed asynchronously; it does not represent a real payment authorization. The screenshot supplied for this documentation contains customer and order details, so it is not reproduced here.

## Security and verification notes

- Keep database, SSH, Airflow, and RabbitMQ passwords out of this public documentation and source control.
- Use separate credentials for each service; rotate any password that has been shared in chat or committed to a repository.
- Limit SSH access to approved sources and database ingress to the bastion Security Group where the tunnel is used.
- Replace direct HTTP links with HTTPS endpoints before using the APIs with real or sensitive customer information.

## Related documentation

- [Architecture components](02-components.md)
- [Infrastructure and deployment architecture](03-infrastructure.md)
- [IAM and security](05-iam-security.md)
- [Marketplace API source repository](https://github.com/MercaAndesRiwi/Marketplace_Api)
- [Inventory API source repository](https://github.com/MercaAndesRiwi/Inventory_Api)
