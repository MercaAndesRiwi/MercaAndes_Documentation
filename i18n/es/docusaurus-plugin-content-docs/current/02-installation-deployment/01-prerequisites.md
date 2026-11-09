---
id: prerequisites
title: Requisitos previos
sidebar_position: 1
description: Herramientas y recursos necesarios para ejecutar la plataforma local de MercaAndes.
---

# Requisitos previos

La plataforma local de MercaAndes se ejecuta con Docker Compose desde el repositorio `infrastructure_MercAndes`. Instala y verifica:

- **Docker Desktop** o Docker Engine con Docker Compose v2, con WSL2 habilitado en Windows.
- **Git** para clonar los repositorios.
- **Python 3.13 o superior** junto con [`uv`](https://docs.astral.sh/uv/) si quieres ejecutar servicios, pruebas o scripts de semillas desde los repositorios sin contenedores.
- **PowerShell** para el script de prueba de humo y los comandos de Windows documentados.
- Acceso a la red para que los contenedores alcancen las APIs externas de Frankfurter y Nager.Date, y (opcionalmente) AWS para los recursos de S3 y RDS.

## Requisitos de recursos

- Al menos 8 GB de RAM; se recomiendan 16 GB al ejecutar todos los contenedores simultáneamente.
- Aproximadamente 5 GB de disco para la primera descarga de imágenes, más para las compilaciones de Spark y Airflow.
