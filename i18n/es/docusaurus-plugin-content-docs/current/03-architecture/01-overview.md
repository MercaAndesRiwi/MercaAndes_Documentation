---
title: Visión general de la arquitectura
description: Patrones, capas y flujo general de datos de MercaAndes.
---

# Visión general de la arquitectura

## 1. Resumen

MercaAndes está concebida como una plataforma de datos que integra y procesa información de varias fuentes para apoyar el análisis de ventas, inventario y marketplace en distintos países.

La arquitectura combina los patrones **Lambda** y **Medallion**. Lambda separa el procesamiento histórico por lotes del procesamiento de eventos casi en tiempo real; Medallion organiza los datos según su nivel de transformación y calidad. La infraestructura utiliza servicios de AWS y cargas contenerizadas para ingesta, procesamiento, orquestación, almacenamiento y análisis.

> **Estado de arquitectura:** este documento describe la arquitectura aprobada. El estado real de despliegue se indica por componente y debe sustentarse con evidencia de AWS.

## 2. Diagrama de arquitectura

El diagrama presenta las fuentes, capas de procesamiento, almacenamiento y consumo analítico.

![Diagrama general de la arquitectura de MercaAndes](image/overview/1792105168989.jpg)

El flujo conecta la ingesta con la transformación, el almacenamiento y el consumo, manteniendo separadas las responsabilidades de cada capa.

## 3. Patrones arquitectónicos

### 3.1. Arquitectura Lambda

Lambda contempla dos rutas lógicas de procesamiento.

**Capa batch:** procesa datos históricos mediante flujos programados. Apache Airflow coordina las ejecuciones y Apache Spark realiza las transformaciones y el procesamiento por lotes.

**Capa de velocidad:** procesa eventos entrantes para ofrecer visibilidad operativa casi en tiempo real. Apache Kafka distribuye eventos, RabbitMQ gestiona mensajería operativa y Spark Streaming procesa flujos en micro lotes.

### 3.2. Arquitectura Medallion

El patrón Medallion organiza los datos del lago en tres niveles:

| Capa | Propósito |
|---|---|
| Bronze | Conserva los datos recibidos de las fuentes, con mínima transformación. |
| Silver | Guarda datos limpios, validados, estandarizados y sin duplicados. |
| Gold | Contiene datos enriquecidos, modelados y agregados para el negocio. |

La progresión entre capas facilita el control de calidad y la trazabilidad desde los datos de origen hasta la información lista para análisis.

## 4. Capas principales

### 4.1. Fuentes e ingesta

La plataforma integra conjuntos históricos, APIs externas y fuentes comerciales simuladas. Incluye ventas POS, funcionalidades de inventario, eventos de marketplace y datos complementarios, como tasas de cambio, festivos y promociones.

Los procesos de ingesta recopilan y cargan la información necesaria para el procesamiento posterior.

### 4.2. Procesamiento y orquestación

- **Apache Airflow** define, programa y supervisa los flujos de trabajo.
- **Apache Spark** ejecuta transformaciones de datos.
- **Apache Kafka** transporta eventos.
- **RabbitMQ** distribuye mensajes operativos asíncronos.
- **Spark Streaming** procesa flujos entrantes en micro lotes.

### 4.3. Almacenamiento y servicio

**Amazon S3** almacena el lago de datos en las capas Bronze, Silver y Gold.

**Amazon RDS para PostgreSQL** ofrece almacenamiento relacional para datos estructurados de servicio y consumo operativo.

**Amazon Athena** permite ejecutar consultas SQL sobre conjuntos almacenados en S3.

### 4.4. Analítica y consumo

La arquitectura propone **Power BI** para tableros e informes ejecutivos y **Metabase** para exploración y consultas ad hoc. El acceso de cada herramienta depende de que la fuente de datos y sus permisos estén configurados.

## 5. Infraestructura y seguridad

El diseño usa servicios de AWS para aislar las cargas y controlar el acceso:

- **Amazon VPC** proporciona una red aislada.
- **Subredes públicas y privadas** separan los recursos expuestos a internet de los servicios internos y de datos.
- **AWS IAM** gestiona permisos con el principio de privilegio mínimo.
- **Security Groups** limitan las comunicaciones entre recursos.
- **Amazon ECR** almacena imágenes privadas de contenedores.
- **Amazon ECS** coordina cargas contenerizadas.
- **Amazon EC2 y AWS Fargate** aportan capacidad de cómputo para cargas designadas.

El diseño ubica los servicios internos de procesamiento y las bases de datos en segmentos privados, con acceso controlado entre componentes.

## 6. Flujo general de datos

1. Los simuladores y las fuentes externas generan o proporcionan datos.
2. Los procesos de ingesta recopilan y validan la información recibida.
3. Los componentes batch y de streaming procesan los datos según su flujo.
4. Amazon S3 almacena los conjuntos en las capas Bronze, Silver y Gold.
5. Amazon RDS para PostgreSQL y Athena permiten consultar datos relacionales y del lago.
6. Power BI y Metabase consumen información para análisis e informes.

La secuencia exacta, los protocolos y las dependencias deben documentarse por cada integración implementada.

## 7. Estado de implementación

Esta página describe el diseño arquitectónico; no implica que todos sus componentes estén desplegados ni integrados. Consulta [Infraestructura y arquitectura de despliegue](03-infrastructure.md) para las fases aceptadas y las verificaciones registradas. Mantén el estado actualizado con evidencia de AWS.

## 8. Documentación relacionada

- [Componentes de arquitectura](02-components.md)
- [Decisiones técnicas](04-technical-decisions.md)
- [IAM y seguridad](05-iam-security.md)
