---
title: Diccionario de datos transaccional
sidebar_position: 3
description: Diccionario a nivel de columnas de las dimensiones y hechos compartidos de la base de datos de servicio de MercaAndes.
---

# Diccionario de datos transaccional

Las tablas siguientes documentan las entidades compartidas del esquema `public`. Las claves primarias UUID las genera el servidor, las marcas `created_at`/`updated_at` usan por defecto `NOW()` y las claves foráneas imponen la integridad referencial declarada en `postgres/ddl/01_consolidated_mer_gold_schema.sql` y en las migraciones Alembic de `Transactional-POS-database`.

## Dimensiones

### dim_currency

| Columna | Tipo | Descripción |
|---|---|---|
| `currency_id` | UUID (PK) | Identificador. |
| `currency_code` | CHAR(3), único | Código ISO (COP, PEN, USD, BOB, CLP, BRL). |
| `currency_name` | VARCHAR(50) | Nombre legible de la moneda. |
| `is_active` | BOOLEAN | La moneda es válida para nuevas operaciones. |

### dim_country

| Columna | Tipo | Descripción |
|---|---|---|
| `country_id` | UUID (PK) | Identificador. |
| `country_code` | CHAR(2), único | Código ISO (CO, PE, EC, BO, CL, y BR para el histórico de Olist). |
| `country_name` | VARCHAR(80) | Nombre del país. |
| `currency_id` | UUID (FK → dim_currency) | Moneda oficial. |
| `is_operational` | BOOLEAN | true para los cinco países operativos andinos; false para la referencia histórica de Brasil. |

### dim_geolocation

| Columna | Tipo | Descripción |
|---|---|---|
| `geolocation_id` | UUID (PK) | Identificador. |
| `zip_code_prefix` | VARCHAR(15) | Prefijo postal (indexado). |
| `latitude`, `longitude` | NUMERIC | Coordenadas. |
| `city` | VARCHAR(100) | Ciudad. |
| `state` | VARCHAR(80) | Estado o departamento. |
| `country_id` | UUID (FK → dim_country) | País. |

### dim_customer

| Columna | Tipo | Descripción |
|---|---|---|
| `customer_id` | UUID (PK) | Identificador. |
| `customer_token` | VARCHAR(128), único | Token seudonimizado del cliente en lugar de datos personales. |
| `country_id` | UUID (FK → dim_country) | País del cliente. |
| `geolocation_id` | UUID (FK → dim_geolocation, opcional) | Ubicación de referencia. |
| `created_at` | TIMESTAMPTZ | Creación del registro. |
| `is_active` | BOOLEAN | Cliente activo. |

Los clientes se seudonimizan: el generador reemplaza los datos personales por tokens, cumpliendo las reglas de anonimización (RN-11).

### dim_branch

| Columna | Tipo | Descripción |
|---|---|---|
| `branch_id` | UUID (PK) | Identificador. |
| `country_id` | UUID (FK → dim_country) | País de la tienda. |
| `branch_name` | VARCHAR(120) | Nombre de la tienda. |
| `address` | VARCHAR(200) | Dirección física. |
| `geolocation_id` | UUID (FK, opcional) | Ubicación de referencia. |
| `is_active` | BOOLEAN | Tienda activa. |

### dim_seller

| Columna | Tipo | Descripción |
|---|---|---|
| `seller_id` | UUID (PK) | Identificador. |
| `country_id` | UUID (FK → dim_country) | País del vendedor. |
| `branch_id` | UUID (FK → dim_branch, opcional) | Tienda propia a la que está adscrito el vendedor (base de datos de servicio). |
| `seller_name` | VARCHAR(150) | Nombre del vendedor (para los grupos de demo, "Seller score group CO third_party"). |
| `external` | BOOLEAN | true para vendedores terceros, false para vendedores de tienda. |
| `is_active` | BOOLEAN | Vendedor activo. |

### dim_seller_source_key

| Columna | Tipo | Descripción |
|---|---|---|
| `source_system` | VARCHAR(64) (parte de la PK) | Sistema de origen (por ejemplo, `olist`, `marketplace`, `inventory`). |
| `source_seller_id` | VARCHAR(256) (parte de la PK) | Identificador natural del vendedor en ese sistema. |
| `seller_id` | UUID (FK → dim_seller) | UUID canónico del vendedor. |

### dim_product_category / dim_product

| Tabla | Columnas |
|---|---|
| `dim_product_category` | `category_id` (UUID PK), `category_name` (VARCHAR(100), único) |
| `dim_product` | `product_id` (UUID PK), `sku` (VARCHAR(100), único, indexado), `category_id` (FK), `product_name` (VARCHAR(150)), `brand` (VARCHAR(100), opcional), `is_active` |

### dim_source / dim_exchange_rate

| Tabla | Columnas |
|---|---|
| `dim_source` | `source_id` (UUID PK), `source_name` (VARCHAR(80), único), `description` (TEXT, opcional) |
| `dim_exchange_rate` | `exchange_rate_id` (UUID PK), `currency_id` (FK), `source_id` (FK), `rate_date` (DATE), `rate` (NUMERIC(18,8)), `created_at`; único por `(currency_id, source_id, rate_date)` |

### dim_holiday / dim_holiday_type

| Tabla | Columnas |
|---|---|
| `dim_holiday` | `holiday_id` (UUID PK), `country_id` (FK), `holiday_type_id` (FK), `holiday_date` (DATE), `holiday_name` (VARCHAR(150)); único por `(country_id, holiday_date, holiday_name)` |
| `dim_holiday_type` | `holiday_type_id` (UUID PK), `type_name` (VARCHAR(80), único) |

## Hechos

### fact_sale

| Columna | Tipo | Descripción |
|---|---|---|
| `sale_id` | UUID (PK) | Identificador. |
| `branch_id` | UUID (FK → dim_branch) | Tienda donde ocurrió la venta. |
| `seller_id` | UUID (FK → dim_seller) | Vendedor que procesó la venta. |
| `customer_id` | UUID (FK → dim_customer, opcional) | Cliente de la venta. |
| `sale_datetime` | TIMESTAMPTZ | Marca de tiempo de la venta (indexado). |
| `currency_code` | CHAR(3) | Moneda de los montos. |
| `gross_amount` | NUMERIC(14,2) | Monto bruto. |
| `discount_amount` | NUMERIC(14,2), por defecto 0 | Descuento aplicado. |
| `tax_amount` | NUMERIC(14,2), por defecto 0 | Monto de impuestos. |
| `net_amount` | NUMERIC(14,2), generada | `gross_amount - discount_amount` (almacenada). |
| `status` | VARCHAR(30), por defecto COMPLETED | Estado de la venta: `COMPLETED`, `RETURNED`, `REFUNDED`, `EXCEPTION_RETURN`. |

Los índices sobre `sale_datetime` y `branch_id` soportan las agregaciones diarias.

### fact_sale_item

| Columna | Tipo | Descripción |
|---|---|---|
| `sale_item_id` | UUID (PK) | Identificador. |
| `sale_id` | UUID (FK → fact_sale, ON DELETE CASCADE) | Venta padre. |
| `product_id` | UUID (FK → dim_product) | Producto vendido. |
| `quantity` | INTEGER, CHECK > 0 | Unidades vendidas. |
| `unit_price` | NUMERIC(14,2) | Precio unitario. |
| `discount_amount` | NUMERIC(14,2), por defecto 0 | Descuento de la línea. |
| `total_amount` | NUMERIC(14,2), generada | `(quantity*unit_price) - discount_amount` (almacenada). |

## Tablas operativas y de servicio Gold (public)

| Tabla | Columnas clave | Descripción |
|---|---|---|
| `marketplace_events` | `event_id`, `order_id`, `event_type`, `status`, `event_timestamp`, `processed_at` | Eventos del ciclo de vida del marketplace ingresados con estado de procesamiento; los eventos tardíos que superan la ventana de 72 horas se rechazan. |
| `marketplace_seller_score_events` | `event_id` (PK), `order_id`, `event_type`, `source_seller_id`, `source_country`, `source_seller_type`, `event_ts`, `ingested_at` | Aterrizaje bronce para los eventos de puntaje de sellers. |
| `silver_seller_score_dispatch` | `dispatch_id` (PK), `source_system`, `source_seller_id`, `paid_at`, `shipped_at` | Entrada Silver: tiempos de despacho. |
| `silver_seller_score_reviews` | `review_id` (PK), `source_system`, `source_seller_id`, `review_score` (1–5), `reviewed_at` | Entrada Silver: reseñas de clientes. |
| `silver_seller_score_inventory` | `observation_id` (PK), `source_system`, `source_seller_id`, `inventory_accurate`, `observed_at` | Entrada Silver: observaciones de auditoría de inventario. |
| `silver_seller_score_cancellations` | `order_id` (PK), `source_system`, `source_seller_id`, `cancelled`, `cancellation_reason`, `cancelled_at` | Entrada Silver: cancelaciones. |
| `gold_seller_score` | `seller_id` (PK), `score`, `dispatch_pct`, `review_rating`, `inventory_accuracy`, `cancellation_rate`, `calculated_at` | Puntaje semanal vigente por seller. |
| `gold_seller_score_history` | `seller_id` + `week_start` (PK), mismas columnas de puntaje | Puntaje semanal histórico. |
| `gold_seller_status` | `seller_id` (PK), `status`, `reason`, `updated_at` | Estado vigente del seller (activo, observación, suspendido). |
| `gold_stockout_risk` | `store_id` + `product_id` (PK), `available_stock`, `avg_daily_sales`, `days_until_stockout`, `threshold_days` (por defecto 3), `at_risk`, `sales_at_risk_usd`, `updated_at` | Regla batch diaria de riesgo de quiebre. |
| `hot_inventory_risk` | `store_id` + `sku` (PK), `approx_qty_on_hand`, `approx_reserved`, `approx_in_transit`, `approx_available`, `approx_risk_score`, `last_event_*`, `is_reconciled` | Riesgo de stock de la capa de velocidad, actualizado en micro-lotes. |
| `gold_promotions_audit` | `promotion_id` (PK), `sku`, `product_name`, `category_name`, `store_id`, `discount_pct`, `available_stock`, `avg_daily_sales`, `coverage_days`, `status` (`APPROVED`/`RECHAZADA`), `rejection_reason`, `projected_lost_sales_usd`, `evaluated_at` | Resultado de la evaluación F7 de promociones contra la cobertura de inventario (RN-05/RF-04). |
| `data_quality_metrics` | `metric_id` (PK), `load_id`, `source_system`, `records_processed`, `duplicates_detected`, `late_arrivals_incorporated`, `rejections_exceeded_72h`, `quality_status`, `details` (JSONB), `logged_at` | Métricas de calidad por carga (RN-10), indexadas por `load_id`+`source_system`. |
| `customers` | `customer_id` (PK), `customer_name`, `customer_document`, `customer_email`, `updated_at` | Registros crudos de clientes consumidos por la vista de anonimización de Silver. |

## Tablas de staging

| Tabla | Contenido |
|---|---|
| `z1_silver.masked_customers` | Campos seudonimizados de clientes construidos antes de la exportación Silver. |
| `z2_gold.daily_sales` | `order_date`, `total_orders`, `total_net_sales_usd`, `recalculated_at`. |
| `z2_gold.available_inventory` | `store_id`, `product_id`, `available_stock`, instantánea `updated_at`. |
| `z2_gold.stockout_risk` | Copia de trabajo de la regla de quiebre con `sales_at_risk_usd`. |
| `z2_gold.inventory_accuracy` | `seller_id`, `accuracy_pct`, `period_days`, `calculated_at`. |

## Documentación relacionada

- [Esquemas y organización de la base de datos](02-schemas-organization.md)
- [Diccionario Gold](05-gold-analytics-dictionary.md)
