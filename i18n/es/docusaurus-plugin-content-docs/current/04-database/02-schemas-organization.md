---
title: Esquemas y organización de la base de datos
sidebar_position: 2
description: Cómo la capa de servicio PostgreSQL de MercaAndes organiza los esquemas transaccionales, de staging, Silver y Gold.
---

# Esquemas y organización de la base de datos

## 1. Resumen

MercaAndes organiza su capa de servicio PostgreSQL 16 en esquemas que separan los datos transaccionales por país, las tablas operativas compartidas, las áreas de staging de los pipelines de procesamiento y las capas analíticas Silver/Gold que consume Power BI.

Los esquemas viven en la instancia RDS `mercaandes-postgres-gold`, base de datos `merca_pos`, y reproducen la misma organización en el servicio local `postgres` de Compose.

## 2. Mapa de esquemas

| Esquema | Contenido |
|---|---|
| `public` | Tablas de soporte de los esquemas operativos por país: dimensiones compartidas (`dim_*`), hechos compartidos (`fact_*`), tablas operativas (`marketplace_events`, `gold_*`, `hot_inventory_risk`, `data_quality_metrics`) y alias retrocompatibles de vistas (`vw_gold_*`), además del léxico transaccional de catálogos. |
| `colombia`, `peru`, `ecuador`, `bolivia`, `chile` | Datos transaccionales POS por país: `fact_sale` y `fact_sale_item`. |
| `z1_silver` | Área de staging del linaje bronce-a-plata: datos de clientes depurados y seudonimizados antes de la escritura lineal a Silver. |
| `z2_gold` | Esquemas de trabajo de las reglas de los DAGs; `available_inventory`, `stockout_risk`, `inventory_accuracy` y `daily_sales`. |
| `silver` | Vistas curadas para auditoría y entradas del puntaje de sellers. |
| `gold` | Vistas oficiales de Power BI (las siete preguntas de negocio). |

Los esquemas `colombia`–`chile` se generan desde el DDL o Alembic y se llenan con la siembra POS (imagen `pos-database`), mientras que `z1_silver`, `z2_gold`, `silver` y `gold` los crean los DAGs y los scripts DDL de `postgres/ddl`.

## 3. Esquemas transaccionales por país

Cada país operativo mantiene su propio `fact_sale` (con el encabezado de la venta, moneda, montos y estado) y `fact_sale_item` (con la línea de producto, cantidad, precio unitario y descuento).

Por ejemplo, una venta colombiana se guarda en `colombia.fact_sale` y sus líneas en `colombia.fact_sale_item`, relacionadas por `sale_id`. La misma estructura se mantiene en el resto de los países.

Las transformaciones de Airflow descubren los esquemas de país que ya contienen `fact_sale` y los unen en una tabla plana consolidada para la capa Gold.

## 4. Esquema público compartido

El esquema `public` contiene las tablas usadas a través de los esquemas transaccionales:

- **Dimensiones maestras:** `dim_currency`, `dim_country`, `dim_geolocation`, `dim_customer`, `dim_branch`, `dim_seller`, `dim_product_category`, `dim_product`, `dim_source`, `dim_exchange_rate`, `dim_holiday`, `dim_holiday_type`.
- **Hechos compartidos:** `fact_sale` y `fact_sale_item` (copias consolidadas de los datos por país; las exportaciones de Airflow escriben aquí para las vistas consolidadas).
- **Tablas operativas:** `marketplace_events` (latido de eventos con estado de deduplicación), `marketplace_seller_score_events`, `dim_seller_source_key` (mapea claves de sistemas de origen a sellers canónicos) y `customers` (clientes crudos que alimentan la vista seudonimizada de Silver).
- **Tablas de servicio Gold:** `gold_stockout_risk`, `hot_inventory_risk`, `gold_promotions_audit`, `gold_seller_score`, `gold_seller_score_history`, `gold_seller_status`, `data_quality_metrics`.
- **Entradas de puntaje de sellers de Silver:** `silver_seller_score_dispatch`, `silver_seller_score_reviews`, `silver_seller_score_inventory`, `silver_seller_score_cancellations` (entradas relacionales del job Spark por JDBC).

Consulta el [diccionario de datos transaccional](03-transactional-data-dictionary.md) para el detalle a nivel de columnas.

## 5. Esquemas de staging z1_silver / z2_gold

Los DAGs crean y mantienen esquemas de trabajo que evitan escribir resultados parciales en el camino analítico:

- `z1_silver.masked_customers`: registros seudonimizados de clientes (nombre, documento y correo enmascarados) construidos antes de las exportaciones Silver.
- `z2_gold.daily_sales`: agregación diaria de pedidos y venta neta en USD, recalculada después de la depuración.
- `z2_gold.available_inventory` y `z2_gold.stockout_risk`: instantáneas de disponibilidad de inventario y el riesgo de quiebre calculado con `sales_at_risk_usd`.
- `z2_gold.inventory_accuracy`: porcentajes de exactitud de inventario por seller.

Estas tablas son áreas de staging de siembra; la copia final vive en las tablas de servicio Gold del esquema público.

## 6. Esquemas Silver y Gold

El esquema `silver` expone vistas curadas, anonimizadas y de auditoría. El esquema `gold` expone una vista documentada oficialmente por pregunta de negocio; Power BI consume las vistas de `gold`.

| Esquema | Vistas |
|---|---|
| `silver` | `vw_customers_anonymized`, `vw_seller_dispatch`, `vw_seller_reviews`, `vw_seller_inventory`, `vw_seller_cancellations`, `vw_marketplace_events` (excluye eventos con estado `exception_exceeded_72h`) |
| `gold` | `vw_sales_consolidated`, `vw_stockout_risk_monitoring`, `vw_promotions_analysis`, `vw_seller_performance`, `vw_returns_audit`, `vw_holiday_sales_impact`, `vw_data_quality_dashboard` |

El esquema `public` conserva alias retrocompatibles de las vistas Gold (`vw_gold_sales_consolidated`, `vw_gold_stockout_risk_monitoring`, `vw_gold_promotions_analysis`, `vw_gold_seller_performance`, `vw_gold_returns_audit`, `vw_gold_holiday_sales_impact`, `vw_gold_data_quality_dashboard`) para que los consumidores existentes no requieran cambios de esquema.

## 7. Inicialización de la base de datos

El stack de Compose crea la base de datos de servicio local en este orden:

1. `01-databases.sh` crea los usuarios de aplicación de PostgreSQL y la base de datos de Airflow.
2. El servicio `gold-seller-score-schema` aplica `01_consolidated_mer_gold_schema.sql` (esquema, dimensiones, hechos, tablas operativas, siembras) y `03-gold-seller-score.sql` (contrato de servicio del puntaje de sellers).
3. `02-gold-operational.sql` crea `gold_stockout_risk` en la base de datos.
4. `pos-database` ejecuta las migraciones Alembic y la siembra POS.
5. `04-gold-powerbi-views.sql` crea los esquemas `silver`/`gold` y sus vistas (también lo ejecuta el DAG de reglas de negocio de Airflow antes de las consultas).

Todos los scripts son idempotentes, por lo que el stack inicializa tanto volúmenes nuevos como existentes. `05-purge-airflow-from-gold.sql` retira artefactos escritos por Airflow que no pertenecen a la capa de servicio.

## 8. Documentación relacionada

- [Modelo entidad-relación](01-entity-relationship-model.md)
- [Diccionario de datos transaccional](03-transactional-data-dictionary.md)
- [Diccionario Gold](05-gold-analytics-dictionary.md)
