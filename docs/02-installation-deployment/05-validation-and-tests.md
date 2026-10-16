
# Validation and Tests

Run these commands from the root of `data-processing-dev`.

## Unit tests

```powershell
uv run pytest tests/unit
```

## Integration tests

```powershell
uv run pytest tests/integration
```

The integration tests require a reachable PostgreSQL database with the expected schemas and test data. The README notes that the current POS integration assertion expects 100 sale-item records per country, so run it against the corresponding development dataset rather than the full annual dataset.

## All tests

```powershell
uv run pytest
```

## Code style

```powershell
uv run ruff check
```

## Inventory adapter tests

```powershell
uv run pytest tests/integration/test_inventory_adapter.py -v
uv run pytest tests/unit/test_inventory.py -v
```

## Run the local inventory APIs and consumer (optional)

The data-processing README documents two separate API entry points. Start each command in a separate PowerShell terminal from the `data-processing-dev` repository root.

Original mock API, port 8000:

```powershell
uv run uvicorn src.simulators.inventory_api.api_seller:app --reload --host 127.0.0.1 --port 8000
```

Catalog-backed API, port 8001:

```powershell
uv run uvicorn src.simulators.inventory_api.catalog_api:app --reload --host 127.0.0.1 --port 8001
```

Swagger pages:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8001/docs`

To run the inventory consumer after configuring the corresponding `INVENTORY_API_*` values in `.env`:

```powershell
uv run python -m src.ingestion.inventory.consumer
```

The original mock API and catalog-backed API are separate implementations; the README explicitly states that mock identifiers are not automatically mapped to the shared catalog.
