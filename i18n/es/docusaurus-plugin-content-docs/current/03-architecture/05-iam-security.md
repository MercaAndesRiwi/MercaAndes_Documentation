---
title: Seguridad IAM y control de acceso en AWS
description: Principios, roles, políticas y validaciones de seguridad para MercaAndes en AWS.
---

# Seguridad IAM y control de acceso en AWS para MercaAndes

## 1. Resumen

AWS Identity and Access Management (IAM) define identidades, permisos y controles de acceso para la infraestructura y las cargas de trabajo de MercaAndes.

Esta página describe la estrategia IAM asociada a **US-03**, incluidos usuarios funcionales, roles de infraestructura, privilegio mínimo y prácticas de seguridad. La configuración se debe mantener como infraestructura como código (IaC), de modo que los permisos y las relaciones de confianza se puedan revisar junto con la infraestructura.

## 2. Principios de seguridad

- **Privilegio mínimo:** concede solo los permisos necesarios para cada responsabilidad.
- **Protección de credenciales:** no codifiques contraseñas, claves, tokens ni otros secretos en el código.
- **Acceso basado en roles:** usa roles IAM para cargas AWS y procesos automatizados.
- **Infraestructura como código:** define y mantiene recursos, políticas y relaciones de confianza en configuración versionada.
- **Separación de responsabilidades:** asigna permisos de acuerdo con la función de cada persona o carga.
- **Gestión del ciclo de vida:** aprovisiona, rota y revoca credenciales mediante procedimientos seguros.

## 3. Usuarios IAM funcionales

| Usuario IAM | Responsabilidad |
|---|---|
| `developer-api` | Desarrollo de APIs y monitoreo de servicios. |
| `developer-data` | Administración de pipelines batch y de streaming. |
| `devops-engineer` | Aprovisionamiento de infraestructura y configuración de pipelines. |
| `qa-engineer` | Aseguramiento de calidad, pruebas e inspección de auditoría. |

Estas identidades representan responsabilidades distintas. Sus permisos efectivos deben limitarse a las acciones y recursos necesarios para cada función.

### 3.1. Requisitos de acceso de usuarios

- Utiliza credenciales individuales; no compartas contraseñas.
- Aprovisiona credenciales de manera segura y aplica controles de autenticación apropiados.
- Concede permisos mediante políticas IAM controladas.
- Revisa los permisos periódicamente y retira los accesos que ya no se necesiten.
- No concedas privilegios administrativos por defecto.

**Seguridad:** no guardes contraseñas iniciales ni otras credenciales en esta documentación o en el repositorio.

## 4. Roles IAM de infraestructura

Los roles IAM proporcionan permisos a servicios y cargas AWS sin que las aplicaciones incluyan claves de acceso permanentes.

### 4.1. Rol EC2 de APIs

**Rol:** `mercaandes-api-ec2-role`

**Propósito:** proporcionar permisos requeridos por APIs que se ejecutan en EC2.

Las responsabilidades del rol incluyen acceso a recursos AWS necesarios y publicación de logs. Limita los permisos a los recursos y acciones que realmente necesite la aplicación.

### 4.2. Rol de procesamiento batch

**Rol:** `mercaandes-batch-node-role`

**Propósito:** respaldar cargas batch de procesamiento, incluidas Spark y Airflow.

Las responsabilidades del rol incluyen leer datos desde ubicaciones S3 autorizadas y respaldar las operaciones de procesamiento y escritura en los recursos configurados. Los permisos corresponden a la arquitectura y los recursos que usa cada carga.

### 4.3. Rol de procesamiento de streaming

**Rol:** `mercaandes-streaming-node-role`

**Propósito:** respaldar cargas de ingesta y procesamiento de eventos.

Las responsabilidades del rol incluyen respaldar los servicios Kafka y RabbitMQ, procesar eventos y escribir resúmenes en ubicaciones S3 designadas. El acceso se limita a los servicios del despliegue.

### 4.4. Rol de pipeline CI/CD

**Rol:** `mercaandes-cicd-pipeline-role`

**Propósito:** respaldar flujos de despliegue automatizados asociados con GitHub Actions y servicios de contenedores AWS.

Las responsabilidades del rol incluyen operaciones de imágenes en Amazon ECR y despliegues en Amazon ECS. La relación de confianza de GitHub Actions limita qué identidades y flujos pueden asumirlo. GitHub OIDC utiliza credenciales de corta duración en lugar de claves permanentes.

## 5. Políticas IAM y relaciones de confianza

Las políticas IAM definen qué acciones AWS puede realizar una identidad y a qué recursos se aplican. Las políticas de confianza definen qué principales pueden asumir un rol.

Revisa los siguientes aspectos:

- **Políticas de identidad:** comprueba las acciones concedidas a cada usuario o rol.
- **Alcance de recursos:** limita los permisos a los recursos requeridos siempre que sea posible.
- **Relaciones de confianza:** permite asumir roles solo a servicios, identidades o flujos autorizados.
- **Permisos sensibles:** revisa acciones que modifican IAM, redes, bases de datos o infraestructura de producción.
- **Separación de funciones:** mantén separadas las responsabilidades de desarrollo, procesamiento, calidad y despliegue cuando corresponda.

Usa la configuración Terraform de IAM como fuente para documentar los recursos y las políticas de confianza declarados en el repositorio. No describas un permiso como implementado si no está respaldado por la configuración o verificado en AWS.

## 6. Validación de seguridad y cumplimiento

| Control | Validación |
|---|---|
| Seguridad de la cuenta root | Comprueba el estado de las claves de acceso root y los controles aplicables en AWS. |
| Privilegio mínimo | Revisa permisos innecesarios y políticas demasiado amplias. |
| Protección de credenciales | Comprueba que no haya secretos en el repositorio ni expuestos en la documentación. |
| Confianza de roles | Confirma que solo principales autorizados puedan asumir cada rol. |
| Infraestructura como código | Compara los recursos IAM declarados en Terraform con la configuración desplegada. |
| Acceso CI/CD | Verifica que las credenciales y los permisos para asumir roles estén restringidos. |
| Revisión de accesos | Revisa periódicamente identidades, permisos y accesos sin uso. |

> **Importante:** registra como completadas acciones sobre la cuenta —por ejemplo, revocar claves de root— solo después de verificarlas en AWS. Las declaraciones Terraform no prueban que se haya realizado una acción en la cuenta.

## 7. Referencias de implementación

La referencia principal es `main.tf`, donde se deben revisar los recursos IAM, las políticas y las relaciones de confianza. Consulta también otros archivos de AWS cuando incluyan declaraciones pertinentes.

## 8. Resumen

La estrategia IAM separa las identidades humanas de los roles de carga y busca aplicar privilegio mínimo a APIs, procesamiento de datos, streaming y despliegues automatizados. Su seguridad depende del alcance correcto de políticas, relaciones de confianza restringidas, gestión segura de credenciales y verificación de que la configuración declarada coincida con AWS.
