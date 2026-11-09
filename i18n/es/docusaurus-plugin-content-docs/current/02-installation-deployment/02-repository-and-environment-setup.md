---
id: repository-and-environment-setup
title: Repositorios y configuración del entorno
sidebar_position: 2
description: Repositorios de MercaAndes, disposición de clonación y el archivo de entorno de infraestructura.
---

# Repositorios y configuración del entorno

## Repositorios

La plataforma se distribuye en los siguientes repositorios de la organización [MercaAndesRiwi](https://github.com/MercaAndesRiwi):

| Repositorio | Rol |
|---|---|
| `Transactional-POS-database` | Modelo transaccional POS: migraciones Alembic y CLI de semillas. |
| `Inventory_Api` | Inventory & Sellers API (F3). |
| `Marketplace_Api` | Marketplace API (F4): generación de eventos, compras simuladas, línea de tiempo de pedidos. |
| `MercaAndes_Mock_Inventory_API` | API mock de inventario de sellers que simula el flujo de inventario tercerizado. |
| `api-exchange-rates` | Servicio de ingesta de tasas de cambio (Frankfurter). |
| `api-holidays` | Servicio de ingesta de festivos (Nager.Date). |
| `MercaAndes_Spark_Gold_Transformations` | Transformaciones Gold en PySpark: seller score, riesgo de inventario en caliente, ventas netas. |
| `MercaAndes_Documentation` | Este sitio de documentación. |

Para ejecutar la plataforma local completa, el repositorio `infrastructure_MercAndes` es el único clon obligatorio: su Docker Compose compila y ejecuta la base de datos POS, los contenedores de semillas y las APIs. Clona el repositorio vecino de los demás para que las rutas relativas (por ejemplo, el contexto de build de `Marketplace_Api`) se resuelvan correctamente.

```powershell
git clone https://github.com/MercaAndesRiwi/infrastructure_MercAndes
cd infrastructure_MercAndes
```

## Configura el entorno de infraestructura

Desde la raíz de `infrastructure_MercAndes`, crea el archivo de entorno local:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y reemplaza los valores de plantilla por las credenciales que vas a usar. El archivo de ejemplo es una plantilla; el `.env` real es local y no debe subirse al repositorio.

Los grupos principales de configuración son:

- **PostgreSQL:** `POS_DB_HOST`, `POS_DB_PORT`, `POS_DB_NAME`, `POS_DB_USER`, `POS_DB_PASSWORD`. Para el Compose local usa `POS_DB_HOST=postgres`, `POS_DB_USER=merca_admin` y `POS_DB_NAME=merca_pos`.
- **Airflow:** base de datos de metadatos (`AIRFLOW_DB_NAME`, `AIRFLOW_DB_USER`, `AIRFLOW_DB_PASSWORD`) y el usuario web (`AIRFLOW_ADMIN_USER`, `AIRFLOW_ADMIN_PASSWORD`).
- **RabbitMQ y Kafka:** `RABBITMQ_HOST` y `KAFKA_BOOTSTRAP_SERVERS` apuntan por defecto al nodo de streaming desplegado (IP privada `10.0.11.155`). Para ejecutar los brokers localmente usa el perfil Compose `local-streaming` (ver Arrancar la plataforma local) y define `RABBITMQ_HOST=rabbitmq` y `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`. El stack crea los tópics y declara las colas: `mercaandes.orders.events`, `mercaandes.promotions.weekly`, `mercaandes.notifications.purchase`, `mercaandes.promotions.weekly.ingest` y `mercaandes.alerts.silent-store`.
- **Semillas:** `POS_SEED`, `POS_MODE`, `MASTER_SEED`, `CATALOG_PER_CATEGORY`, `SEED_SALES_PER_COUNTRY`, `SEED_CUSTOMERS`, `SEED_BATCH_SIZE`.
- **Puertos de servicios:** `POS_API_PORT` (8001), `INVENTORY_API_PORT` (8002), `MARKETPLACE_API_PORT` (8003), `F7_WEEKLY_PROMOTIONS_API_PORT` (8004), `REPORTS_API_PORT` (8005), más los puertos de consola de Airflow (8080), Flower (5555), Spark (8081), Kafka UI (9000) y RabbitMQ (15672).
- **Lago S3:** `S3_DATA_LAKE_BUCKET_NAME` y los nombres de carpetas Bronze/Silver/Gold usados por los DAGs que exportan a S3.
- **Notificaciones por correo (opcional):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`. Deja `SMTP_HOST` vacío para correr el notification worker en modo dry-run (los mensajes se registran en logs en lugar de enviarse).

Para un despliegue en AWS, el archivo también admite el endpoint RDS en `POS_DB_HOST`, credenciales IAM en `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` y `AWS_DEFAULT_REGION=us-east-1`.

No subas archivos `.env` ni credenciales reales al control de versiones.
