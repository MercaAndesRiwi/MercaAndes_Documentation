---
id: transactional-data-dictionary
title: Transactional Data Dictionary
sidebar_position: 3
description: Column-level dictionary of the shared dimensions and facts of the MercaAndes serving database.
---

# Transactional Data Dictionary

The tables below document the shared entities of the `public` schema. UUID primary keys are server-generated, `created_at`/`updated_at` timestamps default to `NOW()`, and foreign keys enforce referential integrity as declared in `postgres/ddl/01_consolidated_mer_gold_schema.sql` and the Alembic migrations of `Transactional-POS-database`.

## Dimensions

### dim_currency

| Column | Type | Description |
|---|---|---|
| `currency_id` | UUID (PK) | Identifier. |
| `currency_code` | CHAR(3), unique | ISO code (COP, PEN, USD, BOB, CLP, BRL). |
| `currency_name` | VARCHAR(50) | Currency human-readable name. |
| `is_active` | BOOLEAN | Currency is valid for new operations. |

### dim_country

| Column | Type | Description |
|---|---|---|
| `country_id` | UUID (PK) | Identifier. |
| `country_code` | CHAR(2), unique | ISO code (CO, PE, EC, BO, CL, and BR for the Olist history). |
| `country_name` | VARCHAR(80) | Country name. |
| `currency_id` | UUID (FK → dim_currency) | Official currency. |
| `is_operational` | BOOLEAN | true for the five Andean operating countries; false for Brazil's historical reference. |

### dim_geolocation

| Column | Type | Description |
|---|---|---|
| `geolocation_id` | UUID (PK) | Identifier. |
| `zip_code_prefix` | VARCHAR(15) | Postal-code prefix (indexed). |
| `latitude`, `longitude` | NUMERIC | Coordinates. |
| `city` | VARCHAR(100) | City. |
| `state` | VARCHAR(80) | State or department. |
| `country_id` | UUID (FK → dim_country) | Country. |

### dim_customer

| Column | Type | Description |
|---|---|---|
| `customer_id` | UUID (PK) | Identifier. |
| `customer_token` | VARCHAR(128), unique | Pseudonymized customer token instead of personal data. |
| `country_id` | UUID (FK → dim_country) | Country of the customer. |
| `geolocation_id` | UUID (FK → dim_geolocation, optional) | Reference location. |
| `created_at` | TIMESTAMPTZ | Record creation. |
| `is_active` | BOOLEAN | Active customer. |

Customers are pseudonymized: the generator replaces personal data for tokens, complying with the anonymization rules (RN-11).

### dim_branch

| Column | Type | Description |
|---|---|---|
| `branch_id` | UUID (PK) | Identifier. |
| `country_id` | UUID (FK → dim_country) | Country of the store. |
| `branch_name` | VARCHAR(120) | Store name. |
| `address` | VARCHAR(200) | Physical address. |
| `geolocation_id` | UUID (FK, optional) | Reference location. |
| `is_active` | BOOLEAN | Active store. |

### dim_seller

| Column | Type | Description |
|---|---|---|
| `seller_id` | UUID (PK) | Identifier. |
| `country_id` | UUID (FK → dim_country) | Country of the seller. |
| `branch_id` | UUID (FK → dim_branch, optional) | Own store the seller is attached to (serving database). |
| `seller_name` | VARCHAR(150) | Seller name (for demo groups, "Seller score group CO third_party"). |
| `external` | BOOLEAN | true for third-party sellers, false for store sellers. |
| `is_active` | BOOLEAN | Active seller. |

### dim_seller_source_key

| Column | Type | Description |
|---|---|---|
| `source_system` | VARCHAR(64) (PK part) | Source system (for example, `olist`, `marketplace`, `inventory`). |
| `source_seller_id` | VARCHAR(256) (PK part) | Natural seller identifier in that system. |
| `seller_id` | UUID (FK → dim_seller) | Canonical UUID of the seller. |

### dim_product_category / dim_product

| Table | Columns |
|---|---|
| `dim_product_category` | `category_id` (UUID PK), `category_name` (VARCHAR(100), unique) |
| `dim_product` | `product_id` (UUID PK), `sku` (VARCHAR(100), unique, indexed), `category_id` (FK), `product_name` (VARCHAR(150)), `brand` (VARCHAR(100), optional), `is_active` |

### dim_source / dim_exchange_rate

| Table | Columns |
|---|---|
| `dim_source` | `source_id` (UUID PK), `source_name` (VARCHAR(80), unique), `description` (TEXT, optional) |
| `dim_exchange_rate` | `exchange_rate_id` (UUID PK), `currency_id` (FK), `source_id` (FK), `rate_date` (DATE), `rate` (NUMERIC(18,8)), `created_at`; unique per `(currency_id, source_id, rate_date)` |

### dim_holiday / dim_holiday_type

| Table | Columns |
|---|---|
| `dim_holiday` | `holiday_id` (UUID PK), `country_id` (FK), `holiday_type_id` (FK), `holiday_date` (DATE), `holiday_name` (VARCHAR(150)); unique per `(country_id, holiday_date, holiday_name)` |
| `dim_holiday_type` | `holiday_type_id` (UUID PK), `type_name` (VARCHAR(80), unique) |

## Facts

### fact_sale

| Column | Type | Description |
|---|---|---|
| `sale_id` | UUID (PK) | Identifier. |
| `branch_id` | UUID (FK → dim_branch) | Store where the sale happened. |
| `seller_id` | UUID (FK → dim_seller) | Seller who processed the sale. |
| `customer_id` | UUID (FK → dim_customer, optional) | Customer on the sale. |
| `sale_datetime` | TIMESTAMPTZ | Sale timestamp (indexed). |
| `currency_code` | CHAR(3) | Currency of the amounts. |
| `gross_amount` | NUMERIC(14,2) | Gross amount. |
| `discount_amount` | NUMERIC(14,2), default 0 | Discount applied. |
| `tax_amount` | NUMERIC(14,2), default 0 | Tax amount. |
| `net_amount` | NUMERIC(14,2), generated | `gross_amount - discount_amount` (stored). |
| `status` | VARCHAR(30), default COMPLETED | Sale state: `COMPLETED`, `RETURNED`, `REFUNDED`, `EXCEPTION_RETURN`. |

Indexes on `sale_datetime` and `branch_id` support the daily aggregations.

### fact_sale_item

| Column | Type | Description |
|---|---|---|
| `sale_item_id` | UUID (PK) | Identifier. |
| `sale_id` | UUID (FK → fact_sale, ON DELETE CASCADE) | Parent sale. |
| `product_id` | UUID (FK → dim_product) | Product sold. |
| `quantity` | INTEGER, CHECK > 0 | Units sold. |
| `unit_price` | NUMERIC(14,2) | Unit price. |
| `discount_amount` | NUMERIC(14,2), default 0 | Line discount. |
| `total_amount` | NUMERIC(14,2), generated | `(quantity*unit_price) - discount_amount` (stored). |

## Operational and Gold serving tables (public)

| Table | Key columns | Description |
|---|---|---|
| `marketplace_events` | `event_id`, `order_id`, `event_type`, `status`, `event_timestamp`, `processed_at` | Ingested marketplace lifecycle events with processing state; late events past the 72-hour window are rejected. |
| `marketplace_seller_score_events` | `event_id` (PK), `order_id`, `event_type`, `source_seller_id`, `source_country`, `source_seller_type`, `event_ts`, `ingested_at` | Bronze landing for seller-score events. |
| `silver_seller_score_dispatch` | `dispatch_id` (PK), `source_system`, `source_seller_id`, `paid_at`, `shipped_at` | Silver input: dispatch lead times. |
| `silver_seller_score_reviews` | `review_id` (PK), `source_system`, `source_seller_id`, `review_score` (1–5), `reviewed_at` | Silver input: customer reviews. |
| `silver_seller_score_inventory` | `observation_id` (PK), `source_system`, `source_seller_id`, `inventory_accurate`, `observed_at` | Silver input: inventory audit observations. |
| `silver_seller_score_cancellations` | `order_id` (PK), `source_system`, `source_seller_id`, `cancelled`, `cancellation_reason`, `cancelled_at` | Silver input: cancellations. |
| `gold_seller_score` | `seller_id` (PK), `score`, `dispatch_pct`, `review_rating`, `inventory_accuracy`, `cancellation_rate`, `calculated_at` | Current weekly score per seller. |
| `gold_seller_score_history` | `seller_id` + `week_start` (PK), same score columns | Historical weekly score. |
| `gold_seller_status` | `seller_id` (PK), `status`, `reason`, `updated_at` | Current seller status (active, observation, suspended). |
| `gold_stockout_risk` | `store_id` + `product_id` (PK), `available_stock`, `avg_daily_sales`, `days_until_stockout`, `threshold_days` (default 3), `at_risk`, `sales_at_risk_usd`, `updated_at` | Daily batch stockout-risk rule. |
| `hot_inventory_risk` | `store_id` + `sku` (PK), `approx_qty_on_hand`, `approx_reserved`, `approx_in_transit`, `approx_available`, `approx_risk_score`, `last_event_*`, `is_reconciled` | Speed-layer stock risk updated in micro-batches. |
| `gold_promotions_audit` | `promotion_id` (PK), `sku`, `product_name`, `category_name`, `store_id`, `discount_pct`, `available_stock`, `avg_daily_sales`, `coverage_days`, `status` (`APPROVED`/`RECHAZADA`), `rejection_reason`, `projected_lost_sales_usd`, `evaluated_at` | Result of F7 promotion evaluation against inventory coverage (RN-05/RF-04). |
| `data_quality_metrics` | `metric_id` (PK), `load_id`, `source_system`, `records_processed`, `duplicates_detected`, `late_arrivals_incorporated`, `rejections_exceeded_72h`, `quality_status`, `details` (JSONB), `logged_at` | Per-load quality metrics (RN-10), indexed by `load_id`+`source_system`. |
| `customers` | `customer_id` (PK), `customer_name`, `customer_document`, `customer_email`, `updated_at` | Raw customer records consumed by the Silver anonymization view. |

## Staging tables

| Table | Content |
|---|---|
| `z1_silver.masked_customers` | Pseudonymized customer fields built before Silver export. |
| `z2_gold.daily_sales` | `order_date`, `total_orders`, `total_net_sales_usd`, `recalculated_at`. |
| `z2_gold.available_inventory` | `store_id`, `product_id`, `available_stock`, snapshot `updated_at`. |
| `z2_gold.stockout_risk` | Working copy of the stockout rule with `sales_at_risk_usd`. |
| `z2_gold.inventory_accuracy` | `seller_id`, `accuracy_pct`, `period_days`, `calculated_at`. |

## Related Documentation

- [Schemas and Database Organization](02-schemas-organization.md)
- [Gold Analytics Dictionary](05-gold-analytics-dictionary.md)
