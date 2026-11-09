# Data Sources

The platform integrates historical, transactional, external, and commercial data. Some sources are real and others are simulations that reproduce the expected behavior of the operation.

## Source table

| Source                             | Type and description                                                                                                                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Olist historical dataset** | Real source. A public Brazilian e-commerce dataset distributed in nine CSV files. It is loaded once and contributes about 100,000 orders as the digital-channel history. Brazil serves as a historical reference and is not part of the five Andean operating countries. |
| **Country POS databases**    | Simulated source. PostgreSQL with one schema per country. It receives sales continuously and targets at least 2 million sales over 12 months.                                                                                                                            |
| **Seller inventory API**     | Simulated REST service with pagination and token authentication. It is polled every 10 minutes and covers at least 3,000 sellers and 50,000 SKUs. It includes controlled HTTP 429 and 503 error responses on at least 3% of requests.                                    |
| **Marketplace order events** | Simulated source. JSON messages representing the order lifecycle: created, paid, shipped, delivered, canceled, and returned. It targets peaks of at least 20 events per second, plus duplicated and out-of-order events.                                                 |
| **Exchange rates**           | Real source. The public Frankfurter API, with information per currency and day. The coverage does not include all Andean currencies.                                                                                                                                     |
| **Holiday calendar**         | Real source. The public Nager.Date API, queried per country for Colombia (CO), Peru (PE), Ecuador (EC), Bolivia (BO), and Chile (CL). The information is used in the replenishment rules.                                                                                |
| **Promotion plan**           | Simulated source. A weekly Excel file of fewer than 5,000 rows, uploaded by the commercial team to object storage.                                                                                                                                                       |

## Deployed API

| Service                      | Purpose                                                          | Documentation                                               |
| ---------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Inventory & Sellers API (F3) | Seller catalog, inventory, and seller scores.                    | [Open the Swagger UI](http://3.132.51.65:8002/docs#/)        |
| Marketplace API (F4)         | Marketplace lifecycle event generation and simulated purchases.  | [Open the Swagger UI](http://3.132.51.65:8003/docs#/)        |
| Promotions API (F7)          | Weekly promotions ingestion from Excel and promotion validation. | [Open the Swagger UI](http://3.132.51.65:8004/docs#/default) |

The local counterparts of these APIs are documented in [Deployed APIs and operational consoles](/docs/architecture/services-apis).
