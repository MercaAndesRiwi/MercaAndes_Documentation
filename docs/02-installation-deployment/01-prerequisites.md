
# Prerequisites

The MercaAndes local environment uses Docker Compose for the platform services and `uv` for the data-processing Python environment.

Before starting, install and verify:

- Python 3.13 or newer.
- [`uv`](https://docs.astral.sh/uv/) for Python dependency and virtual-environment management.
- Docker Desktop or Docker Engine with Docker Compose.
- Network access for loading exchange rates and public holidays from external APIs.
- PowerShell for the infrastructure smoke-test script and the documented Windows commands.

The first infrastructure startup downloads several large images. The infrastructure README estimates approximately 5 GB, including the Airflow image.
