---
id: schemas-organization
title: Schemas and Database Organization
sidebar_position: 2
description: How the MercaAndes PostgreSQL serving layer organizes transactional, staging, Silver, and Gold schemas.
---

# Schemas and Database Organization

## 1. Overview

MercaAndes organizes its PostgreSQL 16 serving layer in schemas that separate transactional country data, shared operational tables, staging areas for the processing pipelines, and the analytical Silver/Gold layers consumed by Power BI.

The schemas live in the RDS instance `mercaandes-postgres-gold`, database `merca_pos`, and reproduce the same organization in the local Compose `postgres` service.

## 2. Schema map

| Schema | Content |
|---|---|
| `public` | Operational country schemas support tables: shared dimensions (`dim_*`), shared facts (`fact_*`), operational tables (`marketplace_events`, `gold_*`, `hot_inventory_risk`, `data_quality_metrics`), and backward-compatible view aliases (`vw_gold_*`), plus the transactional lexicon of catalogs. |
| `colombia`, `peru`, `ecuador`, `bolivia`, `chile` | Transactional POS data per country: `fact_sale` and `fact_sale_item`. |
| `z1_silver` | Staging area of the bronze-to-silver lineage: cleaned and pseudonymized customer data before linear writing to Silver. |
| `z2_gold` | Working schemas of the DAG rules; `available_inventory`, `stockout_risk`, `inventory_accuracy`, and `daily_sales`. |
| `silver` | Curated views for audit and seller-score inputs. |
| `gold` | Official Power BI views (the seven business questions). |

Schemas `colombia`–`chile` are generated from the DDL or Alembic and populated by the POS seeding (`pos-database` image), while `z1_silver`, `z2_gold`, `silver`, and `gold` are created by the DAGs and the DDL scripts in `postgres/ddl`.

## 3. Transactional country schemas

Each operational country keeps its own `fact_sale` (with the sale header, currency, amounts, and status) and `fact_sale_item` (with the product line, quantity, unit price, and discount).

For example, a Colombian sale is stored in `colombia.fact_sale`, and its lines in `colombia.fact_sale_item` related by `sale_id`. The same structure holds in the rest of the countries.

The Airflow transformations discover the country schemas that already contain `fact_sale` and union them for a consolidated flat table in the Gold layer.

## 4. Shared public schema

The `public` schema contains those tables used across the transactional schemas:

- **Master dimensions:** `dim_currency`, `dim_country`, `dim_geolocation`, `dim_customer`, `dim_branch`, `dim_seller`, `dim_product_category`, `dim_product`, `dim_source`, `dim_exchange_rate`, `dim_holiday`, `dim_holiday_type`.
- **Shared facts:** `fact_sale` and `fact_sale_item` (consolidated copies of per-country data; the Airflow exports write here for the consolidated views).
- **Operational tables:** `marketplace_events` (event heartbeat with deduplication state), `marketplace_seller_score_events`, `dim_seller_source_key` (maps source system keys to canonical sellers), and `customers` (raw customers that feed the Silver pseudonymized view).
- **Gold serving tables:** `gold_stockout_risk`, `hot_inventory_risk`, `gold_promotions_audit`, `gold_seller_score`, `gold_seller_score_history`, `gold_seller_status`, `data_quality_metrics`.
- **Silver seller-score inputs:** `silver_seller_score_dispatch`, `silver_seller_score_reviews`, `silver_seller_score_inventory`, `silver_seller_score_cancellations` (relational inputs for the JDBC Spark job).

See the [Transactional data dictionary](03-transactional-data-dictionary.md) for column-level detail.

## 5. Staging schemas z1_silver / z2_gold

The DAGs create and maintain working schemas that avoid writing partial results into the analytical path:

- `z1_silver.masked_customers`: pseudonymized customer records (name, document, email masked) built before Silver exports.
- `z2_gold.daily_sales`: daily aggregation of orders and net sales in USD, recalculated after cleaning.
- `z2_gold.available_inventory` and `z2_gold.stockout_risk`: inventory availability snapshots and the computed stockout risk with `sales_at_risk_usd`.
- `z2_gold.inventory_accuracy`: per-seller inventory accuracy percentages.

These tables are seed staging areas; the final copy lives in the public Gold serving tables.

## 6. Silver and Gold schemas

The `silver` schema exposes curated, anonymized, and audit views. The `gold` schema exposes one officially documented view per business question; Power BI consumes the `gold` views.

| Schema | Views |
|---|---|
| `silver` | `vw_customers_anonymized`, `vw_seller_dispatch`, `vw_seller_reviews`, `vw_seller_inventory`, `vw_seller_cancellations`, `vw_marketplace_events` (excludes events with status `exception_exceeded_72h`) |
| `gold` | `vw_sales_consolidated`, `vw_stockout_risk_monitoring`, `vw_promotions_analysis`, `vw_seller_performance`, `vw_returns_audit`, `vw_holiday_sales_impact`, `vw_data_quality_dashboard` |

The `public` schema keeps backward-compatible aliases of the Gold views (`vw_gold_sales_consolidated`, `vw_gold_stockout_risk_monitoring`, `vw_gold_promotions_analysis`, `vw_gold_seller_performance`, `vw_gold_returns_audit`, `vw_gold_holiday_sales_impact`, `vw_gold_data_quality_dashboard`) so that existing consumers do not require schema changes.

## 7. Database initialization

The Compose stack creates the local serving database in this order:

1. `01-databases.sh` creates the PostgreSQL app users and the Airflow database.
2. `gold-seller-score-schema` service applies `01_consolidated_mer_gold_schema.sql` (schema, dims, facts, operational tables, seeds) and `03-gold-seller-score.sql` (seller-score serving contract).
3. `02-gold-operational.sql` creates `gold_stockout_risk` in the database.
4. `pos-database` runs the Alembic migrations and the POS seeding.
5. `04-gold-powerbi-views.sql` creates the `silver`/`gold` schemas and views (also executed by the Airflow business-rules DAG before queries).

All scripts are idempotent, so the stack initializes new volumes and existing ones. `05-purge-airflow-from-gold.sql` removes Airflow-written artifacts that do not belong in the serving layer.

## 8. Related Documentation

- [Entity-Relationship Model](01-entity-relationship-model.md)
- [Transactional Data Dictionary](03-transactional-data-dictionary.md)
- [Gold Analytics Dictionary](05-gold-analytics-dictionary.md)
