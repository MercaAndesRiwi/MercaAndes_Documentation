---
title: Preguntas de negocio
sidebar_position: 1
description: Las siete preguntas de negocio que guían el tablero de Power BI y las tablas Gold que las responden.
---

# Preguntas de negocio

El tablero de Power BI responde siete preguntas de negocio. Cada pregunta vincula un indicador de interés con la información disponible en la capa Gold y su representación en el tablero.

La fuente analítica oficial es el esquema `gold` de la base de datos de servicio (ver el [diccionario Gold](/docs/database/gold-analytics-dictionary)); las exportaciones Gold de S3 se consultan mediante Athena para análisis ad hoc.

## 1. Venta neta por país, canal y categoría

**Pregunta:** ¿Cuál es la venta neta en dólares estadounidenses (USD) por país, canal y categoría, con desglose diario, semanal y mensual?

**Fuente Gold:** `gold.vw_sales_consolidated` (RN-01), construida a partir de las tablas `fact_sale`/`fact_sale_item` de los cinco esquemas de país.

**Tablero:** medida de ventas convertida a USD con la tasa de cambio de la fecha de la transacción, segmentada por país, canal, categoría y los granos día/semana/mes que aportan `order_date`, `week_start_date` y `month_start_date`.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 1 (venta neta USD por país, canal y categoría). */}

## 2. Riesgo de quiebre de inventario

**Pregunta:** ¿Qué referencias de producto (SKU) y tiendas tienen riesgo de quiebre de inventario y cuál es el valor de las ventas en riesgo?

**Fuente Gold:** `gold_stockout_risk` (regla batch diaria, RN-04/RF-05) con el complemento en tiempo real `hot_inventory_risk`; el tablero lee `gold.vw_stockout_risk_monitoring`.

**Tablero:** pares SKU/tienda marcados con `at_risk`, clasificados por severidad (`CRITICAL` ≤ 1 día, `HIGH` ≤ 3 días, `MEDIUM`), con el valor en riesgo `sales_at_risk_usd`.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 2 (riesgo de quiebre por SKU y tienda). */}

## 3. Promociones rechazadas por falta de inventario

**Pregunta:** ¿Qué promociones fueron rechazadas por falta de inventario y cuánto se habría vendido?

**Fuente Gold:** `gold_promotions_audit`, evaluada por el flujo semanal de promociones F7 (RN-05/RF-04); el tablero lee `gold.vw_promotions_analysis`.

**Tablero:** promociones rechazadas (`is_rejected`), motivo del rechazo, el stock pendiente `coverage_days` y la estimación `projected_lost_sales_usd`.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 3 (promociones rechazadas y venta perdida). */}

## 4. Distribución y desempeño de sellers externos

**Pregunta:** ¿Cómo se distribuyen los sellers externos por estado y cómo evoluciona su puntaje de desempeño?

**Fuente Gold:** `gold_seller_score`, `gold_seller_score_history` y `gold_seller_status`, escritas por el job semanal de Spark (RN-07/RN-08/RF-03); el tablero lee `gold.vw_seller_performance`.

**Tablero:** distribución de sellers por estado (`active`, observación, suspendido) y tipo (propios frente a terceros), evolución del puntaje por semana y el nivel de desempeño (`High Performer`, `Standard`, `Under Observation`, `Suspended / Action Required`).

{/* IMAGEN-AQUI: visual del tablero para la pregunta 4 (distribución y evolución del puntaje de sellers). */}

## 5. Tasa de devoluciones

**Pregunta:** ¿Cuál es la tasa de devoluciones por categoría y qué porcentaje de devoluciones cae fuera de la ventana establecida?

**Fuente Gold:** derivada de los estados de `gold.vw_sales_consolidated` (RN-02/RN-06); el tablero lee `gold.vw_returns_audit`.

**Tablero:** tasa de devoluciones por país y categoría (`return_rate_pct`), devoluciones dentro de 30 días, devoluciones fuera de 30 días (`returns_outside_30_days`) y `pct_returns_outside_30_days`.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 5 (tasa de devoluciones por categoría y % fuera del plazo). */}

## 6. Impacto de días festivos en ventas

**Pregunta:** ¿Cómo afectan los días festivos a las ventas de cada país?

**Fuente Gold:** cruza las ventas consolidadas con el calendario `dim_holiday` de los cinco países; el tablero lee `gold.vw_holiday_sales_impact`.

**Tablero:** días festivos frente a días regulares por país, con venta neta diaria (`daily_net_sales_usd`), conteo de pedidos y ticket promedio.

{/* IMAGEN-AQUI: visual del tablero para la pregunta 6 (impacto de días festivos en ventas por país). */}

## 7. Calidad de datos por fuente

**Pregunta:** ¿Cuál es la calidad de los datos por fuente, considerando duplicados, registros tardíos y registros rechazados?

**Fuente Gold:** `data_quality_metrics` por carga y fuente (RN-10); el tablero lee `gold.vw_data_quality_dashboard`.

**Tablero:** tasas de duplicados, llegadas tardías y rechazos por la ventana de 72 horas por sistema de origen, junto con el `quality_status` de cada carga y el JSON de detalles de la métrica.


Las reglas de procesamiento detrás de cada vista están descritas en el [diccionario Gold](/docs/database/gold-analytics-dictionary) y en [Ejecutar el procesamiento de datos](/docs/installation-deployment/run-data-processing).
