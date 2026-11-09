---
id: dimensional-model
title: Dimensional Model
sidebar_position: 4
description: How the MercaAndes Gold analytical layer organizes dimensions and facts for the business dashboard.
---

# Dimensional Model

## 1. Model design

The Gold serving layer reproduces a star-schema design over the shared dimensions of the `public` schema:

- **Dimensions:** `dim_currency`, `dim_country`, `dim_geolocation`, `dim_customer`, `dim_branch`, `dim_seller`, `dim_product_category`, `dim_product`, `dim_source`, `dim_exchange_rate`, `dim_holiday_type`, `dim_holiday`.
- **Facts:** `fact_sale`, `fact_sale_item` (POS transactions), `fact_order`, `fact_order_item` (marketplace orders, consolidated DDL).
- **Gold business facts:** `gold_stockout_risk`, `hot_inventory_risk`, `gold_promotions_audit`, `gold_seller_score`, `gold_seller_score_history`, `gold_seller_status`, `data_quality_metrics`.
- **Analytical views:** the `silver` and `gold` schemas of the serving database.

The same conformed dimensions serve both the transactional facts and the Gold business rules, so the dashboard can slice every metric by country, store, seller, category, and date without duplicated calendars or catalogs.

## 2. Conformed dimensions

| Dimension | Role in the analytics |
|---|---|
| `dim_country` | Geographic grain of all metrics (the five operating countries plus Brazil's history). |
| `dim_branch` | Store grain for POS sales, stockout risk (store/product), and the daily sales aggregation. |
| `dim_seller` (+ status/score) | Seller grain for performance and the seller-status distribution. |
| `dim_product` + `dim_product_category` | Product and category grain for net sales, return rates, and promotion analysis. |
| `dim_geolocation` | Optional location attributes of stores and customers. |
| `dim_currency` + `dim_exchange_rate` | Convert local amounts into USD with the rate of the transaction date. |
| `dim_holiday` + `dim_holiday_type` | Flag days as holidays for the holiday impact analysis. |
| `dim_source` | Origin of exchange rates and data quality lines. |

## 3. Facts and measures

### fact_sale / fact_sale_item (POS)

Grain: one row per product line of a point-of-sale transaction. Measures: `gross_amount`, `discount_amount`, `tax_amount`, generated `net_amount`, line `total_amount`, `quantity`. The status column classifies net sales (RN-01) and returns (RN-02/RN-06).

### fact_order / fact_order_item (marketplace, consolidated DDL)

Grain: one row per marketplace order line, aligned with the seller-scoped event data that feeds the seller score.

### gold_stockout_risk (daily batch)

Grain: one row per store and product. Measures: `available_stock`, `avg_daily_sales`, `days_until_stockout`, `at_risk`, `sales_at_risk_usd`. The rule threshold is configurable through `threshold_days` (default 3) and complies with RN-04/RF-05.

### hot_inventory_risk (speed layer)

Grain: one row per store and SKU. Approximate counters (`approx_qty_on_hand`, `approx_reserved`, `approx_in_transit`, `approx_available`) and `approx_risk_score` are updated by micro-batches; `is_reconciled` marks comparisons completed against the batch results.

### gold_promotions_audit (F7)

Grain: one row per evaluated promotion. Measures: `discount_pct`, `available_stock`, `avg_daily_sales`, `coverage_days`, `status`, `projected_lost_sales_usd`. Promotions with fewer than 7 coverage days are rejected with a quantified lost-sale amount (RN-05/RF-04).

### gold_seller_score / _history / _status

Grain: one row per seller (current), plus one row per week (history). The score (0–100) merges the four components `dispatch_pct`, `review_rating`, `inventory_accuracy`, and `cancellation_rate`; `gold_seller_status` holds the derived status and its reason (RN-07/RN-08/RF-03).

### data_quality_metrics

Grain: one row per load and source system. Measures: `records_processed`, `duplicates_detected`, `late_arrivals_incorporated`, `rejections_exceeded_72h`, `quality_status` (RN-10).

## 4. S3 lake mirror

The batch DAGs export the Gold results to S3 (folder `gold/`, one CSV folder per table such as `gold/{table}/{table}.csv` plus `gold/reprocessed/`), registered for Amazon Athena. Athena queries the same grain as the relational serving tables, so lake-side exploration and the dashboard agree.

## 5. Related Documentation

- [Transactional Data Dictionary](03-transactional-data-dictionary.md)
- [Gold Analytics Dictionary](05-gold-analytics-dictionary.md)
