---
id: validation-and-tests
title: Validation and Tests
sidebar_position: 5
description: How to verify the local platform and how to run the automated tests of each repository.
---

# Validation and Tests

## Platform-level verification

From the root of `infrastructure_MercAndes`:

1. **Endpoints and consoles:** run `.\scripts\smoke.ps1` (see [Start the Local Platform](/docs/installation-deployment/start-the-local-platform)).
2. **Simulated purchase with email confirmation:**
   1. Open the Marketplace API Swagger UI at `http://localhost:8003/docs`.
   2. Execute `POST /api/v1/marketplace/purchase` with the default body (a predefined customer and cart).
   3. The API returns `201 Created` with an order ID such as `MA-2026-A1B2C` and publishes the `PURCHASE_CONFIRMED` event to RabbitMQ.
   4. The notification worker consumes the event and renders the confirmation email; set the SMTP variables in `.env` to receive it at a real inbox.
   5. Query the order timeline with `GET /api/v1/marketplace/orders/{order_id}/timeline` to see the event history.
   6. Monitor the worker logs with `docker logs -f platform-notification-worker`.
3. **Seller score check:**
   1. Open Airflow at `http://localhost:8080` and trigger `seller_scoring`.
   2. Query the Inventory API with a seeded seller ID:
      ```powershell
      curl http://localhost:8002/api/v1/sellers/SEL-001/score
      ```
   3. The response contains the score, its four components (dispatch percentage, review rating, inventory accuracy, and cancellation rate), and the calculation timestamp.
4. **Data quality and Gold verification:** check `public.data_quality_metrics` and the Gold views (see [Run Data Processing](/docs/installation-deployment/run-data-processing)).

## Repository tests

The repositories use `uv` for the Python environment and `pytest` for tests. From the repository root:

```powershell
uv sync --locked
uv run pytest
uv run ruff check
```

Per repository:

| Repository | Test focus |
|---|---|
| `infrastructure_MercAndes` | DAG integrity, service contracts (promotion request, notifications), and platform wiring under `tests/` and `services/*/tests/`. |
| `Transactional-POS-database` | Customer and sale generation, persistence, and migrations (`tests/unit`, `tests/integration`). |
| `Marketplace_Api` | Event generation and purchase flow (`tests/unit`). |
| `Inventory_Api` | Seller endpoints, stock, and score endpoints. |
| `MercaAndes_Spark_Gold_Transformations` | Net sales, seller score, hot inventory risk, and late-event recalculation (`tests/`). |
| `api-exchange-rates` / `api-holidays` | Repository behavior and CI workflows. |

## CI

The `api-exchange-rates`, `api-holidays`, `Inventory_Api`, `Marketplace_Api`, and `infrastructure_MercAndes` repositories include GitHub Actions workflows that run linting and tests on pushes, and build and publish the base images to Amazon ECR on `main`.
