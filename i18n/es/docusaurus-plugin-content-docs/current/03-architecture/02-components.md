---
title: Componentes de arquitectura
description: Responsabilidades e interacciones entre fuentes, procesamiento, almacenamiento y consumo analítico.
---

# Componentes de arquitectura

## 1. Resumen

La arquitectura objetivo de MercaAndes combina fuentes de datos, servicios de procesamiento, almacenamiento, mensajería y herramientas analíticas. Cada componente cumple una responsabilidad dentro de la plataforma.

## 2. Fuentes de datos e ingesta

### 2.1. Simulador de ventas POS (F2)

El simulador POS genera datos reproducibles de ventas para los países operativos. Sus registros pueden poblar las bases transaccionales por país y alimentar procesos posteriores.

### 2.2. Simulador de inventario (F3)

El simulador de inventario ofrece funcionalidades mediante APIs simuladas y cálculos de existencias basados en catálogo.

### 2.3. Eventos de marketplace (F4)

El componente de marketplace representa el ciclo de vida de un pedido: creación, pago, despacho, entrega, cancelación y devolución. Estos eventos alimentan el procesamiento orientado a eventos.

### 2.4. Ingesta de datos complementarios

- **Tasas de cambio:** información histórica obtenida de la API Frankfurter.
- **Festivos:** información obtenida de Nager.Date.
- **Promociones:** datos semanales cargados desde archivos Excel después de su validación.

## 3. Capa batch

**Apache Airflow** define, programa y supervisa DAGs y dependencias. **Apache Spark** ejecuta trabajos de procesamiento histórico y transformaciones. **Amazon S3** almacena los datos del lago en las capas Medallion.

## 4. Capa de velocidad

**Apache Kafka** recibe y distribuye flujos de eventos; su registro persistente permite reproducirlos cuando se requiere reprocesamiento.

**RabbitMQ** gestiona mensajes operativos, tareas asíncronas y notificaciones. Su responsabilidad es distinta de la distribución de eventos de Kafka.

**Spark Streaming** procesa eventos entrantes en micro lotes y permite compartir lógica de procesamiento cuando resulta apropiado.

## 5. Capa de servicio

**Amazon RDS para PostgreSQL** sirve datos relacionales y agregados para consumo operativo. El diseño ubica la base de datos en subredes privadas.

**Amazon Athena** ejecuta consultas SQL serverless sobre los datos almacenados en Amazon S3 y complementa la base relacional.

## 6. Capa analítica

**Power BI** respalda tableros de inteligencia de negocio e informes ejecutivos. **Metabase** permite explorar datos y ejecutar consultas ad hoc. El diseño propone utilizar RDS para datos curados y Athena para exploración sobre el lago.

## 7. Componentes de infraestructura

- **Amazon VPC y Security Groups:** aíslan la red y controlan el tráfico entre recursos.
- **AWS IAM:** administra permisos de usuarios, servicios y cargas de trabajo.
- **Docker y Amazon ECR:** empaquetan aplicaciones y almacenan sus imágenes privadas.
- **Amazon ECS, EC2 y Fargate:** coordinan y ejecutan las cargas contenerizadas según su necesidad.

## 8. Interacción entre componentes

1. Los simuladores, conjuntos históricos y fuentes externas aportan los datos.
2. Los componentes de ingesta recopilan y validan la información.
3. Los flujos batch y consumidores de eventos procesan los datos por sus respectivas rutas.
4. Amazon S3 conserva los datos del lago en las capas Medallion.
5. RDS y Athena ofrecen acceso a datos relacionales y del lago.
6. Power BI y Metabase utilizan los conjuntos disponibles para informes y análisis.

Los protocolos, las conexiones, el despliegue y las dependencias concretas se deben mantener documentados a medida que se integren y verifiquen los servicios.

## 9. Estado de implementación

Esta página describe responsabilidades previstas; no confirma por sí sola que cada componente esté desplegado o integrado. Consulta [Infraestructura y arquitectura de despliegue](03-infrastructure.md) para el plan aceptado y el estado de verificación registrado.

## 10. Documentación relacionada

- [Visión general de la arquitectura](01-overview.md)
- [Infraestructura y arquitectura de despliegue](03-infrastructure.md)
- [Decisiones técnicas](04-technical-decisions.md)
