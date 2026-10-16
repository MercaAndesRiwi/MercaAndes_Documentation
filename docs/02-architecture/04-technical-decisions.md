# Technical Decisions

## 1. Purpose

This page records the main architectural decisions documented for MercaAndes, including their rationale and intended consequences.

The decisions are based on the architecture document accepted on October 4, 2026, and the infrastructure deployment plan accepted on October 9, 2026.

These records describe the approved design. They do not independently confirm that every decision has been implemented.

## 2. Lambda Architecture Combined with Medallion

**Status:** Accepted

**Decision:** Combine Lambda Architecture with the Medallion data organization pattern.

**Rationale:**

The Lambda approach separates historical batch processing from near-real-time event processing. This allows the platform to address both comprehensive historical transformations and continuous event ingestion.

The Medallion pattern organizes data into Bronze, Silver, and Gold layers to support progressive data quality improvements and business-oriented transformations.

**Consequences:**

- Historical and streaming workloads have separate processing responsibilities.
- Data maturity can be represented through the Bronze, Silver, and Gold layers.
- Processing logic and consistency between batch and streaming paths require appropriate coordination.

## 3. Amazon S3 as the Data Lake

**Status:** Accepted

**Decision:** Use Amazon S3 to store data across the Bronze, Silver, and Gold layers.

**Rationale:**

S3 provides durable, scalable object storage for historical data and analytical datasets.

**Consequences:**

- Raw and transformed datasets can be organized by processing layer.
- Analytical tools can query supported datasets through Athena.
- Data formats, partitioning, lifecycle policies, and access permissions must be defined as part of implementation.

## 4. Kafka and RabbitMQ for Different Messaging Responsibilities

**Status:** Accepted

**Decision:** Use Apache Kafka for event streaming and RabbitMQ for operational messaging and asynchronous tasks.

**Rationale:**

Kafka provides a persistent event-streaming platform for data consumers. RabbitMQ supports operational message delivery, background tasks, and system-control notifications.

**Consequences:**

- Streaming and operational messaging have separate responsibilities.
- Producers and consumers must be configured for the appropriate messaging system.
- Monitoring, retries, error handling, and message-processing guarantees must be defined for each integration.

## 5. Amazon RDS and Athena as Complementary Serving Technologies

**Status:** Accepted

**Decision:** Use Amazon RDS for PostgreSQL and Amazon Athena for different data-access workloads.

**Rationale:**

RDS provides relational access to structured data intended for operational and business consumption. Athena supports SQL queries directly over datasets in Amazon S3.

This separation is intended to reduce competition between transactional database workloads and large analytical queries.

**Consequences:**

- Curated relational datasets can be served through PostgreSQL.
- Supported data lake datasets can be explored through Athena.
- Data synchronization, table definitions, query performance, and access permissions must be configured appropriately.

## 6. Containerization and AWS Orchestration

**Status:** Accepted

**Decision:** Use Docker, Amazon ECR, and Amazon ECS as part of the container deployment strategy.

**Rationale:**

Container images standardize application packaging and allow versioned deployments. ECR stores the images, while ECS manages supported container workloads.

**Consequences:**

- Applications and jobs require maintained container images and task definitions.
- Deployment configuration and secrets must be managed separately from application images.
- Health checks, logging, monitoring, and scaling policies must be configured for the relevant services.

## 7. Private Networking and Least-Privilege Access

**Status:** Accepted

**Decision:** Isolate internal processing and database resources in private network segments and control access through IAM and Security Groups.

**Rationale:**

The network design aims to reduce public exposure and restrict communication to authorized services.

**Consequences:**

- Private workloads require appropriate routes and connectivity to external dependencies.
- Security Groups must permit only the required communication paths.
- IAM roles should grant only the permissions needed by each workload.
- Administrative and application access must be validated without exposing internal databases or messaging services publicly.

## 8. Workload Isolation

**Status:** Accepted in the target design

**Decision:** Separate workloads according to their processing responsibilities and resource requirements.

**Rationale:**

Historical processing can consume substantial CPU and memory, while streaming and messaging services require sustained availability and predictable processing.

The architecture proposes separating batch and streaming responsibilities to reduce resource contention.

**Consequences:**

- Compute capacity must be planned for the different workload types.
- Resource allocation and scaling policies require validation under realistic workloads.
- The final deployment topology must specify which services run on EC2, ECS-managed capacity, or Fargate.

## 9. Decision Summary

| Decision                 | Intended benefit                                                |
| ------------------------ | --------------------------------------------------------------- |
| Lambda + Medallion       | Separate processing paths and organize data maturity.           |
| Amazon S3 data lake      | Store historical and transformed datasets.                      |
| Kafka + RabbitMQ         | Separate event streaming from operational messaging.            |
| RDS + Athena             | Support relational serving and data lake analytics.             |
| Docker + ECR + ECS       | Standardize packaging and deployment.                           |
| Private networking + IAM | Control access and reduce public exposure.                      |
| Workload isolation       | Reduce resource contention between processing responsibilities. |
