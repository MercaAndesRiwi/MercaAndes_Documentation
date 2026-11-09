---
title: Glosario
sidebar_position: 1
description: Glosario de términos del proyecto usados en toda la documentación de MercaAndes.
---

# Glosario

| Término | Definición |
|---|---|
| **SKU** | Código único que identifica una referencia de producto. |
| **Quiebre de inventario (stockout)** | Situación en la que un producto se agota y deja de estar disponible para la venta. |
| **Cobertura de inventario** | Número de días de venta que el inventario disponible puede soportar. |
| **Seller** | Vendedor tercero que publica y vende productos en el marketplace. |
| **Omnicanalidad** | Integración de ventas e información entre canales físicos y digitales. |
| **Medallión** | Organización del lago de datos en las capas Bronze, Silver y Gold. |
| **Arquitectura Lambda** | Patrón de procesamiento que combina una capa batch y una capa de velocidad. |
| **Bronze** | Capa del lago que conserva los datos originales de la fuente en su estructura de origen. |
| **Silver** | Capa del lago con datos limpios, validados, estandarizados y deduplicados. |
| **Gold** | Capa del lago con datos enriquecidos, modelados y agregados, preparados para el consumo de negocio. |
| **Evento tardío** | Evento que llega después del momento en que ocurrió. |
| **Ventana de llegadas tardías (72 h)** | Tolerancia usada por los pipelines: los eventos procesados tras más de 72 horas se rechazan (RN-10). |
| **Idempotente** | Propiedad de un proceso que puede ejecutarse varias veces sin duplicar su resultado. |
| **Seudonimización** | Reemplazo de los datos personales por identificadores que no revelan directamente la identidad de la persona (RN-11). |
| **DAG** | Grafo acíclico dirigido que representa tareas y dependencias en Apache Airflow. |
| **ADR** | Architecture Decision Record: registro de una decisión de arquitectura y su justificación. |
| **Capa de servicio** | Base de datos PostgreSQL (`merca_pos`) que aloja los esquemas transaccionales, dimensionales y analíticos que consume el tablero. |
| **Tabla hot** | Tabla de la capa de velocidad actualizada en micro-lotes, como `hot_inventory_risk`. |
| **Reconciliación** | Verificación de los contadores de streaming contra los resultados batch, marcada mediante `is_reconciled`. |
| **Regla de negocio (RN)** | Regla analítica numerada del negocio (por ejemplo, RN-01 venta neta, RN-04 riesgo, RN-10 calidad) implementada en las vistas Gold y en los DAGs. |
