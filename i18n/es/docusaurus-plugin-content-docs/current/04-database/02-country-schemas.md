---
title: Esquemas por país
description: Organización de las tablas POS por país y de las tablas operativas compartidas en PostgreSQL.
---

# Esquemas por país

## 1. Resumen

MercaAndes organiza los datos de punto de venta (POS) en PostgreSQL mediante un esquema por cada país operativo. Todos los esquemas contienen las mismas tablas POS; las tablas operativas y de referencia compartidas se encuentran en `public`.

Esta organización separa transacciones de cada país y permite mantener información común de forma centralizada.

## 2. Esquemas de países operativos

La definición SQL actual crea estos esquemas:

| Esquema | País | Estado |
|---|---|---|
| `colombia` | Colombia | Operativo |
| `peru` | Perú | Operativo |
| `ecuador` | Ecuador | Operativo |
| `bolivia` | Bolivia | Operativo |
| `chile` | Chile | Operativo |

Cada esquema contiene cinco tablas con la misma estructura:

- `branch`
- `product_category`
- `product`
- `sale`
- `sale_item`

El script SQL crea esquemas y tablas con `IF NOT EXISTS`, de modo que se puede ejecutar sin intentar recrear objetos existentes.

## 3. Estructura de cada esquema

Cada país mantiene sus sucursales, productos, categorías y ventas en su propio esquema. Por ejemplo, una venta de Colombia se almacena en `colombia.sale` y sus artículos en `colombia.sale_item`. La misma estructura se aplica a los otros países.

Las relaciones principales dentro de cada esquema son:

- `product_category` → `product`
- `branch` → `sale`
- `sale` → `sale_item`
- `product` → `sale_item`

El script SQL define claves foráneas para mantener estas relaciones.

## 4. Esquema compartido `public`

El esquema `public` contiene tablas compartidas por los esquemas POS de cada país.

### `public.pos_seed_runs`

Registra parámetros y resultados de ejecuciones de generación POS, incluidos el país, el periodo, la semilla aleatoria y el número de ventas. Las tablas `sale` por país pueden referenciarla mediante `run_id`.

### `public.promotions`

Almacena promociones con SKU, tienda o canal, porcentaje de descuento y fechas de vigencia. La definición SQL actual no declara una clave foránea entre promociones y las tablas de producto de cada país.

### `public.exchange_rate`

Almacena tasas de cambio por fecha, moneda base y moneda cotizada. Su clave primaria compuesta evita duplicados del mismo día y par de monedas. La definición actual no declara claves foráneas que conecten esos códigos con un catálogo de monedas independiente.

## 5. Brasil como país histórico

Brasil forma parte del modelo general por los datos históricos de Olist. El atributo `is_operational` de la entidad centralizada `Country` distingue países operativos de países históricos.

Sin embargo, el script POS actual solo crea esquemas para Colombia, Perú, Ecuador, Bolivia y Chile. **Este script no crea un esquema POS para Brasil.** Sus datos históricos deben documentarse aparte de los esquemas POS operativos. Si se decide crear un esquema brasileño, habrá que reflejarlo en la definición y los registros de implementación.

## 6. Beneficios del enfoque por esquemas

- Separa las tablas POS de cada país.
- Conserva una estructura común entre países operativos.
- Permite mantener información compartida en `public`.
- Usa claves foráneas para proteger las relaciones definidas.
- Simplifica la inicialización mediante un único script con un bucle.

Este enfoque requiere administrar cuidadosamente nombres de esquema, migraciones y consultas que abarcan varios países.

## 7. Alcance y limitaciones actuales

La definición SQL actual establece cinco esquemas POS operativos y tres tablas compartidas en `public`. Por sí sola no define un catálogo centralizado completo de países, un catálogo de monedas ni un modelo compartido de festivos.

Estas entidades aparecen en el modelo entidad-relación más amplio y deben describirse según su implementación real. La existencia de un esquema tampoco garantiza que contenga datos de producción ni que las ingestas y los flujos relacionados estén operativos.

## 8. Documentación relacionada

- [Modelo entidad-relación](01-entity-relationship-model.md)
