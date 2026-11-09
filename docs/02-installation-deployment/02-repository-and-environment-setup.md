# Repository and Environment Setup

## Repositories

The platform is split across the following repositories of the [MercaAndesRiwi](https://github.com/MercaAndesRiwi) organization:

| Repository                                | Role                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `Transactional-POS-database`            | POS transactional model: Alembic migrations and the seeding CLI.             |
| `Inventory_Api`                         | Inventory & Sellers API (F3).                                                |
| `Marketplace_Api`                       | Marketplace API (F4): event generation, simulated purchases, order timeline. |
| `MercaAndes_Mock_Inventory_API`         | Mock seller-inventory API used to simulate the third-party inventory feed.   |
| `api-exchange-rates`                    | Exchange-rate ingestion service (Frankfurter).                               |
| `api-holidays`                          | Holiday ingestion service (Nager.Date).                                      |
| `MercaAndes_Spark_Gold_Transformations` | PySpark Gold transformations: seller score, hot inventory risk, net sales.   |
| `MercaAndes_Documentation`              | This documentation site.                                                     |

To run the complete local platform, the `infrastructure_MercAndes` repository is the only mandatory clone: its Docker Compose builds and runs the POS database, the seed containers, and the APIs. Clone the repository as a sibling of the others so that relative contexts (for example, the `Marketplace_Api` build context) resolve correctly.

```powershell
git clone https://github.com/MercaAndesRiwi/infrastructure_MercAndes
cd infrastructure_MercAndes
```

## Configure the infrastructure environment

From the root of `infrastructure_MercAndes`, create the local environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace the placeholder values with the credentials you intend to use. The example file is a template; the real `.env` is local and must not be committed.

The main configuration groups are:

- **PostgreSQL:** `POS_DB_HOST`, `POS_DB_PORT`, `POS_DB_NAME`, `POS_DB_USER`, `POS_DB_PASSWORD`. For local Compose, use `POS_DB_HOST=postgres`, `POS_DB_USER=merca_admin`, and `POS_DB_NAME=merca_pos`.
- **Airflow:** metadata database (`AIRFLOW_DB_NAME`, `AIRFLOW_DB_USER`, `AIRFLOW_DB_PASSWORD`) and the web user (`AIRFLOW_ADMIN_USER`, `AIRFLOW_ADMIN_PASSWORD`).
- **RabbitMQ and Kafka:** `RABBITMQ_HOST` and `KAFKA_BOOTSTRAP_SERVERS` default to the deployed streaming node (`10.0.11.155`, private IP). To run both brokers locally, use the Compose profile `local-streaming` (see Start the Local Platform) and set `RABBITMQ_HOST=rabbitmq` and `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`. The stack creates the topics and declares the queues: `mercaandes.orders.events`, `mercaandes.promotions.weekly`, `mercaandes.notifications.purchase`, `mercaandes.promotions.weekly.ingest`, and `mercaandes.alerts.silent-store`.
- **Seeds:** `POS_SEED`, `POS_MODE`, `MASTER_SEED`, `CATALOG_PER_CATEGORY`, `SEED_SALES_PER_COUNTRY`, `SEED_CUSTOMERS`, `SEED_BATCH_SIZE`.
- **Service ports:** `POS_API_PORT` (8001), `INVENTORY_API_PORT` (8002), `MARKETPLACE_API_PORT` (8003), `F7_WEEKLY_PROMOTIONS_API_PORT` (8004), `REPORTS_API_PORT` (8005), plus the console ports for Airflow (8080), Flower (5555), Spark (8081), Kafka UI (9000), and RabbitMQ (15672).
- **S3 data lake:** `S3_DATA_LAKE_BUCKET_NAME` and the Bronze/Silver/Gold folder names, used by the DAGs that export to S3.
- **Email notifications (optional):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`. Leave `SMTP_HOST` empty to run the notification worker in dry-run mode (messages are logged instead of sent).

For an AWS deployment, the file also supports the RDS endpoint in `POS_DB_HOST`, IAM credentials in `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION=us-east-1`.

Do not commit `.env` files or real credentials.
