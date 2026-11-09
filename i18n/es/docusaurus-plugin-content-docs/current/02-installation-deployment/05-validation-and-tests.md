---
id: validation-and-tests
title: Validación y pruebas
sidebar_position: 5
description: Cómo verificar la plataforma local y cómo ejecutar las pruebas automatizadas de cada repositorio.
---

# Validación y pruebas

## Verificación a nivel de plataforma

Desde la raíz de `infrastructure_MercAndes`:

1. **Endpoints y consolas:** ejecuta `.\scripts\smoke.ps1` (ver [Arrancar la plataforma local](/docs/installation-deployment/start-the-local-platform)).
2. **Compra simulada con confirmación por correo:**
   1. Abre el Swagger UI de la Marketplace API en `http://localhost:8003/docs`.
   2. Ejecuta `POST /api/v1/marketplace/purchase` con el cuerpo por defecto (cliente y carrito predefinidos).
   3. La API responde `201 Created` con un ID de pedido como `MA-2026-A1B2C` y publica el evento `PURCHASE_CONFIRMED` en RabbitMQ.
   4. El notification worker consume el evento y renderiza el correo de confirmación; define las variables SMTP en `.env` para recibirlo en una bandeja real.
   5. Consulta la línea de tiempo del pedido con `GET /api/v1/marketplace/orders/{order_id}/timeline` para ver el historial de eventos.
   6. Monitorea los logs del worker con `docker logs -f platform-notification-worker`.
3. **Verificación del seller score:**
   1. Abre Airflow en `http://localhost:8080` y dispara `seller_scoring`.
   2. Consulta la Inventory API con un ID de seller de semilla:
      ```powershell
      curl http://localhost:8002/api/v1/sellers/SEL-001/score
      ```
   3. La respuesta contiene el puntaje, sus cuatro componentes (despacho, reseña, exactitud de inventario y cancelaciones) y la marca de tiempo del cálculo.
4. **Verificación de calidad y Gold:** revisa `public.data_quality_metrics` y las vistas Gold (ver [Ejecutar el procesamiento de datos](/docs/installation-deployment/run-data-processing)).

## Pruebas de repositorio

Los repositorios usan `uv` para el entorno Python y `pytest` para las pruebas. Desde la raíz de cada repositorio:

```powershell
uv sync --locked
uv run pytest
uv run ruff check
```

Por repositorio:

| Repositorio | Enfoque de pruebas |
|---|---|
| `infrastructure_MercAndes` | Integridad de DAGs, contratos de servicios (solicitud de promos, notificaciones) y cableado de la plataforma bajo `tests/` y `services/*/tests/`. |
| `Transactional-POS-database` | Generación de clientes y ventas, persistencia y migraciones (`tests/unit`, `tests/integration`). |
| `Marketplace_Api` | Generación de eventos y flujo de compra (`tests/unit`). |
| `Inventory_Api` | Endpoints de sellers, existencias y puntajes. |
| `MercaAndes_Spark_Gold_Transformations` | Ventas netas, seller score, riesgo de inventario y recálculo de eventos tardíos (`tests/`). |
| `api-exchange-rates` / `api-holidays` | Comportamiento de repositorio y workflows de CI. |

## CI

Los repositorios `api-exchange-rates`, `api-holidays`, `Inventory_Api`, `Marketplace_Api` y `infrastructure_MercAndes` incluyen workflows de GitHub Actions que ejecutan linters y pruebas en cada push, y compilan y publican las imágenes base en Amazon ECR al hacer push a `main`.
