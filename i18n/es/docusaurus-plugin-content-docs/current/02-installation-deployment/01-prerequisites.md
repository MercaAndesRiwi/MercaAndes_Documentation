---
title: Requisitos previos
description: Herramientas necesarias para el entorno local de desarrollo de MercaAndes.
---

# Requisitos previos

El entorno local de MercaAndes usa Docker Compose para los servicios de plataforma y `uv` para el entorno Python de procesamiento de datos.

Antes de comenzar, instala y verifica lo siguiente:

- Python 3.13 o posterior.
- [`uv`](https://docs.astral.sh/uv/) para gestionar las dependencias y los entornos virtuales de Python.
- Docker Desktop o Docker Engine con Docker Compose.
- Acceso a internet para consultar tasas de cambio y festivos en las APIs externas.
- PowerShell para ejecutar el script de comprobación de infraestructura y los comandos documentados para Windows.

El primer inicio de la infraestructura descarga varias imágenes grandes. El README de infraestructura estima aproximadamente 5 GB, incluida la imagen de Airflow.

Estas herramientas corresponden al flujo local de desarrollo. Para el estado y la arquitectura de AWS, consulta [Infraestructura y arquitectura de despliegue](../03-architecture/03-infrastructure.md).
