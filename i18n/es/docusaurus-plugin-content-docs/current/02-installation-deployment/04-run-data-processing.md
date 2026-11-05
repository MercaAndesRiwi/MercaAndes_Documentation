---
title: Ejecutar el procesamiento de datos
description: Pasos documentados para migraciones, ingesta, simulación POS y eventos de marketplace.
---

# Ejecutar el procesamiento de datos

Ejecuta estos comandos desde la raíz de `data-processing-dev`, con PostgreSQL disponible y las variables de entorno configuradas.

## Instalar dependencias de Python

```powershell
uv sync --locked
```

Comprueba el entorno y las herramientas de desarrollo:

```powershell
uv run python --version
uv run pytest --version
uv run ruff --version
```

## Iniciar el servicio PostgreSQL independiente

Si trabajas únicamente con el Compose del repositorio de procesamiento, su README documenta esta alternativa:

```powershell
docker compose --env-file .env -f infrastructure/docker/docker-compose.yml up -d
uv run python -m src.simulators.pos_seed.connection
```

Usa esta base de datos independiente cuando trabajes solo con el repositorio de procesamiento. No levantes a la vez las configuraciones Compose que publican PostgreSQL en el mismo puerto del equipo.

## Aplicar migraciones y ejecutar la ingesta y las semillas

Ejecuta los pasos en este orden:

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

### Notas de ejecución

1. `alembic upgrade head` aplica las migraciones versionadas de la base de datos.
2. La ingesta de tasas de cambio carga `public.exchange_rate` y debe completarse antes de generar ventas POS.
3. La ingesta de festivos carga los datos de 2026 para los cinco países operativos.
4. La ingesta de promociones lee archivos Excel ubicados en `data/raw/promotions/`. Las columnas esperadas son `sku`, `tienda_o_canal`, `descuento_pct`, `fecha_inicio` y `fecha_fin`.
5. La carga del catálogo crea o actualiza el catálogo de productos compartido.
6. La generación POS requiere esquemas, sucursales, productos, tasas de cambio, festivos y promociones para el periodo configurado.
7. El productor de marketplace emite eventos; según el README de procesamiento, no los escribe en la base de datos POS.

El README documenta `POS_MODE=dev` con 100 ventas por país por defecto y `POS_MODE=full` con 400.000 ventas por país. El modo completo representa 2.000.000 ventas en los cinco países: Colombia, Perú, Ecuador, Bolivia y Chile. Configura el modo y las fechas en `.env` antes de ejecutar el generador.

El generador omite una ejecución completada con el mismo país, periodo y semilla. Cambiar solo la configuración no vuelve a generar ese lote ya completado.

Esta página describe comandos locales del repositorio de procesamiento; para la operación desplegada, registra el DAG, servicio o tarea AWS que ejecuta cada paso y su estado verificado.
