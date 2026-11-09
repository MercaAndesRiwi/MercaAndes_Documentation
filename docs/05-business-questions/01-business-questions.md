---
id: business-questions
title: Business Questions
sidebar_position: 1
description: The seven business questions that guide the Power BI dashboard and the Gold tables that answer them.
---
# Business Questions

The Power BI dashboard answers seven business questions. Each question links an indicator of interest with the information available in the Gold layer and its representation in the dashboard.

The official analytical source is the `gold` schema of the serving database (see the [Gold dictionary](/docs/database/gold-analytics-dictionary)); the S3 Gold exports are queryable through Athena for ad hoc analysis.

## 1. Net sales by country, channel, and category

**Question:** What is the net sales in US dollars (USD) by country, channel, and category, with daily, weekly, and monthly breakdowns?

**Gold source:** `gold.vw_sales_consolidated` (RN-01), built from the `fact_sale`/`fact_sale_item` tables of the five country schemas.

**Dashboard:** sales measure converted to USD with the transaction-date exchange rate, sliced by country, channel, category, and the day/week/month grains provided by `order_date`, `week_start_date`, and `month_start_date`.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 1 (venta neta USD por paÃ­s, canal y categorÃ­a). */}

## 2. Stockout inventory risk

**Question:** Which product references (SKUs) and stores are at risk of stockout, and what is the value of the sales at risk?

**Gold source:** `gold_stockout_risk` (daily batch rule, RN-04/RF-05) with the real-time complement `hot_inventory_risk`; the dashboard reads `gold.vw_stockout_risk_monitoring`.

**Dashboard:** SKU/store pairs flagged with `at_risk`, classified by severity (`CRITICAL` â‰¤ 1 day, `HIGH` â‰¤ 3 days, `MEDIUM`), with the `sales_at_risk_usd` value at risk.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 2 (riesgo de quiebre por SKU y tienda). */}

## 3. Promotions rejected due to lack of inventory

**Question:** Which promotions were rejected due to lack of inventory, and how much would have been sold?

**Gold source:** `gold_promotions_audit`, evaluated by the F7 weekly promotions flow (RN-05/RF-04); the dashboard reads `gold.vw_promotions_analysis`.

**Dashboard:** rejected promotions (`is_rejected`), the rejection reason, the `coverage_days` pending stock, and the `projected_lost_sales_usd` estimate.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 3 (promociones rechazadas y venta perdida). */}

## 4. External seller distribution and performance

**Question:** How are external sellers distributed by status, and how does their performance score evolve?

**Gold source:** `gold_seller_score`, `gold_seller_score_history`, and `gold_seller_status` written by the weekly Spark job (RN-07/RN-08/RF-03); the dashboard reads `gold.vw_seller_performance`.

**Dashboard:** seller distribution by status (`active`, observation, suspended) and type (own versus third-party), score evolution by week, and the performance tier (`High Performer`, `Standard`, `Under Observation`, `Suspended / Action Required`).

{/* IMAGEN-AQUI: visual del tablero para la pregunta 4 (distribuciÃ³n y evoluciÃ³n del puntaje de sellers). */}

## 5. Return rate

**Question:** What is the return rate per category, and what percentage of returns falls outside the established window?

**Gold source:** derived from `gold.vw_sales_consolidated` statuses (RN-02/RN-06); the dashboard reads `gold.vw_returns_audit`.

**Dashboard:** return rate per country and category (`return_rate_pct`), returns inside 30 days, returns outside 30 days (`returns_outside_30_days`), and `pct_returns_outside_30_days`.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 5 (tasa de devoluciones por categorÃ­a y % fuera del plazo). */}

## 6. Holiday impact on sales

**Question:** How do holidays affect sales in each country?

**Gold source:** joins the consolidated sales with the `dim_holiday` calendar of the five countries; the dashboard reads `gold.vw_holiday_sales_impact`.

**Dashboard:** holiday versus regular days per country, with daily net sales (`daily_net_sales_usd`), order counts, and average ticket.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 6 (impacto de dÃ­as festivos en ventas por paÃ­s). */}

## 7. Data quality per source

**Question:** What is the data quality per source, considering duplicates, late records, and rejected records?

**Gold source:** `data_quality_metrics` per load and source (RN-10); the dashboard reads `gold.vw_data_quality_dashboard`.

**Dashboard:** duplicate, late-arrival, and 72-hour-rejection rates per source system, plus the `quality_status` of each load and the metric details JSON.


The processing rules behind each view are described in the [Gold dictionary](/docs/database/gold-analytics-dictionary) and in [Run Data Processing](/docs/installation-deployment/run-data-processing).
