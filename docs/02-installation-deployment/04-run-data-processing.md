---
id: run-data-processing
title: Run Data Processing
sidebar_position: 4
description: Airflow DAGs, Spark jobs, and services that move data through Bronze, Silver, and Gold.
---

# Run Data Processing

With the Compose stack up, data processing runs through Apache Airflow, PySpark jobs, and the speed-layer services. Access the Airflow web interface at `http://localhost:8080` (the credentials are configured in `.env`).

## Orchestrated pipeline

The DAGs run in the following sequence:

| # | DAG | Schedule | Purpose |
|---|---|---|---|
| 1 | `f1_kaggle_historical` | `@once` | Initial load of the Olist historical dataset into S3 Bronze. |
| 2 | `bronze_to_silver_cleaning` | `@daily` | Cleans, anonymizes, deduplicates, and validates data, writing Silver tables and views, and exports daily sales. |
| 3 | `silver_to_gold_business_rules` | `@daily` | Applies the Gold business rules in parallel chains: stockout risk (RN-04) and inventory accuracy; exports Gold tables to S3 and refreshes Power BI views. |
| 4 | `seller_scoring` | `@weekly` | Prepares seller-score inputs, runs the PySpark score calculation through JDBC, and updates seller status. |
| 5 | `f7_promotions_weekly` | `@weekly` | Reads the weekly promotions file, enqueues publishing, and triggers silent-store alerts. |
| 6 | `dag_partitioned_reprocessing` | `@daily` | Re-executes historical processing on selected date partitions. |

To run a DAG immediately, open it in the Airflow UI and use **Trigger DAG**. Confirm the tasks finish successfully, including the Spark tasks. The `seller_scoring` DAG result is exposed by the Inventory API at `GET /api/v1/sellers/{seller_id}/score`.

## Speed layer services

- **Marketplace events (F4):** generate lifecycle events with fault injection (duplicates and out-of-order) from the Marketplace API `POST /api/v1/marketplace/events`. The producer parameters accept the number of orders, a seed, duplicate rate, and out-of-order delays.
- **Seller score ingestion:** the `seller-score-ingestion` consumer reads marketplace events from Kafka and maintains the Silver seller-score inputs.
- **Hot inventory risk:** Spark Streaming consumes the order stream in micro-batches and maintains the `hot_inventory_risk` table for near-real-time stock monitoring.
- **Notification worker:** consumes purchase notifications from the RabbitMQ queue `mercaandes.notifications.purchase` and delivers the confirmation email (or logs it in dry-run mode).
- **Reports and operational alerts:** the `operational-messaging` service exposes `POST /api/v1/reports` to request scheduled commercial reports and publishes alerts to the RabbitMQ alert queues.

## Weekly promotions file (F7)

The commercial team provides the promotions file each week. Place the Excel or CSV file in `inputs/f7_promotions` (mounted at `/opt/inputs/f7_promotions` inside the container). The expected columns are `sku`, `tienda_o_canal`, `descuento_pct`, `fecha_inicio`, and `fecha_fin`. The `f7_promotions_weekly` DAG ingests the file and `POST /api/v1/rabbit/ingest` publishes it to the ingestion queue.

## Verification of the data flow

1. Query the Gold views in PostgreSQL (`gold.vw_sales_consolidated`, `gold.vw_stockout_risk_monitoring`, and the rest of the [business-question views](/docs/business-questions/business-questions)).
2. Check the S3 data lake folders `bronze/`, `silver/`, and `gold/` in the configured bucket.
3. Inspect the quality metrics table `public.data_quality_metrics` (per load: processed, duplicates, late arrivals, and rejections).
