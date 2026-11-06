---
title: APIs desplegadas y consolas operativas
description: Enlaces a la documentación de las APIs, consolas de plataforma y flujo de compra simulada con confirmación por correo.
sidebar_position: 6
---

# APIs desplegadas y consolas operativas

Esta página registra los endpoints desplegados que compartió el equipo del proyecto. Se incluyen enlaces a la documentación de las APIs para integración y demostración. Usan HTTP sin cifrado y no deben utilizarse para transmitir información sensible. Para acceso público a las APIs, se recomienda un dominio con HTTPS.

## Documentación de APIs

| Servicio | Propósito | Documentación |
|---|---|---|
| API de inventario (F3) | Consultas de inventario y catálogo de vendedores. | [Abrir Swagger de la API de inventario](http://3.132.51.65:8002/docs) |
| API de marketplace (F4) | Generación del ciclo de vida de eventos y compras simuladas. | [Abrir Swagger de la API de marketplace](http://3.132.51.65:8003/docs) |

El código fuente de Marketplace define `POST /api/v1/marketplace/events` para generar eventos del ciclo de vida y `POST /api/v1/marketplace/purchase` para simular una compra y publicar su notificación. Consulta Swagger para revisar los contratos de solicitud y respuesta del despliegue vigente.

## Consolas operativas

La plataforma desplegada incluye Airflow, RabbitMQ Management, Kafka UI y Spark Master UI. Son interfaces de operación, no APIs de fuentes de datos.

Estas consolas están disponibles en un host EC2 público mediante HTTP sin cifrar.

| Consola | Puerto | Usuarios |
|---|---:|---|
| Interfaz web de Airflow | 8080 | Operación de la plataforma de datos |
| RabbitMQ Management | 15672 | Operación de mensajería |
| Kafka UI | 9000 | Operación de streaming |
| Spark Master UI | 8081 | Operación de procesamiento |

No publiques en este sitio las credenciales ni los enlaces directos de estas consolas. Conserva las direcciones exactas y credenciales en un runbook de operaciones con acceso restringido. Limita el tráfico de entrada a una VPN, AWS Systems Manager o rangos IP administrativos aprobados; rota las credenciales expuestas y utiliza secretos únicos para cada servicio. Estas consolas no deben quedar accesibles abiertamente por HTTP.

## Compra simulada y confirmación por correo

El flujo de compra de Marketplace agrega una demostración orientada al cliente sobre el productor de eventos:

1. El usuario envía una solicitud de compra a través de la API de marketplace.
2. La API crea un pedido simulado, calcula los subtotales y publica un mensaje `PURCHASE_CONFIRMED` en la cola durable de notificaciones de RabbitMQ.
3. El worker de notificaciones consume el mensaje y prepara una confirmación con la referencia y estado del pedido, la fecha, los productos y el total.
4. La demostración desplegada envía un correo de confirmación con formato visual. El mensaje incluye una acción **Rastrear mi pedido** que redirige a una API de MercaAndes.

Este flujo demuestra un pedido simulado cuyo evento de notificación sí se publica y procesa de manera asíncrona; no representa la autorización de un pago real. La captura compartida para esta documentación contiene datos de cliente y pedido, por lo que no se reproduce aquí.

## Seguridad y verificación

- No guardes contraseñas de bases de datos, SSH, Airflow o RabbitMQ en esta documentación pública ni en el código fuente.
- Usa credenciales distintas para cada servicio; rota cualquier contraseña compartida por chat o guardada en un repositorio.
- Limita el acceso SSH a orígenes aprobados y el acceso a la base de datos al Security Group del bastion cuando se utilice el túnel.
- Sustituye los enlaces HTTP directos por endpoints HTTPS antes de utilizar las APIs con información real o sensible de clientes.

## Documentación relacionada

- [Componentes de arquitectura](02-components.md)
- [Infraestructura y arquitectura de despliegue](03-infrastructure.md)
- [IAM y seguridad](05-iam-security.md)
- [Repositorio de la API de marketplace](https://github.com/MercaAndesRiwi/Marketplace_Api)
- [Repositorio de la API de inventario](https://github.com/MercaAndesRiwi/Inventory_Api)
