---
id: glossary
title: Glossary
sidebar_position: 1
description: Glossary of project terms used across the MercaAndes documentation.
---

# Glossary

| Term | Definition |
|---|---|
| **SKU** | Unique code that identifies a product reference. |
| **Stockout** | Situation in which a product runs out and stops being available for sale. |
| **Inventory coverage** | Number of selling days the available inventory can support. |
| **Seller** | Third-party seller who publishes and sells products on the marketplace. |
| **Omnichannel** | Integration of sales and information across physical and digital channels. |
| **Medallion** | Organization of the data lake in the Bronze, Silver, and Gold layers. |
| **Lambda Architecture** | Processing pattern that combines a batch layer and a speed layer. |
| **Bronze** | Lake layer that conserves original source data in its structure of origin. |
| **Silver** | Lake layer with cleaned, validated, standardized, and deduplicated data. |
| **Gold** | Lake layer with enriched, modeled, and aggregated data prepared for business consumption. |
| **Late event** | Event that arrives after the moment it occurred. |
| **Late-arrival window (72h)** | Tolerance used by the pipelines: events processed after more than 72 hours are rejected (RN-10). |
| **Idempotent** | Property of a process that can run several times without duplicating its result. |
| **Pseudonymization** | Replacement of personal data by identifiers that do not directly reveal the person's identity (RN-11). |
| **DAG** | Directed acyclic graph that represents tasks and dependencies in Apache Airflow. |
| **ADR** | Architecture Decision Record: repository of an architecture decision and its justification. |
| **Serving layer** | PostgreSQL database (`merca_pos`) that hosts the transactional, dimensional, and analytical schemas consumed by the dashboard. |
| **Hot table** | Speed-layer table updated in micro-batches, such as `hot_inventory_risk`. |
| **Reconciliation** | Verification of the streaming counters against the batch results, marked through `is_reconciled`. |
| **Business rule (RN)** | Numbered analytical rule of the business (for example, RN-01 net sales, RN-04 risk, RN-10 quality) implemented in the Gold views and DAGs. |
