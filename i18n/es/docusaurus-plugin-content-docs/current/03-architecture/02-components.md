# Componentes de la arquitectura

## 1. Descripción general

La arquitectura de MercaAndes está compuesta por fuentes de datos, servicios de procesamiento, sistemas de almacenamiento, infraestructura de mensajería y herramientas analíticas.

Cada componente tiene una responsabilidad definida dentro de la plataforma. Su integración soporta el procesamiento histórico, el procesamiento dirigido por eventos, el almacenamiento de datos y la analítica de negocio.

## 2. Fuentes de datos e ingesta

### 2.1. Generador de ventas POS (F2)

El repositorio `Transactional-POS-database` provee las migraciones Alembic y la CLI de semillas que pueblan el modelo transaccional POS. Genera catálogos compartidos (monedas, países, festivos, productos, categorías, tiendas, sellers, fuentes), clientes y ventas de punto de venta para los cinco países operativos, con tasas de cambio de Frankfurter y festivos de Nager.Date. Su imagen Docker (`pos-database`) corre dentro del stack Compose en el arranque.

### 2.2. Inventory & Sellers API (F3)

El repositorio `Inventory_Api` expone el catálogo de sellers y consultas de inventario sobre la base de datos de servicio:

- `GET /api/v1/sellers` lista sellers (paginado).
- `GET /api/v1/sellers/{seller_id}` detalle de seller.
- `GET /api/v1/sellers/{seller_id}/score` puntaje del seller escrito por el job Spark semanal.
- `GET /api/v1/sellers/{seller_id}/inventory` y `/inventory/{sku}` inventario por seller y SKU.
- `GET /api/v1/inventory/stock` consultas de nivel de existencias.

El repositorio `MercaAndes_Mock_Inventory_API` simula el feed de inventario de terceros con paginación, autenticación por token y respuestas controladas HTTP 429/503.

### 2.3. Marketplace API (F4)

El repositorio `Marketplace_Api` provee el simulador de eventos y el flujo de compra del cliente:

- `POST /api/v1/marketplace/events` genera eventos del ciclo de vida (creado, pagado, enviado, entregado, cancelado, devuelto) con duplicados y eventos fuera de orden configurables.
- `POST /api/v1/marketplace/purchase` simula una compra y publica una notificación `PURCHASE_CONFIRMED` en RabbitMQ.
- `GET /api/v1/marketplace/orders/{order_id}/timeline` devuelve el estado del pedido y su línea de tiempo de eventos.

### 2.4. Promotions API (F7)

El servicio `f7-weekly-promotions`, dentro de `infrastructure_MercAndes`, lee el archivo Excel/CSV semanal desde el montaje `inputs/f7_promotions` y expone:

- `GET /health` estado del servicio.
- `POST /api/v1/promotions/ingest` valida e ingesta el archivo de promociones, escribe los resultados en `gold_promotions_audit` y crea alertas de tiendas silenciosas.
- `POST /api/v1/rabbit/ingest` publica el payload del archivo en la cola `mercaandes.promotions.weekly.ingest` para ingesta asíncrona.

### 2.5. Ingesta de datos de apoyo

- **Tasas de cambio:** el repositorio `api-exchange-rates` ingesta tasas de la API Frankfurter hacia las tablas de moneda; su imagen Docker corre como servicio `exchange-rates-seed`.
- **Festivos:** el repositorio `api-holidays` ingesta festivos para CO, PE, EC, BO y CL desde la API Nager.Date; su imagen Docker corre como servicio `holidays-seed`.
- **Servicio de reportes:** el servicio `operational-messaging` expone `POST /api/v1/reports` para programar reportes comerciales vía RabbitMQ.

## 3. Capa de lotes (Batch)

La capa de lotes procesa datos históricos mediante workflows programados.

### Apache Airflow

Apache Airflow 3.1.5 corre seis DAGs: carga histórica, limpieza bronze a silver, reglas de negocio silver a gold, seller scoring semanal, promociones semanales y reprocesamiento particionado. CeleryExecutor usa RabbitMQ como broker y PostgreSQL como backend de resultados.

### Apache Spark

Apache Spark 3.5 ejecuta los jobs por lotes: el cálculo semanal del seller score (`seller_scoring`) y las tareas de reglas de negocio Gold. Los jobs leen y escriben PostgreSQL por JDBC y exportan tablas Gold a S3 para Athena.

### Amazon S3 y Amazon RDS para PostgreSQL

S3 almacena los datasets Bronze, Silver y Gold del lago. RDS PostgreSQL sirve los datos transaccionales POS, las dimensiones y hechos compartidos, y las vistas analíticas `silver`/`gold`.

## 4. Capa de velocidad (Speed)

La capa de velocidad soporta ingesta continua de eventos y procesamiento casi en tiempo real.

### Apache Kafka

Kafka transporta el stream de eventos de marketplace (tópic `mercaandes.orders.events`, 3 particiones, retención de 7 días). La UI Kafdrop en el puerto 9000 permite inspeccionar los tópics.

### RabbitMQ

RabbitMQ gestiona la mensajería operativa: notificaciones de compra (`mercaandes.notifications.purchase`), ingesta semanal de promociones (`mercaandes.promotions.weekly.ingest`) y alertas de tiendas silenciosas (`mercaandes.alerts.silent-store`). La consola de administración corre en el puerto 15672.

### Workers y consumidores Spark

El consumidor `seller-score-ingestion` mantiene sincronizadas las entradas Silver del seller score con el stream de eventos, y los workers Spark de Airflow mantienen la tabla `hot_inventory_risk` para el riesgo de existencias casi en tiempo real.

## 5. Capa de servicio (Serving)

### Amazon RDS para PostgreSQL

RDS PostgreSQL 16 (`mercaandes-postgres-gold`) sirve los datos transaccionales y curados para el consumo operativo. La organización de esquemas está documentada en el [modelo de datos](/docs/database/schemas-organization).

### Amazon Athena y AWS Glue

El Glue Data Catalog registra los datasets Gold exportados a S3, y Amazon Athena ejecuta consultas SQL sobre ellos.

## 6. Capa de analítica

### Power BI

Power BI consume las siete vistas `gold` oficiales como fuente del tablero comercial. Cada vista responde una [pregunta de negocio](/docs/business-questions/business-questions).

### Metabase

Metabase ofrece exploración de datos y consultas ad hoc sobre la base de servicio y el lago.

## 7. Componentes de infraestructura

### Amazon VPC y Security Groups

Amazon VPC provee el aislamiento de red con subredes públicas y privadas. Los Security Groups controlan la comunicación: `mercaandes-sg-rds` (5432), `mercaandes-sg-alb-apis` (80/8000) y los grupos de nodos batch y streaming.

### AWS IAM

Los roles IAM proveen permisos de workload: rol API EC2, nodo batch, nodo streaming, pipeline CI/CD y el rol de ejecución de tareas ECS. Ver [IAM y seguridad](05-iam-security.md).

### Docker y Amazon ECR

Docker empaca aplicaciones y jobs en contenedores. Amazon ECR almacena 14 repositorios privados de imágenes, desde las APIs hasta las imágenes de los nodos. El catálogo de imágenes y el flujo de build están descritos en la página de [infraestructura AWS](aws-infrastructure).

### Amazon ECS con Fargate y EC2

ECS (cluster `mercaandes-ecs-cluster`) responde las tres APIs de cliente en tareas Fargate con IP pública y health checks (`/health`, puerto 8000). Airflow, Spark, Kafka y RabbitMQ corren en los nodos EC2 batch y streaming.

## 8. Interacciones entre componentes

La plataforma sigue esta secuencia general de interacciones:

1. Las imágenes de semillas pueblan la base de datos POS; el cargador de Olist y el servicio de promociones aterrizan datos crudos en S3 Bronze.
2. Los jobs Spark y las ingestas AWS mueven los datos por la limpieza Silver y las reglas de negocio Gold.
3. La Marketplace API publica eventos a Kafka; el flujo de compra publica a RabbitMQ.
4. Los consumidores (seller-score ingestion, notification worker, reports worker) procesan los mensajes.
5. Los resultados Gold viven en vistas de RDS y carpetas S3 Gold registradas en Glue.
6. Power BI y Metabase consumen las vistas Gold; Athena soporta consultas ad hoc sobre el lago.

Para los enlaces de documentación de API y el flujo de notificación de compra desplegado, ver [APIs desplegadas y consolas operativas](06-services-apis.md).

Para los detalles de infraestructura, ver [Infraestructura AWS y costos](aws-infrastructure). Para el sustento de las decisiones de arquitectura, ver [Decisiones técnicas](04-technical-decisions.md).
