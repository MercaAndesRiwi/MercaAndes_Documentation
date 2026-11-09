# Architecture Components

## 1. Overview

The MercaAndes architecture is composed of data sources, processing services, storage systems, messaging infrastructure, and analytical tools.

Each component has a defined responsibility within the data platform. Their integration supports historical processing, event-driven processing, data storage, and business analytics.

## 2. Data Sources and Ingestion

### 2.1. POS Sales Generator (F2)

The `Transactional-POS-database` repository provides the Alembic migrations and the seeding CLI that populate the transactional POS model. It generates shared catalogs (currencies, countries, holidays, products, categories, branches, sellers, sources), customers, and point-of-sale sales for the five operational countries, with exchange rates from Frankfurter and holidays from Nager.Date. Its Docker image (`pos-database`) runs inside the Compose stack on startup.

### 2.2. Inventory & Sellers API (F3)

The `Inventory_Api` repository exposes the seller catalog and inventory queries over the serving database:

- `GET /api/v1/sellers` list sellers (paginated).
- `GET /api/v1/sellers/{seller_id}` seller detail.
- `GET /api/v1/sellers/{seller_id}/score` seller score written by the weekly Spark job.
- `GET /api/v1/sellers/{seller_id}/inventory` and `/inventory/{sku}` inventory per seller and SKU.
- `GET /api/v1/inventory/stock` stock level queries.

The `MercaAndes_Mock_Inventory_API` repository simulates the third-party inventory feed with pagination, token authentication, and controlled HTTP 429/503 responses.

### 2.3. Marketplace API (F4)

The `Marketplace_Api` repository provides the order-event simulator and the customer purchase flow:

- `POST /api/v1/marketplace/events` generates lifecycle events (created, paid, shipped, delivered, canceled, returned) with configurable duplicates and out-of-order delays.
- `POST /api/v1/marketplace/purchase` simulates a purchase and publishes a `PURCHASE_CONFIRMED` notification to RabbitMQ.
- `GET /api/v1/marketplace/orders/{order_id}/timeline` returns the order status and its event timeline.

### 2.4. Promotions API (F7)

The `f7-weekly-promotions` service inside `infrastructure_MercAndes` reads the weekly Excel/CSV file from the `inputs/f7_promotions` mount and exposes:

- `GET /health` service health.
- `POST /api/v1/promotions/ingest` validates and ingests the promotions file, writes the `gold_promotions_audit` results, and creates silent-store alerts.
- `POST /api/v1/rabbit/ingest` publishes the file payload to the `mercaandes.promotions.weekly.ingest` queue for asynchronous ingestion.

### 2.5. Supporting Data Ingestion

- **Exchange rates:** the `api-exchange-rates` repository ingests rates from the Frankfurter API into the currency tables; its Docker image runs as the `exchange-rates-seed` service.
- **Holidays:** the `api-holidays` repository ingests holiday data for CO, PE, EC, BO, and CL from the Nager.Date API; its Docker image runs as the `holidays-seed` service.
- **Reports service:** the `operational-messaging` service exposes `POST /api/v1/reports` to schedule commercial reports through RabbitMQ.

## 3. Batch Layer

The Batch Layer processes historical data through scheduled workflows.

### Apache Airflow

Apache Airflow 3.1.5 runs six DAGs: historical load, bronze-to-silver cleaning, silver-to-gold business rules, weekly seller scoring, weekly promotions, and partitioned reprocessing. The CeleryExecutor uses RabbitMQ as broker and PostgreSQL as result backend.

### Apache Spark

Apache Spark 3.5 executes the batch jobs: the weekly seller-score calculation (`seller_scoring`) and the Gold business-rule tasks. Jobs read and write PostgreSQL through JDBC and export Gold tables to S3 for Athena.

### Amazon S3 and Amazon RDS for PostgreSQL

S3 stores the Bronze, Silver, and Gold datasets of the data lake. RDS PostgreSQL serves the transactional POS data, the shared dimensions and facts, and the analytical `silver`/`gold` views.

## 4. Speed Layer

The Speed Layer supports continuous event ingestion and near-real-time processing.

### Apache Kafka

Kafka transports the marketplace event stream (topic `mercaandes.orders.events`, 3 partitions, 7-day retention). The Kafdrop UI at port 9000 allows topic inspection.

### RabbitMQ

RabbitMQ handles operational messaging: purchase notifications (`mercaandes.notifications.purchase`), weekly promotions ingestion (`mercaandes.promotions.weekly.ingest`), and silent-store alerts (`mercaandes.alerts.silent-store`). The management console runs at port 15672.

### Spark Workers and Consumers

The `seller-score-ingestion` consumer keeps the Silver seller-score inputs synchronized with the event stream, and Airflow Spark workers maintain the `hot_inventory_risk` table for near-real-time stock risk.

## 5. Serving Layer

### Amazon RDS for PostgreSQL

RDS PostgreSQL 16 (`mercaandes-postgres-gold`) serves transactional and curated data for operational consumption. See the [data model](/docs/database/schemas-organization) for its schemas.

### Amazon Athena and AWS Glue

AWS Glue Data Catalog registers the Gold datasets exported to S3, and Amazon Athena executes SQL queries over them.

## 6. Analytics Layer

### Power BI

Power BI consumes the seven official `gold` views as the source of the commercial dashboard. Each view answers one [business question](/docs/business-questions/business-questions).

### Metabase

Metabase offers data exploration and ad hoc queries over the serving database and the data lake.

## 7. Infrastructure Components

### Amazon VPC and Security Groups

Amazon VPC provides network isolation with public and private subnets. Security Groups control communication: `mercaandes-sg-rds` (5432), `mercaandes-sg-alb-apis` (80/8000), and the batch/streaming node groups.

### AWS IAM

IAM roles provide workload permissions: API EC2 role, batch node, streaming node, CI/CD pipeline, and the ECS task execution role. See [IAM and security](05-iam-security.md).

### Docker and Amazon ECR

Docker packages applications and jobs into containers. Amazon ECR stores 14 private image repositories, from the APIs to the node images. The image catalog and build workflow are described in the [AWS infrastructure](aws-infrastructure.md#amazon-ecr) page.

### Amazon ECS with Fargate and EC2

ECS (cluster `mercaandes-ecs-cluster`) runs the three customer-facing APIs on Fargate tasks with public IPs and health checks (`/health`, port 8000). Airflow, Spark, Kafka, and RabbitMQ run on the EC2 batch and streaming nodes.

## 8. Component Interactions

The platform follows this general interaction sequence:

1. Seeding images populate the POS database; the Olist loader and promotions service land raw data in S3 Bronze.
2. Spark jobs and the AWS ingests move data through Silver cleaning and Gold business rules.
3. The Marketplace API publishes events to Kafka; the purchase flow publishes to RabbitMQ.
4. Consumers (seller-score ingestion, notification worker, reports worker) process messages.
5. Gold results live in RDS views and S3 Gold folders registered in Glue.
6. Power BI and Metabase consume the Gold views; Athena supports ad hoc lake queries.

For the API documentation links and the deployed purchase-notification flow, see [Deployed APIs and operational consoles](06-services-apis.md).

For infrastructure details, see [AWS Infrastructure and Costs](aws-infrastructure.md). For the rationale behind the architecture, see [Technical Decisions](04-technical-decisions.md).
