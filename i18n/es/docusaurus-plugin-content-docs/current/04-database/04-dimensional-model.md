---
title: Modelo dimensional
sidebar_position: 4
description: Cómo la capa analítica Gold de MercaAndes organiza dimensiones y hechos para el tablero de negocio.
---

# Modelo dimensional

## 1. Diseño del modelo

La capa de servicio Gold reproduce un diseño de esquema estrella sobre las dimensiones compartidas del esquema `public`:

- **Dimensiones:** `dim_currency`, `dim_country`, `dim_geolocation`, `dim_customer`, `dim_branch`, `dim_seller`, `dim_product_category`, `dim_product`, `dim_source`, `dim_exchange_rate`, `dim_holiday_type`, `dim_holiday`.
- **Hechos:** `fact_sale`, `fact_sale_item` (transacciones POS), `fact_order`, `fact_order_item` (pedidos de marketplace, DDL consolidado).
- **Hechos de negocio Gold:** `gold_stockout_risk`, `hot_inventory_risk`, `gold_promotions_audit`, `gold_seller_score`, `gold_seller_score_history`, `gold_seller_status`, `data_quality_metrics`.
- **Vistas analíticas:** los esquemas `silver` y `gold` de la base de datos de servicio.

Las mismas dimensiones conformadas sirven tanto a los hechos transaccionales como a las reglas de negocio Gold, de modo que el tablero puede segmentar cada métrica por país, tienda, vendedor, categoría y fecha sin calendarios ni catálogos duplicados.

## 2. Dimensiones conformadas

| Dimensión | Rol en la analítica |
|---|---|
| `dim_country` | Grano geográfico de todas las métricas (los cinco países operativos más el histórico de Brasil). |
| `dim_branch` | Grano de tienda para ventas POS, riesgo de quiebre (tienda/producto) y la agregación de ventas diarias. |
| `dim_seller` (+ estado/puntaje) | Grano de vendedor para el desempeño y la distribución de estados de sellers. |
| `dim_product` + `dim_product_category` | Grano de producto y categoría para venta neta, tasas de devolución y análisis de promociones. |
| `dim_geolocation` | Atributos opcionales de ubicación de tiendas y clientes. |
| `dim_currency` + `dim_exchange_rate` | Conversión de montos locales a USD con la tasa de la fecha de la transacción. |
| `dim_holiday` + `dim_holiday_type` | Marca los días como festivos para el análisis de impacto de festivos. |
| `dim_source` | Origen de las tasas de cambio y de las líneas de calidad de datos. |

## 3. Hechos y medidas

### fact_sale / fact_sale_item (POS)

Grano: una fila por línea de producto de una transacción de punto de venta. Medidas: `gross_amount`, `discount_amount`, `tax_amount`, `net_amount` generada, `total_amount` de la línea, `quantity`. La columna de estado clasifica la venta neta (RN-01) y las devoluciones (RN-02/RN-06).

### fact_order / fact_order_item (marketplace, DDL consolidado)

Grano: una fila por línea de pedido del marketplace, alineada con los datos de eventos por vendedor que alimentan el puntaje de sellers.

### gold_stockout_risk (batch diaria)

Grano: una fila por tienda y producto. Medidas: `available_stock`, `avg_daily_sales`, `days_until_stockout`, `at_risk`, `sales_at_risk_usd`. El umbral de la regla es configurable mediante `threshold_days` (por defecto 3) y cumple RN-04/RF-05.

### hot_inventory_risk (capa de velocidad)

Grano: una fila por tienda y SKU. Los contadores aproximados (`approx_qty_on_hand`, `approx_reserved`, `approx_in_transit`, `approx_available`) y `approx_risk_score` se actualizan en micro-lotes; `is_reconciled` marca las comparaciones completadas contra los resultados batch.

### gold_promotions_audit (F7)

Grano: una fila por promoción evaluada. Medidas: `discount_pct`, `available_stock`, `avg_daily_sales`, `coverage_days`, `status`, `projected_lost_sales_usd`. Las promociones con menos de 7 días de cobertura se rechazan con una venta perdida cuantificada (RN-05/RF-04).

### gold_seller_score / _history / _status

Grano: una fila por seller (vigente) más una fila por semana (histórico). El puntaje (0–100) combina los cuatro componentes `dispatch_pct`, `review_rating`, `inventory_accuracy` y `cancellation_rate`; `gold_seller_status` guarda el estado derivado y su motivo (RN-07/RN-08/RF-03).

### data_quality_metrics

Grano: una fila por carga y sistema de origen. Medidas: `records_processed`, `duplicates_detected`, `late_arrivals_incorporated`, `rejections_exceeded_72h`, `quality_status` (RN-10).

## 4. Espejo en el lago S3

Los DAGs batch exportan los resultados Gold a S3 (carpeta `gold/`, una carpeta CSV por tabla, por ejemplo `gold/{table}/{table}.csv` más `gold/reprocessed/`), registrados para Amazon Athena. Athena consulta el mismo grano que las tablas de servicio relacionales, de modo que la exploración desde el lago y el tablero concuerdan.

## 5. Documentación relacionada

- [Diccionario de datos transaccional](03-transactional-data-dictionary.md)
- [Diccionario Gold](05-gold-analytics-dictionary.md)
