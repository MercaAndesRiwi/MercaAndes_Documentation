---
title: Validación y pruebas
description: Comandos documentados para pruebas, estilo e integraciones del procesamiento de datos.
---

# Validación y pruebas

Ejecuta estos comandos desde la raíz de `data-processing-dev`.

## Pruebas unitarias

```powershell
uv run pytest tests/unit
```

## Pruebas de integración

```powershell
uv run pytest tests/integration
```

Las pruebas de integración requieren PostgreSQL accesible con los esquemas y datos de prueba esperados. El README indica que la comprobación de integración POS actual espera 100 registros de artículos de venta por país; ejecútala contra el conjunto de desarrollo correspondiente, no contra el conjunto anual completo.

## Todas las pruebas

```powershell
uv run pytest
```

## Estilo de código

```powershell
uv run ruff check
```

## Pruebas del adaptador de inventario

```powershell
uv run pytest tests/integration/test_inventory_adapter.py -v
uv run pytest tests/unit/test_inventory.py -v
```

## Iniciar las APIs locales de inventario y el consumidor (opcional)

El README de procesamiento documenta dos puntos de entrada de API separados. Ejecuta cada comando en una terminal distinta de PowerShell, desde la raíz de `data-processing-dev`.

API simulada original, puerto 8000:

```powershell
uv run uvicorn src.simulators.inventory_api.api_seller:app --reload --host 127.0.0.1 --port 8000
```

API respaldada por catálogo, puerto 8001:

```powershell
uv run uvicorn src.simulators.inventory_api.catalog_api:app --reload --host 127.0.0.1 --port 8001
```

Páginas Swagger:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8001/docs`

Para ejecutar el consumidor de inventario, configura los valores correspondientes de `INVENTORY_API_*` en `.env` y ejecuta:

```powershell
uv run python -m src.ingestion.inventory.consumer
```

La API simulada original y la API respaldada por catálogo son implementaciones distintas; el README indica que los identificadores de la primera no se asignan automáticamente al catálogo compartido.

Esta guía valida los componentes locales. La disponibilidad y el estado de las instancias AWS deben verificarse por separado.
