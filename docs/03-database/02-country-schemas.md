
# Country Schemas

## 1. Overview

MercaAndes uses a schema-based organization in PostgreSQL to separate point-of-sale (POS) data by operational country.

Each operational country has its own schema containing the same set of POS tables. Shared operational and reference tables are maintained in the `public` schema.

This approach separates country-specific transactional data while allowing common information to be stored centrally.

## 2. Operational Country Schemas

The current SQL definition creates the following schemas:

| Schema       | Country  | Status      |
| ------------ | -------- | ----------- |
| `colombia` | Colombia | Operational |
| `peru`     | Peru     | Operational |
| `ecuador`  | Ecuador  | Operational |
| `bolivia`  | Bolivia  | Operational |
| `chile`    | Chile    | Operational |

Each schema contains the same five tables:

- `branch`
- `product_category`
- `product`
- `sale`
- `sale_item`

The SQL script creates these schemas and tables using `IF NOT EXISTS`, allowing the initialization script to be executed without attempting to recreate existing objects.

## 3. Country Schema Structure

Each country schema maintains its own branch, product, category, and sales records.

For example, a sale in Colombia is stored in `colombia.sale`, while its corresponding sale items are stored in `colombia.sale_item`.

The same structure applies to the other operational countries.

The principal relationships within each schema are:

- `product_category` → `product`
- `branch` → `sale`
- `sale` → `sale_item`
- `product` → `sale_item`

These relationships are enforced through foreign keys defined in the SQL script.

## 4. Shared Public Schema

The `public` schema contains tables used across the country-specific POS schemas.

### `public.pos_seed_runs`

Records the parameters and results of sales data generation runs, including country code, date range, random seed, and sales count.

Each country's `sale` table can reference this table through `run_id`.

### `public.promotions`

Stores promotion information, including SKU, store or channel, discount percentage, and validity dates.

The current SQL definition does not declare a foreign key linking promotions to each country's product table.

### `public.exchange_rate`

Stores exchange rates identified by date, base currency, and quoted currency.

Its composite primary key prevents duplicate records for the same date and currency pair.

The current SQL definition does not declare foreign keys connecting these currency codes to a separate currency catalog.

## 5. Historical Country: Brazil

Brazil is included in the broader MercaAndes data model because it is represented in the historical Olist dataset.

The documented model distinguishes operational countries from countries retained for historical purposes through the `is_operational` attribute in the centralized `Country` entity.

However, the current POS SQL script creates schemas only for Colombia, Peru, Ecuador, Bolivia, and Chile.

**Brazil does not have a country-specific POS schema in this script.**

Its historical data should therefore be documented separately from the operational POS schemas. Any future decision to create a Brazilian POS schema must be reflected in the database definition and implementation records.

## 6. Benefits of the Schema-Based Approach

The current organization provides several practical benefits:

- **Country separation:** POS tables are organized by country.
- **Consistent structure:** each operational country uses the same set of table definitions.
- **Shared information:** common operational data can be maintained in `public`.
- **Referential integrity:** foreign keys protect the relationships defined within each country's schema.
- **Simplified initialization:** the SQL script creates the country schemas and their tables through a single loop.

The model also requires careful management of schema names, migrations, and queries that access data across countries.

## 7. Current Scope and Limitations

The current SQL definition establishes the five operational POS schemas and three shared public tables.

It does not, by itself, define a complete centralized country catalog, a currency catalog, or a shared holiday model.

Those entities are described in the broader MercaAndes ER model and should be documented according to their actual implementation in the database.

Likewise, the existence of a country schema does not automatically guarantee that its tables contain production data or that all related ingestion and processing workflows are operational.

## 8. Related Documentation

- [Entity-Relationship Model](docs/03-database/01-entity-relationship-model.md)
