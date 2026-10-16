
# Repository and Environment Setup

The platform is split across two repositories:

- `infrastructure_MercAndes-main`: Docker Compose, service images, platform wiring, CI, and smoke tests.
- `data-processing-dev`: ingestion, catalog and POS simulators, database migrations, tests, and data-processing dependencies.

For the infrastructure Compose file, the domain repository is expected to be available as a sibling directory named `data-processing`, because the API services mount `../data-processing` at `/opt/domain` in read-only mode. Place or check out the repositories so this relative path resolves correctly when running Compose from the infrastructure repository.

## Configure the infrastructure environment

From the root of `infrastructure_MercAndes-main`, create the local environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace the placeholder values with the local credentials you intend to use. The example file is a template; the real `.env` is local and must not be committed.

The infrastructure README documents these main configuration groups:

- PostgreSQL: `POS_DB_NAME`, `POS_DB_USER`, `POS_DB_PASSWORD`.
- RabbitMQ: `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_VHOST`.
- Airflow metadata database and administrator: `AIRFLOW_DB_NAME`, `AIRFLOW_DB_USER`, `AIRFLOW_DB_PASSWORD`, `AIRFLOW_ADMIN_USER`, `AIRFLOW_ADMIN_PASSWORD`.
- Published service ports, Spark resources, and simulator settings.

## Configure the data-processing environment

From the root of `data-processing-dev`, create its local environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` to match the PostgreSQL database and credentials used for the local run. The data-processing README lists `POS_DB_HOST`, `POS_DB_PORT`, `POS_DB_NAME`, `POS_DB_USER`, and `POS_DB_PASSWORD`, along with the POS generation dates and mode, shared catalog seed, and simulator settings.

For a local command running on the host, the data-processing README specifies `POS_DB_HOST=localhost`. The infrastructure Compose uses its PostgreSQL service name inside the Docker network. Use the host value appropriate to where the command is executed.

Do not commit `.env` files or real credentials.
