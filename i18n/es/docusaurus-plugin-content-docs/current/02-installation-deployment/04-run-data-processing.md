---
id: run-data-processing
title: Ejecutar el procesamiento de datos
sidebar_position: 4
description: DAGs de Airflow, jobs Spark y servicios que mueven los datos por Bronze, Silver y Gold.
---

# Ejecutar el procesamiento de datos

Con el stack Compose arriba, el procesamiento corre a través de Apache Airflow, jobs PySpark y los servicios de la capa de velocidad. Accede a la interfaz web de Airflow en `http://localhost:8080` (las credenciales se configuran en `.env`).

## Pipeline orquestado

Los DAGs se ejecutan en la siguiente secuencia:

| # | DAG | Programación | Propósito |
|---|---|---|---|
| 1 | `f1_kaggle_historical` | `@once` | Carga inicial del dataset histórico de Olist hacia S3 Bronze. |
| 2 | `bronze_to_silver_cleaning` | `@daily` | Limpia, anonimiza, deduplica y valida datos, escribe tablas y vistas Silver y exporta ventas diarias. |
| 3 | `silver_to_gold_business_rules` | `@daily` | Aplica las reglas de negocio Gold en cadenas paralelas: riesgo de quiebre (RN-04) y exactitud de inventario; exporta tablas Gold a S3 y refresca las vistas de Power BI. |
| 4 | `seller_scoring` | `@weekly` | Prepara las entradas del seller score, ejecuta el cálculo Spark vía JDBC y actualiza el estatus de sellers. |
| 5 | `f7_promotions_weekly` | `@weekly` | Lee el archivo semanal de promociones, encuestra la publicación y dispara las alertas de tiendas silenciosas. |
| 6 | `dag_partitioned_reprocessing` | `@daily` | Reprocesa el histórico sobre particiones de fecha seleccionadas. |

Para ejecutar un DAG de inmediato, ábrelo en la UI de Airflow y usa **Trigger DAG**. Confirma que las tareas terminen con éxito, incluidas las tareas Spark. El resultado del DAG `seller_scoring` se expone en la Inventory API vía `GET /api/v1/sellers/{seller_id}/score`.

## Servicios de la capa de velocidad

- **Eventos de marketplace (F4):** genera eventos del ciclo de vida con inyección de fallas (duplicados y fuera de orden) desde `POST /api/v1/marketplace/events` de la Marketplace API. Los parámetros del productor aceptan el número de pedidos, semilla, tasa de duplicados y retardos fuera de orden.
- **Ingesta de seller score:** el consumidor `seller-score-ingestion` lee eventos de marketplace desde Kafka y mantiene sincronizadas las entradas Silver del seller score.
- **Riesgo de inventario en caliente:** Spark Streaming consume el stream de pedidos en microlotes y mantiene la tabla `hot_inventory_risk` para el monitoreo casi en tiempo real de existencias.
- **Notification worker:** consume las notificaciones de compra de la cola RabbitMQ `mercaandes.notifications.purchase` y entrega el correo de confirmación (o lo registra en modo dry-run).
- **Reportes y alertas operativas:** el servicio `operational-messaging` expone `POST /api/v1/reports` para solicitar reportes comerciales programados y publica alertas en las colas de RabbitMQ.

## Archivo semanal de promociones (F7)

El equipo comercial aporta el archivo de promociones cada semana. Coloca el archivo Excel o CSV en `inputs/f7_promotions` (montado en `/opt/inputs/f7_promotions` dentro del contenedor). Las columnas esperadas son `sku`, `tienda_o_canal`, `descuento_pct`, `fecha_inicio` y `fecha_fin`. El DAG `f7_promotions_weekly` ingesta el archivo y `POST /api/v1/rabbit/ingest` lo publica en la cola de ingesta.

## Verificación del flujo de datos

1. Consulta las vistas Gold en PostgreSQL (`gold.vw_sales_consolidated`, `gold.vw_stockout_risk_monitoring` y el resto de las [vistas de preguntas de negocio](/docs/business-questions/business-questions)).
2. Revisa las carpetas `bronze/`, `silver/` y `gold/` del bucket S3 configurado.
3. Inspecciona la tabla de métricas de calidad `public.data_quality_metrics` (por carga: procesados, duplicados, tardíos y rechazos).
