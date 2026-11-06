---
title: Decisiones técnicas
description: Decisiones arquitectónicas aceptadas, fundamentos y consecuencias para MercaAndes.
---

# Decisiones técnicas

## 1. Propósito

Esta página resume las decisiones de arquitectura documentadas para MercaAndes, su fundamento y sus consecuencias.

Las decisiones corresponden al documento de arquitectura aceptado el 4 de octubre de 2026 y al plan de infraestructura aceptado el 9 de octubre de 2026. Registran el diseño aprobado, pero no confirman por sí solas la implementación de cada componente.

## 2. Lambda combinada con Medallion

**Estado:** Aceptada

**Decisión:** combinar la arquitectura Lambda con la organización Medallion.

**Fundamento:** Lambda separa el procesamiento histórico por lotes del procesamiento de eventos casi en tiempo real. Medallion organiza los datos en Bronze, Silver y Gold para reflejar mejoras progresivas de calidad y transformaciones orientadas al negocio.

**Consecuencias:**

- Las cargas históricas y de streaming tienen responsabilidades diferenciadas.
- Las capas Bronze, Silver y Gold representan la madurez de los datos.
- Es necesario coordinar la lógica y consistencia entre las rutas batch y de streaming.

## 3. Amazon S3 como lago de datos

**Estado:** Aceptada

**Decisión:** utilizar Amazon S3 para almacenar datos en las capas Bronze, Silver y Gold.

**Fundamento:** S3 proporciona almacenamiento de objetos durable y escalable para información histórica y conjuntos analíticos.

**Consecuencias:**

- Los datos originales y transformados se pueden organizar por capa.
- Las herramientas analíticas pueden consultar los conjuntos compatibles mediante Athena.
- La implementación debe definir formatos, particionamiento, políticas de ciclo de vida y permisos.

## 4. Kafka y RabbitMQ con responsabilidades distintas

**Estado:** Aceptada

**Decisión:** utilizar Apache Kafka para el flujo de eventos y RabbitMQ para mensajería operativa y tareas asíncronas.

**Fundamento:** Kafka ofrece un flujo persistente para consumidores de datos; RabbitMQ gestiona entregas operativas, procesos de fondo y notificaciones de control.

**Consecuencias:**

- El streaming y la mensajería operativa tienen responsabilidades separadas.
- Cada productor y consumidor debe conectarse al sistema de mensajería que corresponda.
- Se deben definir monitoreo, reintentos, manejo de errores y garantías de procesamiento.

## 5. Amazon RDS y Athena como servicios complementarios

**Estado:** Aceptada

**Decisión:** utilizar Amazon RDS para PostgreSQL y Amazon Athena en cargas de acceso distintas.

**Fundamento:** RDS ofrece acceso relacional a datos estructurados para consumo operativo y de negocio. Athena ejecuta consultas SQL directamente sobre los datos almacenados en S3, separando las consultas analíticas grandes de las cargas transaccionales.

**Consecuencias:**

- Los datos relacionales curados pueden servirse mediante PostgreSQL.
- Los conjuntos compatibles del lago pueden explorarse con Athena.
- Se deben configurar sincronización, definiciones de tablas, rendimiento y permisos.

## 6. Contenedores y orquestación AWS

**Estado:** Aceptada

**Decisión:** utilizar Docker, Amazon ECR y Amazon ECS como parte de la estrategia de despliegue de contenedores.

**Fundamento:** las imágenes estandarizan el empaquetado de aplicaciones y permiten despliegues versionados. ECR almacena las imágenes y ECS administra las cargas compatibles.

**Consecuencias:**

- Las aplicaciones y los trabajos requieren imágenes y definiciones de tareas mantenidas.
- La configuración de despliegue y los secretos deben gestionarse aparte de las imágenes.
- Los servicios pertinentes necesitan health checks, logs, monitoreo y políticas de escalamiento.

## 7. Red privada y privilegio mínimo

**Estado:** Aceptada

**Decisión:** aislar los servicios internos de procesamiento y datos en segmentos privados y controlar el acceso con IAM y Security Groups.

**Fundamento:** el diseño de red busca reducir la exposición pública y restringir la comunicación a los servicios autorizados.

**Consecuencias:**

- Las cargas privadas necesitan rutas y conectividad adecuadas para sus dependencias externas.
- Los Security Groups deben permitir únicamente las comunicaciones requeridas.
- Cada rol IAM debe tener solo los permisos necesarios para su carga.
- Se deben validar accesos administrativos y de aplicación sin exponer bases de datos ni mensajería a internet.

## 8. Aislamiento de cargas de trabajo

**Estado:** Aceptada

**Decisión:** separar las cargas según sus responsabilidades de procesamiento y necesidades de recursos.

**Fundamento:** el procesamiento histórico puede consumir mucha CPU y memoria, mientras que el streaming y la mensajería requieren disponibilidad sostenida y procesamiento predecible. Separar las cargas batch y de streaming ayuda a reducir la competencia por recursos.

**Consecuencias:**

- La capacidad de cómputo debe planificarse según cada tipo de carga.
- Se deben validar recursos y políticas de escalamiento con cargas realistas.
- La topología final debe especificar qué servicios se ejecutan en EC2, ECS o Fargate.

## 9. Resumen de decisiones

| Decisión | Beneficio |
|---|---|
| Lambda + Medallion | Separa rutas de procesamiento y organiza la madurez de los datos. |
| Lago de datos en S3 | Conserva conjuntos históricos y transformados. |
| Kafka + RabbitMQ | Separa el streaming de eventos de la mensajería operativa. |
| RDS + Athena | Atiende consultas relacionales y analíticas del lago. |
| Docker + ECR + ECS | Estandariza el empaquetado y el despliegue. |
| Red privada + IAM | Controla el acceso y reduce la exposición pública. |
| Aislamiento de cargas | Reduce la competencia entre responsabilidades de procesamiento. |
