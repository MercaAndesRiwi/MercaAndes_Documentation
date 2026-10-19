# Architecture Components

## 1. Overview

The MercaAndes target architecture is composed of data sources, processing services, storage systems, messaging infrastructure, and analytical tools.

Each component has a defined responsibility within the data platform. Their integration supports historical processing, event-driven processing, data storage, and business analytics.

## 2. Data Sources and Ingestion

### 2.1. POS Sales Simulator (F2)

The POS Sales Simulator generates reproducible point-of-sale sales data for the operational countries.

Its purpose is to provide sales records that can be used to populate the country's transactional databases and support downstream processing.

### 2.2. Inventory Simulator (F3)

The Inventory Simulator provides inventory-related functionality through simulated APIs and catalog-based stock calculations.

It supports the generation and consultation of inventory information within the project.

### 2.3. Marketplace Events (F4)

The marketplace component represents order lifecycle events, including order creation, payment, shipment, delivery, cancellation, and returns.

These events are relevant to the target event-streaming architecture.

### 2.4. Supporting Data Ingestion

Supporting datasets provide additional context for commercial analysis.

The project materials identify the following ingestion processes:

- **Exchange rates:** historical exchange-rate information obtained from the Frankfurter API.
- **Public holidays:** holiday information obtained from the Nager.Date API.
- **Promotions:** weekly promotion data loaded from Excel files after validation.

## 3. Batch Layer

The Batch Layer processes historical data through scheduled workflows.

### Apache Airflow

Apache Airflow is the target workflow orchestration tool. It defines, schedules, and monitors DAGs and their dependencies.

### Apache Spark

Apache Spark executes data-processing jobs over historical datasets.

It is intended to support transformations across the Bronze, Silver, and Gold data layers.

### Amazon S3

Amazon S3 provides the storage foundation for the data lake. It stores datasets as they progress through the Medallion layers.

## 4. Speed Layer

The Speed Layer supports continuous event ingestion and near-real-time processing.

### Apache Kafka

Apache Kafka serves as the event-streaming backbone. It receives and distributes event data to downstream consumers.

Its persistent event log supports replaying events when reprocessing is required.

### RabbitMQ

RabbitMQ handles operational messaging and asynchronous tasks. The target design separates these responsibilities from Kafka's event-streaming role.

The architecture also proposes using RabbitMQ for operational notifications and background tasks.

### Spark Streaming

Spark Streaming processes incoming event streams in micro-batches.

The target design aims to reuse processing logic where appropriate between batch and streaming workloads.

## 5. Serving Layer

### Amazon RDS for PostgreSQL

Amazon RDS for PostgreSQL is intended to serve structured relational data and aggregated datasets for operational consumption.

The target infrastructure places the database in private data subnets.

### Amazon Athena

Amazon Athena provides serverless SQL queries over datasets stored in Amazon S3.

It complements the relational serving database by supporting analytical queries directly over data lake storage.

## 6. Analytics Layer

### Power BI

Power BI supports business intelligence dashboards, executive reporting, and analysis of business metrics.

The target architecture proposes using RDS for curated data and Athena for exploratory analysis over the data lake.

### Metabase

Metabase provides an interface for data exploration and ad hoc queries, making analytical information accessible to business users.

## 7. Infrastructure Components

### Amazon VPC and Security Groups

Amazon VPC provides network isolation. Public and private subnets separate internet-facing resources from internal processing and data services.

Security Groups control communication between resources.

### AWS IAM

AWS IAM manages permissions for services and workloads. The design follows the principle of least privilege.

### Docker and Amazon ECR

Docker packages applications and processing jobs into containers. Amazon ECR stores private container images used by the deployment infrastructure.

### Amazon ECS, EC2, and Fargate

Amazon ECS orchestrates containerized workloads. Amazon EC2 provides compute capacity for designated workloads, while AWS Fargate is planned for supported container services that do not require direct server management.

## 8. Component Interactions

The target architecture follows this general interaction sequence:

1. Simulators, historical datasets, and external sources provide data.
2. Ingestion components collect and validate source information.
3. Batch workflows and streaming consumers process data through their respective execution paths.
4. Amazon S3 stores data lake datasets across the Medallion layers.
5. Amazon RDS and Athena provide access to structured and lake-based data.
6. Power BI and Metabase consume datasets for reporting and analysis.

The exact connections, protocols, deployment configurations, and execution dependencies must be documented as each integration is implemented and verified.

## 9. Implementation Status

This page describes the responsibilities of components in the target architecture. It does not imply that every component is deployed or fully integrated.

The implementation status should be maintained alongside the development and deployment records.

For infrastructure details, see [Infrastructure and Deployment](docs/03-architecture/03-infrastructure.md). For the rationale behind the architecture, see [Technical Decisions](docs/03-architecture/04-technical-decisions.md).
