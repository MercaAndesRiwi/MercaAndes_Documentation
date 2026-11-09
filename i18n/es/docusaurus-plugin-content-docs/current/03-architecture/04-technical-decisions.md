# Decisiones técnicas

## 1. Propósito

Esta página registra las decisiones arquitectónicas principales documentadas para MercaAndes, con su razón y sus consecuencias. El documento de arquitectura aceptado data del 4 de octubre de 2026 y el plan de despliegue de infraestructura del 9 de octubre de 2026. Los registros de ingeniería detallados viven en la carpeta `infrastructure_MercAndes/docs` (ADR-013 definiciones de tareas Fargate, ADR-014 capa de servicio RDS, ADR-016 Fargate vs EKS, además de las notas de Kafka, RabbitMQ y manejo de eventos tardíos).

## 2. Arquitectura Lambda combinada con Medallón

**Estado:** Aceptada e implementada

**Decisión:** Combinar Arquitectura Lambda con el patrón de organización Medallón.

**Razón:** El enfoque Lambda separa el procesamiento histórico del procesamiento de eventos casi en tiempo real, para que la plataforma cubra tanto las transformaciones históricas completas como la ingesta continua de eventos. El patrón Medallón organiza los datos en capas Bronze, Silver y Gold para soportar mejoras progresivas de calidad y transformaciones orientadas al negocio.

**Consecuencias en la implementación:**

- Los workloads batch y streaming corren en nodos separados (nodo batch vs nodo streaming).
- La madurez de los datos se representa dos veces: en S3 (lago) y en PostgreSQL (`silver`/`gold`).
- La cadena batch está implementada por el conjunto de DAGs; la capa de velocidad por los consumidores de Kafka.

## 3. Amazon S3 como lago de datos

**Estado:** Aceptada e implementada

**Decisión:** Usar Amazon S3 para almacenar los datos en las capas Bronze, Silver y Gold.

**Razón:** S3 provee almacenamiento de objetos duradero y escalable para datasets históricos y analíticos.

**Consecuencias en la implementación:**

- El bucket contiene los prefijos `bronze/`, `silver/` y `gold/`, con las exportaciones Gold escritas como carpetas `gold/{table}/{table}.csv` para el particionamiento de Athena.
- El versioning está habilitado y las políticas IAM acotan el acceso por prefijo.
- Athena lee los datasets Gold registrados en el Glue Data Catalog.

## 4. Kafka y RabbitMQ con responsabilidades de mensajería distintas

**Estado:** Aceptada e implementada

**Decisión:** Usar Apache Kafka para el streaming de eventos y RabbitMQ para la mensajería operativa y las tareas asíncronas.

**Razón:** Kafka provee un stream de eventos persistente y reproducible para los consumidores de datos; RabbitMQ soporta la entrega de mensajes operativos, notificaciones y tareas en segundo plano.

**Consecuencias en la implementación:**

- Los pedidos del marketplace fluyen por el tópic Kafka `mercaandes.orders.events` (3 particiones, retención de 7 días).
- RabbitMQ gestiona las colas `mercaandes.notifications.purchase`, `mercaandes.promotions.weekly.ingest` y `mercaandes.alerts.silent-store`, con durabilidad y manejo de dead-letter documentado en el repositorio de infraestructura.
- Ambos brokers corren en el nodo streaming (IP privada `10.0.11.155`).

## 5. Amazon RDS y Athena como tecnologías de servicio complementarias

**Estado:** Aceptada e implementada

**Decisión:** Usar Amazon RDS para PostgreSQL y Amazon Athena para workloads de acceso a datos distintos.

**Razón:** RDS provee acceso relacional para el consumo operativo y de tablero; Athena soporta SQL sobre el lago sin competir con las cargas transaccionales.

**Consecuencias en la implementación:**

- La base de servicio (`merca_pos`) aloja los esquemas POS transaccionales, el modelo dimensional consolidado y las vistas Silver/Gold.
- Las exportaciones Gold aterrizan en S3 y se catalogan para Athena.

## 6. Contenerización y orquestación AWS

**Estado:** Aceptada (ADR-013, ADR-016)

**Decisión:** Usar Docker, Amazon ECR y Amazon ECS (Fargate) para las APIs orientadas al cliente; EC2 para los nodos batch y streaming.

**Razón:** Las imágenes de contenedores estandarizan el empaquetado y los despliegues versionados; Fargate elimina la administración de servidores para las APIs, mientras el orquestador con estado y los brokers se benefician del rendimiento predecible de instancias dedicadas.

**Consecuencias en la implementación:**

- Las imágenes se publican en 14 repositorios ECR, etiquetadas con `latest` + SHA del commit.
- Las APIs corren en Fargate con IP pública detrás del security group del ALB; hay cinco task definitions registradas en el cluster `mercaandes-ecs-cluster`.
- Hay una prueba de concepto EKS disponible para la Sellers API (`eks.tf`) antes de cualquier migración futura de plataforma.

## 7. Calidad de datos y manejo de eventos tardíos

**Estado:** Implementada (RN-10)

**Decisión:** Rechazar los eventos de marketplace mayores a 72 horas, incorporar los eventos tardíos al recálculo y registrar métricas de calidad por carga.

**Razón:** Se generan eventos duplicados, fuera de orden y tardíos en la fuente (la Marketplace API inyecta duplicados y eventos fuera de orden a demanda), así que la plataforma garantiza pipelines idempotentes y calidad medible.

**Consecuencias en la implementación:**

- `public.data_quality_metrics` registra por carga los conteos de procesados, duplicados, tardíos incorporados, rechazos de más de 72 horas y el estado de calidad.
- La vista Gold `gold.vw_data_quality_dashboard` expone las tasas por fuente.
- La tabla `hot_inventory_risk` marca la reconciliación de los microlotes streaming frente a los resultados batch.

## 8. Resumen de decisiones

| Decisión                 | Beneficio obtenido                          |
| ------------------------ | -------------------------------------------- |
| Lambda + Medallón        | Rutas de procesamiento separadas y madurez de datos por capa. |
| Lago de datos en S3      | Almacenamiento durable para datasets históricos y transformados. |
| Kafka + RabbitMQ         | Streaming y mensajería operativa independientes. |
| RDS + Athena             | Servicio relacional y analítica sobre el lago. |
| Docker + ECR + ECS/Fargate | Empaquetado estandarizado y despliegue gestionado de APIs. |
| Red privada + IAM        | Acceso controlado y menor exposición pública. |
| Aislamiento de workloads | Batch y streaming en nodos dedicados sin contención. |

Para la configuración del entorno y las instrucciones de ejecución, consulta la sección de [Instalación y despliegue](/docs/installation-deployment/prerequisites).
