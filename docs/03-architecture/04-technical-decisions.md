# Technical Decisions

## 1. Purpose

This page records the main architectural decisions documented for MercaAndes, including their rationale and consequences. The accepted architecture document dates from October 4, 2026, and the infrastructure deployment plan from October 9, 2026. The detailed engineering records live in the `infrastructure_MercAndes/docs` folder (ADR-013 Fargate task definitions, ADR-014 RDS serving layer, ADR-016 Fargate vs EKS, plus the Kafka, RabbitMQ, and late-event handling notes).

## 2. Lambda Architecture Combined with Medallion

**Status:** Accepted and implemented

**Decision:** Combine the Lambda Architecture with the Medallion data organization pattern.

**Rationale:** The Lambda approach separates historical batch processing from near-real-time event processing, so the platform addresses both comprehensive historical transformations and continuous event ingestion. The Medallion pattern organizes data into Bronze, Silver, and Gold layers to support progressive data quality and business-oriented transformations.

**Consequences in the implementation:**

- Batch and streaming workloads run on separate nodes (batch node vs streaming node).
- Data maturity is represented twice, in S3 (lake) and in PostgreSQL (`silver`/`gold` serving schemas).
- The DAG set implements the batch chain; Kafka consumers implement the speed layer.

## 3. Amazon S3 as the Data Lake

**Status:** Accepted and implemented

**Decision:** Use Amazon S3 to store data across the Bronze, Silver, and Gold layers.

**Rationale:** S3 provides durable, scalable object storage for historical and analytical datasets.

**Consequences in the implementation:**

- The bucket holds the `bronze/`, `silver/`, and `gold/` prefixes, with Gold exports written as `gold/{table}/{table}.csv` folders for Athena partitioning.
- Versioning is enabled and IAM policies scope access per prefix.
- Athena reads the Gold datasets registered in the Glue Data Catalog.

## 4. Kafka and RabbitMQ for Different Messaging Responsibilities

**Status:** Accepted and implemented

**Decision:** Use Apache Kafka for event streaming and RabbitMQ for operational messaging and asynchronous tasks.

**Rationale:** Kafka provides a persistent, replayable event stream for data consumers; RabbitMQ supports operational message delivery, notifications, and background tasks.

**Consequences in the implementation:**

- Marketplace orders stream through Kafka topic `mercaandes.orders.events` (3 partitions, 7-day retention).
- RabbitMQ manages the queues `mercaandes.notifications.purchase`, `mercaandes.promotions.weekly.ingest`, and `mercaandes.alerts.silent-store`, with durability and dead-letter handling documented in the infrastructure repository.
- Both brokers run on the streaming node (`10.0.11.155` private IP).

## 5. Amazon RDS and Athena as Complementary Serving Technologies

**Status:** Accepted and implemented

**Decision:** Use Amazon RDS for PostgreSQL and Amazon Athena for different data-access workloads.

**Rationale:** RDS provides relational access for operational and dashboard consumption; Athena supports SQL over the data lake without competing with transactional workloads.

**Consequences in the implementation:**

- The serving database (`merca_pos`) hosts the transactional POS schemas, the consolidated dimensional model, and the Silver/Gold views.
- Gold exports land in S3 and are cataloged for Athena.

## 6. Containerization and AWS Orchestration

**Status:** Accepted (ADR-013, ADR-016)

**Decision:** Use Docker, Amazon ECR, and Amazon ECS (Fargate) for the customer-facing APIs; EC2 for the batch and streaming nodes.

**Rationale:** Container images standardize packaging and versioned deployments; Fargate removes server management for the APIs, while the stateful orchestrator and brokers benefit from the prediction of dedicated instances.

**Consequences in the implementation:**

- Images are published to 14 ECR repositories, tagged with `latest` + commit SHA.
- The APIs run on Fargate with public IPs behind the ALB security group; Five task definitions registered in the cluster `mercaandes-ecs-cluster`.
- An EKS proof of concept is available for the Sellers API (`eks.tf`) before any future platform migration.

## 7. Data Quality and Late-Event Handling

**Status:** Implemented (RN-10)

**Decision:** Reject marketplace events older than 72 hours, incorporate late events into recalculation, and record per-load quality metrics.

**Rationale:** Duplicated, out-of-order, and late events are produced at the source (the Marketplace API injects duplicates and out-of-order events on demand), so the platform guarantees idempotent pipelines and measurable quality.

**Consequences in the implementation:**

- `public.data_quality_metrics` records are stored in the serving database with the record counts, duplicates, late arrivals, 72-hour rejections, and quality status per load.
- The Gold view `gold.vw_data_quality_dashboard` exposes the rates per source.
- The `hot_inventory_risk` table tracks reconciliation of the streaming micro-batches against the batch results.

## 8. Decision Summary

| Decision                 | Benefit achieved                                                |
| ------------------------ | ---------------------------------------------------------------- |
| Lambda + Medallion       | Separate processing paths and data maturity per layer.           |
| Amazon S3 data lake      | Durable storage for historical and transformed datasets.         |
| Kafka + RabbitMQ         | Independent streaming and operational messaging.                 |
| RDS + Athena             | Relational serving and data lake analytics.                      |
| Docker + ECR + ECS/Fargate | Standardized packaging and managed API deployment.             |
| Private networking + IAM | Controlled access and reduced public exposure.                   |
| Workload isolation       | Batch and streaming run on dedicated nodes with no contention.   |

For the environment configuration and execution instructions, refer to the [Installation and Deployment](/docs/installation-deployment/prerequisites) section.
