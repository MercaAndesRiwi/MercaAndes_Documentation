---
id: prerequisites
title: Prerequisites
sidebar_position: 1
description: Tools and resources required to run the MercaAndes local platform.
---
# Prerequisites

The MercaAndes local platform runs with Docker Compose from the `infrastructure_MercAndes` repository. Install and verify:

- **Docker Desktop** or Docker Engine with Docker Compose v2, and WSL2 enabled on Windows.
- **Git** to clone the repositories.
- **Python 3.13 or newer** together with [`uv`](https://docs.astral.sh/uv/) if you want to run services, tests, or seeding scripts from the repositories without containers.
- **PowerShell** for the smoke-test script and the documented Windows commands.
- Network access so the containers can reach the Frankfurter and Nager.Date external APIs, and (optionally) AWS for S3 and RDS resources.

## Resource requirements

- At least 8 GB of RAM; 16 GB are recommended when running all containers simultaneously.
- About 5 GB of disk for the first image pull, more when including Spark and Airflow builds.
