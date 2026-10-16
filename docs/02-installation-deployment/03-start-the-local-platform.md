
# Start the Local Platform

Run these commands from the root of `infrastructure_MercAndes-main` in PowerShell.

## Validate and start the services

```powershell
docker compose config
docker compose up -d --build
```

The first command validates the resolved Compose configuration. The second builds and starts the local platform.

On the first run, Docker downloads the service images. Allow time for this to finish.

The Compose stack defined by the infrastructure repository includes PostgreSQL, RabbitMQ, Kafka, Kafka UI, Spark master and worker, Airflow initialization/API/scheduler services, and the POS, inventory, and marketplace APIs.

The `airflow-init` service initializes Airflow metadata and creates the administrator account, then exits. The Airflow API server and scheduler wait for initialization.

## Check service status

```powershell
docker compose ps
```

## Run the smoke test

```powershell
.\scripts\smoke.ps1
```

The script checks these endpoints:

| Component           | URL                                      |
| ------------------- | ---------------------------------------- |
| POS API             | `http://localhost:8001/health`         |
| Inventory API       | `http://localhost:8002/health`         |
| Marketplace API     | `http://localhost:8003/health`         |
| RabbitMQ management | `http://localhost:15672`               |
| Spark master UI     | `http://localhost:8081`                |
| Airflow API         | `http://localhost:8080/api/v2/version` |

The script also runs `docker compose ps`. A successful smoke test confirms that the checked endpoints respond; it does not by itself prove that every ingestion or processing workflow has run successfully.
