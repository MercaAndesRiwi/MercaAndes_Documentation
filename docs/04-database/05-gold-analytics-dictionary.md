---
id: gold-analytics-dictionary
title: Gold Analytics Dictionary
sidebar_position: 5
description: Column-level dictionary of the Silver views and the official Power BI Gold views.
---

# Gold Analytics Dictionary

The files `postgres/ddl/04-gold-powerbi-views.sql` (and the `aws/sql` sync copy) define the curated views the dashboard consumes. Every view is defined with `CREATE OR REPLACE ...` so the DAGs can refresh them on each run, and the `public` schema exposes `vw_gold_*` aliases for backward compatibility.

## Silver schema views

| View | Source table | Columns |
|---|---|---|
| `silver.vw_customers_anonymized` | `public.customers` (RN-11) | `customer_id`, `customer_name_hash`, `customer_document_hash`, `customer_email_masked`, `updated_at` |
| `silver.vw_seller_dispatch` | `silver_seller_score_dispatch` | `dispatch_id`, `source_system`, `source_seller_id`, `paid_at`, `shipped_at`, `dispatch_lead_time_hours` (shipped âˆ’ paid, in hours) |
| `silver.vw_seller_reviews` | `silver_seller_score_reviews` | `review_id`, `source_system`, `source_seller_id`, `review_score` (1â€“5), `reviewed_at` |
| `silver.vw_seller_inventory` | `silver_seller_score_inventory` | `observation_id`, `source_system`, `source_seller_id`, `inventory_accurate`, `observed_at` |
| `silver.vw_seller_cancellations` | `silver_seller_score_cancellations` | `order_id`, `source_system`, `source_seller_id`, `cancelled`, `cancellation_reason`, `cancelled_at` |
| `silver.vw_marketplace_events` | `marketplace_events` | `id`, `event_id`, `order_id`, `event_type`, `status`, `event_timestamp`, `processed_at`; excludes rows with `status='exception_exceeded_72h'` (RN-10) |

## Gold views (the seven Power BI questions)

### 1. gold.vw_sales_consolidated â€” net sales (RN-01)

Unions `fact_sale`/`fact_sale_item` of the five country schemas, labels each row with country, channel (`POS`), store, seller, product, SKU, and category, converts amounts to USD with the rate of the sale date, and derives daily/weekly/monthly grains for period breakdowns.

Key columns: `sale_id`, `sale_datetime`, `order_date`, `week_start_date`, `month_start_date`, `sale_year`, `country_name`, `country_code`, `channel`, `store_id`/`store_name`, `seller_id`/`seller_name`, `product_id`/`sku`/`product_name`/`category_name`, `quantity`, `unit_price`, `currency_code`, `exchange_rate_to_usd`, `gross_amount_usd`, `discount_amount_usd`, `net_sales_usd`, `status`.

When the exchange-rate table lacks a date's rate, the view applies a documented fallback per currency (USD 1.00, COP 0.00024, PEN 0.27, BOB 0.144, CLP 0.00105, BRL 0.18), so the dashboard measures stay continuous.

### 2. gold.vw_stockout_risk_monitoring â€” stockout risk (RN-04/RF-05)

Enriches `gold_stockout_risk` with store, country, product, and category attributes and classifies severity: `CRITICAL` (â‰¤ 1 day), `HIGH` (â‰¤ 3 days), `MEDIUM` (more days).

Key columns: `store_id`, `store_name`, `country_code`/`country_name`, `product_id`, `sku`, `product_name`, `category_name`, `available_stock`, `avg_daily_sales`, `days_until_stockout`, `threshold_days`, `at_risk`, `sales_at_risk_usd`, `risk_severity`, `updated_at`.

### 3. gold.vw_promotions_analysis â€” rejected promotions (RN-05/RF-04)

Reads `gold_promotions_audit` and exposes the evaluation vars: `is_rejected` (status `RECHAZADA`), `rejection_reason`, `coverage_days`, and `projected_lost_sales_usd` as the quantified lost sale.

Key columns: `promotion_id`, `sku`, `product_name`, `category_name`, `store_id`, `discount_pct`, `available_stock`, `avg_daily_sales`, `coverage_days`, `status`, `is_rejected`, `rejection_reason`, `projected_lost_sales_usd`, `evaluated_at`, `evaluation_date`.

### 4. gold.vw_seller_performance â€” seller distribution and evolution (RN-07/RN-08/RF-03)

Joins `dim_seller` with country, current status (`gold_seller_status`), current score (`gold_seller_score`), and weekly history (`gold_seller_score_history`), and classifies sellers into tiers: `High Performer` (â‰¥ 80), `Standard` (â‰¥ 60), `Under Observation` (â‰¥ 40), `Suspended / Action Required` (below 40).

Key columns: `seller_id`, `seller_name`, `country_code`/`country_name`, `seller_type` (`Own`/`Third-Party`), `current_status`, `status_reason`, `current_score`, `dispatch_pct`, `review_rating`, `inventory_accuracy`, `cancellation_rate`, `week_start`, `historical_score`, `performance_tier`, `status_updated_at`.

### 5. gold.vw_returns_audit â€” return rate (RN-02/RN-06)

Aggregates the consolidated sales view per country and category: total sold items, returned items (`RETURNED`, `REFUNDED`, `EXCEPTION_RETURN`), returns inside the 30-day window, returns outside the window (`EXCEPTION_RETURN` or late returns flagged), with the return rate percentage.

Key columns: `country_code`, `category_name`, `total_items_sold`, `total_items_returned`, `return_rate_pct`, `returns_within_30_days`, `returns_outside_30_days`, `pct_returns_outside_30_days`.

### 6. gold.vw_holiday_sales_impact â€” holiday impact

Joins daily consolidated sales with the holiday calendar per country and date, flagging `is_holiday` with the holiday name (or `DÃ­a Regular`).

Key columns: `country_code`, `country_name`, `order_date`, `sale_year`, `is_holiday`, `holiday_name`, `total_orders`, `daily_net_sales_usd`, `avg_ticket_usd`.

### 7. gold.vw_data_quality_dashboard â€” data quality per source (RN-10)

Reads `data_quality_metrics` and derives the per-source rates: duplicates, late arrivals incorporated, and rejections over 72 hours, with the load details JSON.

Key columns: `metric_id`, `load_id`, `source_system`, `records_processed`, `duplicates_detected`, `duplicate_rate_pct`, `late_arrivals_incorporated`, `late_arrival_rate_pct`, `rejections_exceeded_72h`, `rejection_rate_pct`, `quality_status`, `details`, `logged_at`, `metric_date`.

## Where the data comes from

- `gold.vw_sales_consolidated` â†’ country schemas `fact_sale`/`fact_sale_item` + shared dimensions + rates.
- `gold.vw_stockout_risk_monitoring` â†’ `silver_to_gold_business_rules` DAG output (`gold_stockout_risk`).
- `gold.vw_promotions_analysis` â†’ `f7_promotions_weekly` DAL output (`gold_promotions_audit`).
- `gold.vw_seller_performance` â†’ `seller_scoring` Spark job outputs (`gold_seller_score`, `_history`, `_status`).
- `gold.vw_returns_audit` and `gold.vw_holiday_sales_impact` â†’ derived on top of the consolidated view plus `dim_holiday`.
- `gold.vw_data_quality_dashboard` â†’ per-load metrics written by the cleaning and ingestion pipelines.

## Consumption

Power BI connects to these views in the serving database; Metabase and Athena (over the S3 Gold exports) reuse the same grain. Sample queries and dashboard usage are described in [Business Questions](/docs/business-questions/business-questions).
