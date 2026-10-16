
# Run Data Processing

Run the following commands from the root of `data-processing-dev`, after PostgreSQL is reachable and the environment variables are configured.

## Install Python dependencies

```powershell
uv sync --locked
```

Verify the Python environment and development tools:

```powershell
uv run python --version
uv run pytest --version
uv run ruff --version
```

## Start the standalone PostgreSQL service (when using the data-processing Compose)

The data-processing README documents this alternative for running PostgreSQL independently of the integrated infrastructure stack:

```powershell
docker compose --env-file .env -f infrastructure/docker/docker-compose.yml up -d
uv run python -m src.simulators.pos_seed.connection
```

Use this standalone database option when working with the data-processing repository by itself. Do not start both PostgreSQL Compose configurations with the same host port at the same time.

## Apply migrations and run the ingestion and seed steps

Run the steps in this order:

```powershell
uv run alembic upgrade head
uv run python -m src.ingestion.exchange_rates.main
uv run python -m src.ingestion.holidays.main
uv run python -m src.ingestion.promotions.main
uv run python -m src.simulators.pos_seed.catalog
uv run python -m src.simulators.pos_seed.main
uv run python -m src.simulators.marketplace_events.producer --orders 100
uv run pytest tests/unit
```

### Execution notes

1. `alembic upgrade head` applies the versioned database migrations.
2. Exchange-rate ingestion populates `public.exchange_rate` and is required before POS generation.
3. Holiday ingestion loads the 2026 holiday data for the five operational countries.
4. Promotion ingestion reads Excel files placed in `data/raw/promotions/`. The expected columns are `sku`, `tienda_o_canal`, `descuento_pct`, `fecha_inicio`, and `fecha_fin`.
5. The catalog step creates or updates the shared product catalog.
6. POS generation requires schemas, branches, products, exchange rates, holidays, and promotions for the configured period.
7. The marketplace producer emits events and does not write them to the POS database, according to the data-processing README.

The README documents `POS_MODE=dev` with 100 sales per country by default and `POS_MODE=full` with 400,000 sales per country by default. Full mode corresponds to 2,000,000 sales across Colombia, Peru, Ecuador, Bolivia, and Chile. Set the mode and dates in `.env` before running the generator.

The generator skips a completed run with the same country, date range, and seed. Changing configuration alone does not regenerate that already completed batch.
