---
title: Diccionario Gold
sidebar_position: 5
description: Diccionario a nivel de columnas de las vistas Silver y de las vistas Gold oficiales de Power BI.
---

# Diccionario Gold

Los archivos `postgres/ddl/04-gold-powerbi-views.sql` (y la copia sincronizada en `aws/sql`) definen las vistas curadas que consume el tablero. Cada vista se define con `CREATE OR REPLACE ...` para que los DAGs puedan refrescarla en cada ejecución, y el esquema `public` expone los alias `vw_gold_*` por retrocompatibilidad.

## Vistas del esquema silver

| Vista | Tabla fuente | Columnas |
|---|---|---|
| `silver.vw_customers_anonymized` | `public.customers` (RN-11) | `customer_id`, `customer_name_hash`, `customer_document_hash`, `customer_email_masked`, `updated_at` |
| `silver.vw_seller_dispatch` | `silver_seller_score_dispatch` | `dispatch_id`, `source_system`, `source_seller_id`, `paid_at`, `shipped_at`, `dispatch_lead_time_hours` (shipped − paid, en horas) |
| `silver.vw_seller_reviews` | `silver_seller_score_reviews` | `review_id`, `source_system`, `source_seller_id`, `review_score` (1–5), `reviewed_at` |
| `silver.vw_seller_inventory` | `silver_seller_score_inventory` | `observation_id`, `source_system`, `source_seller_id`, `inventory_accurate`, `observed_at` |
| `silver.vw_seller_cancellations` | `silver_seller_score_cancellations` | `order_id`, `source_system`, `source_seller_id`, `cancelled`, `cancellation_reason`, `cancelled_at` |
| `silver.vw_marketplace_events` | `marketplace_events` | `id`, `event_id`, `order_id`, `event_type`, `status`, `event_timestamp`, `processed_at`; excluye las filas con `status='exception_exceeded_72h'` (RN-10) |

## Vistas Gold (las siete preguntas de Power BI)

### 1. gold.vw_sales_consolidated — venta neta (RN-01)

Une `fact_sale`/`fact_sale_item` de los cinco esquemas de país, etiqueta cada fila con país, canal (`POS`), tienda, vendedor, producto, SKU y categoría, convierte los montos a USD con la tasa de la fecha de la venta y deriva los granos diario/semanal/mensual para desgloses de periodo.

Columnas clave: `sale_id`, `sale_datetime`, `order_date`, `week_start_date`, `month_start_date`, `sale_year`, `country_name`, `country_code`, `channel`, `store_id`/`store_name`, `seller_id`/`seller_name`, `product_id`/`sku`/`product_name`/`category_name`, `quantity`, `unit_price`, `currency_code`, `exchange_rate_to_usd`, `gross_amount_usd`, `discount_amount_usd`, `net_sales_usd`, `status`.

Cuando la tabla de tasas de cambio no tiene la tasa de una fecha, la vista aplica un respaldo documentado por moneda (USD 1.00, COP 0.00024, PEN 0.27, BOB 0.144, CLP 0.00105, BRL 0.18), de modo que las medidas del tablero se mantienen continuas.

### 2. gold.vw_stockout_risk_monitoring — riesgo de quiebre (RN-04/RF-05)

Enriquece `gold_stockout_risk` con los atributos de tienda, país, producto y categoría, y clasifica la severidad: `CRITICAL` (≤ 1 día), `HIGH` (≤ 3 días), `MEDIUM` (más días).

Columnas clave: `store_id`, `store_name`, `country_code`/`country_name`, `product_id`, `sku`, `product_name`, `category_name`, `available_stock`, `avg_daily_sales`, `days_until_stockout`, `threshold_days`, `at_risk`, `sales_at_risk_usd`, `risk_severity`, `updated_at`.

### 3. gold.vw_promotions_analysis — promociones rechazadas (RN-05/RF-04)

Lee `gold_promotions_audit` y expone las variables de la evaluación: `is_rejected` (estado `RECHAZADA`), `rejection_reason`, `coverage_days` y `projected_lost_sales_usd` como la venta perdida cuantificada.

Columnas clave: `promotion_id`, `sku`, `product_name`, `category_name`, `store_id`, `discount_pct`, `available_stock`, `avg_daily_sales`, `coverage_days`, `status`, `is_rejected`, `rejection_reason`, `projected_lost_sales_usd`, `evaluated_at`, `evaluation_date`.

### 4. gold.vw_seller_performance — distribución y evolución de sellers (RN-07/RN-08/RF-03)

Cruza `dim_seller` con país, estado vigente (`gold_seller_status`), puntaje vigente (`gold_seller_score`) e histórico semanal (`gold_seller_score_history`), y clasifica a los sellers en niveles: `High Performer` (≥ 80), `Standard` (≥ 60), `Under Observation` (≥ 40), `Suspended / Action Required` (por debajo de 40).

Columnas clave: `seller_id`, `seller_name`, `country_code`/`country_name`, `seller_type` (`Own`/`Third-Party`), `current_status`, `status_reason`, `current_score`, `dispatch_pct`, `review_rating`, `inventory_accuracy`, `cancellation_rate`, `week_start`, `historical_score`, `performance_tier`, `status_updated_at`.

### 5. gold.vw_returns_audit — tasa de devoluciones (RN-02/RN-06)

Agrega la vista de ventas consolidadas por país y categoría: total de artículos vendidos, artículos devueltos (`RETURNED`, `REFUNDED`, `EXCEPTION_RETURN`), devoluciones dentro de la ventana de 30 días, devoluciones fuera de la ventana (`EXCEPTION_RETURN` o devoluciones tardías marcadas), con el porcentaje de tasa de devolución.

Columnas clave: `country_code`, `category_name`, `total_items_sold`, `total_items_returned`, `return_rate_pct`, `returns_within_30_days`, `returns_outside_30_days`, `pct_returns_outside_30_days`.

### 6. gold.vw_holiday_sales_impact — impacto de festivos

Cruza las ventas consolidadas diarias con el calendario de festivos por país y fecha, marcando `is_holiday` con el nombre del festivo (o `Día Regular`).

Columnas clave: `country_code`, `country_name`, `order_date`, `sale_year`, `is_holiday`, `holiday_name`, `total_orders`, `daily_net_sales_usd`, `avg_ticket_usd`.

### 7. gold.vw_data_quality_dashboard — calidad de datos por fuente (RN-10)

Lee `data_quality_metrics` y deriva las tasas por fuente: duplicados, llegadas tardías incorporadas y rechazos por encima de 72 horas, con el JSON de detalles de la carga.

Columnas clave: `metric_id`, `load_id`, `source_system`, `records_processed`, `duplicates_detected`, `duplicate_rate_pct`, `late_arrivals_incorporated`, `late_arrival_rate_pct`, `rejections_exceeded_72h`, `rejection_rate_pct`, `quality_status`, `details`, `logged_at`, `metric_date`.

## De dónde viene cada dato

- `gold.vw_sales_consolidated` → esquemas de país `fact_sale`/`fact_sale_item` + dimensiones compartidas + tasas.
- `gold.vw_stockout_risk_monitoring` → salida del DAG `silver_to_gold_business_rules` (`gold_stockout_risk`).
- `gold.vw_promotions_analysis` → salida DAL del flujo `f7_promotions_weekly` (`gold_promotions_audit`).
- `gold.vw_seller_performance` → salidas del job Spark `seller_scoring` (`gold_seller_score`, `_history`, `_status`).
- `gold.vw_returns_audit` y `gold.vw_holiday_sales_impact` → derivadas sobre la vista consolidada más `dim_holiday`.
- `gold.vw_data_quality_dashboard` → métricas por carga escritas por los pipelines de depuración e ingestión.

## Consumo

Power BI se conecta a estas vistas en la base de datos de servicio; Metabase y Athena (sobre las exportaciones Gold a S3) reutilizan el mismo grano. Las consultas de ejemplo y el uso del tablero están descritos en [Preguntas de negocio](/docs/business-questions/business-questions).
