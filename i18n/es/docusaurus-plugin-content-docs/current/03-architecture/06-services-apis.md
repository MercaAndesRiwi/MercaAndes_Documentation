---
title: APIs desplegadas y consolas operativas
description: Enlaces desplegados a la documentación de las APIs, Swagger UIs locales, consolas operativas y flujo de compra simulada con confirmación por correo.
sidebar_position: 6
---

# APIs desplegadas y consolas operativas

Esta página lista los endpoints de servicio compartidos por el equipo del proyecto, junto con sus equivalentes locales para el stack de Compose. Estos servicios usan HTTP sin cifrar y no deben transportar información sensible en tránsito; para tráfico público prefiere dominios con HTTPS.

## Documentación de las APIs desplegadas

Las tres APIs corren en tareas de ECS Fargate accesibles mediante IPs públicas, en el clúster `mercaandes-ecs-cluster`.

| Servicio | Propósito | Documentación |
|---|---|---|
| API de inventario y sellers (F3) | Catálogo de sellers, inventario y puntajes. | [Abrir el Swagger UI](http://3.132.51.65:8002/docs) |
| API de marketplace (F4) | Generación de eventos del ciclo de vida y compras simuladas. | [Abrir el Swagger UI](http://3.132.51.65:8003/docs) |
| API de promociones (F7) | Ingesta y validación de promociones semanales. | [Abrir el Swagger UI](http://3.132.51.65:8004/docs) |

Si un endpoint deja de responder, la tarea pudo haberse redesplegado con otra dirección pública; recupera la vigente desde las interfaces de red de la tarea (`aws ecs describe-tasks` + `aws ec2 describe-network-interfaces`) y actualiza esta tabla.

## Contratos de las APIs

La API de inventario expone `GET /api/v1/sellers` (lista), `GET /api/v1/sellers/{seller_id}` (detalle), `GET /api/v1/sellers/{seller_id}/score` (puntaje), `GET /api/v1/sellers/{seller_id}/inventory` e `/inventory/{sku}` (inventario por seller y SKU), y `GET /api/v1/inventory/stock` (nivel de stock). Todas las rutas están documentadas en el Swagger UI.

La API de marketplace define `POST /api/v1/marketplace/events` (generación de eventos del ciclo de vida con inyección de fallas), `POST /api/v1/marketplace/purchase` (compra simulada con evento de notificación) y `GET /api/v1/marketplace/orders/{order_id}/timeline` (estado e histórico del pedido). Los Swagger UI muestran los contratos de solicitud y respuesta del despliegue vigente.

La API de promociones expone `GET /health`, `POST /api/v1/promotions/ingest` (ingesta de Excel/CSV en `gold_promotions_audit`) y `POST /api/v1/rabbit/ingest` (publica el archivo en la cola de ingesta).

## Swagger UIs locales

Con el stack de Compose en ejecución, las mismas APIs responden en sus puertos locales:

| Servicio | URL |
|---|---|
| API de marketplace (F4) | `http://localhost:8003/docs` |
| API de inventario (F3) | `http://localhost:8002/docs` |
| API de promociones (F7) | `http://localhost:8004/docs` |
| API de reports | `http://localhost:8005/docs` |

## Consolas operativas

La plataforma incluye Airflow, RabbitMQ Management, Kafka UI (Kafdrop) y Spark Master UI. Son interfaces de operación, no APIs de fuentes de datos.

| Consola | URL desplegada | Puerto local | Usuarios |
|---|---|---:|---|
| Interfaz web de Airflow | [Airflow](http://3.132.51.65:8080/) | 8080 | Operación de la plataforma de datos |
| Airflow Flower | — | 5555 | Monitoreo de workers distribuidos |
| RabbitMQ Management | [RabbitMQ Management](http://3.132.51.65:15672/) | 15672 | Operación de mensajería |
| Kafka UI (Kafdrop) | [Kafka UI](http://3.132.51.65:9000/) | 9000 | Operación de streaming |
| Spark Master UI | [Spark Master UI](http://3.132.51.65:8081/) | 8081 | Operación de procesamiento |

Las credenciales de estas consolas viven en el archivo `.env` de `infrastructure_MercAndes` (`AIRFLOW_ADMIN_USER`/`AIRFLOW_ADMIN_PASSWORD`, `RABBITMQ_USER`/`RABBITMQ_PASSWORD`). No publiques las credenciales de las consolas en este sitio ni por chat; restringe el tráfico de entrada de las consolas a IPs de administradores aprobadas y rota las credenciales expuestas.

## Compra simulada y confirmación por correo

El flujo de compra de Marketplace agrega una demostración orientada al cliente sobre el productor de eventos:

1. Se envía una solicitud de compra a través de la API de marketplace (`POST /api/v1/marketplace/purchase`).
2. La API crea un pedido simulado (con ID como `MA-2026-A1B2C`), calcula los subtotales de las líneas y publica un mensaje `PURCHASE_CONFIRMED` en la cola durable de RabbitMQ `mercaandes.notifications.purchase`.
3. El worker de notificaciones consume el mensaje y prepara una confirmación con la referencia del pedido, el estado, la fecha, los productos comprados y el total.
4. La demostración desplegada entrega un correo de confirmación con formato visual (vía SMTP; con `SMTP_HOST` vacío funciona en modo dry-run registrando en logs). El mensaje incluye una acción **Rastrear mi pedido** que redirige a la API del timeline del pedido.

{/* IMAGEN-AQUI: captura del correo de confirmación de compra (la que tenías; contiene datos de cliente/orden, decide si la vuelves a incluir). */}

Este flujo demuestra un pedido simulado cuyo evento de notificación se publica y procesa de manera asíncrona; no representa la autorización de un pago real.

## Seguridad y verificación

- Mantén las contraseñas de la base de datos, SSH, Airflow y RabbitMQ fuera de esta documentación pública y del control de versiones.
- Usa credenciales separadas para cada servicio; rota cualquier contraseña compartida por chat o guardada en un repositorio.
- Limita el acceso SSH a orígenes aprobados y el ingreso a la base de datos al Security Group del bastion donde se use el túnel.
- Reemplaza los enlaces HTTP directos por endpoints HTTPS antes de usar las APIs con información real o sensible de clientes.

## Documentación relacionada

- [Componentes de arquitectura](02-components.md)
- [Infraestructura AWS y costos](aws-infrastructure.md)
- [IAM y seguridad](05-iam-security.md)
- [Repositorio de la API de marketplace](https://github.com/MercaAndesRiwi/Marketplace_Api)
- [Repositorio de la API de inventario](https://github.com/MercaAndesRiwi/Inventory_Api)
