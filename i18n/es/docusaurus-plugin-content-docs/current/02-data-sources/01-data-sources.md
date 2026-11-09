---
id: data-sources
title: Fuentes de datos
sidebar_position: 1
description: Fuentes históricas, transaccionales, externas y comerciales que alimentan la plataforma MercaAndes.
---

# Fuentes de datos

La plataforma integra fuentes históricas, transaccionales, servicios externos y datos comerciales. Algunas fuentes son reales y otras corresponden a simulaciones que reproducen el comportamiento esperado de la operación.

## Tabla de fuentes

| Fuente | Tipo y descripción |
|---|---|
| **Histórico de Olist** | Fuente real. Conjunto de datos público de comercio electrónico brasileño, distribuido en nueve archivos CSV. Se carga una sola vez y aporta aproximadamente 100.000 pedidos como histórico del canal digital. Brasil funciona como referencia histórica y no forma parte de los cinco países de operación andina. |
| **Bases de datos POS por país** | Fuente simulada. PostgreSQL con un esquema por país. Recibe ventas de forma continua y contempla un volumen objetivo de al menos 2 millones de ventas en 12 meses. |
| **API de inventario de sellers** | Servicio REST simulado, con paginación y autenticación mediante token. Se consulta cada 10 minutos y contempla al menos 3.000 sellers y 50.000 SKU. Incluye respuestas controladas con errores HTTP 429 y 503 en al menos el 3 % de las solicitudes. |
| **Eventos de pedidos del marketplace** | Fuente simulada. Mensajes JSON que representan el ciclo de vida de los pedidos: creado, pagado, enviado, entregado, cancelado y devuelto. Considera picos de al menos 20 eventos por segundo, además de eventos duplicados y fuera de orden. |
| **Tasas de cambio** | Fuente real. API pública Frankfurter, con información por moneda y día. La cobertura no incluye todas las monedas andinas. |
| **Calendario de festivos** | Fuente real. API pública Nager.Date, consultada por país para Colombia (CO), Perú (PE), Ecuador (EC), Bolivia (BO) y Chile (CL). La información se utiliza en las reglas relacionadas con el reabastecimiento. |
| **Plan de promociones** | Fuente simulada. Archivo Excel semanal de menos de 5.000 filas, cargado por el área comercial en el almacenamiento de objetos. Repositorio fuente: [promotional-plan](https://github.com/MercaAndesRiwi/promotional-plan). |

{/* COMENTARIO: AQUI-VAS-API: enlace desplegada del docx (sección 5). Ejemplo: [Abrir el Swagger UI](http://IP:PUERTO/docs). */}

## API desplegada

Las APIs que exponen datos operativos y servicios simulados corren en AWS.

| Servicio | Propósito | Documentación |
|---|---|---|
| Inventory & Sellers API (F3) | Catálogo de sellers, inventario y puntajes. | [Abrir el Swagger UI](http://3.132.51.65:8002/docs#/) |
| Marketplace API (F4) | Generación de eventos del ciclo de vida del marketplace y compras simuladas. | [Abrir el Swagger UI](http://3.132.51.65:8003/docs#/) |
| Promotions API (F7) | Ingesta semanal de promociones desde Excel y validación de promociones. | [Abrir el Swagger UI](http://3.132.51.65:8004/docs#/default) |

Los equivalentes locales de estas APIs están documentados en [APIs desplegadas y consolas operativas](/docs/architecture/services-apis).
