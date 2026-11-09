[14/02/2026 6:40 PM - Santiago Huertas]
# Seguridad IAM y control de acceso en AWS

## 1. Descripción general

MercaAndes usa AWS Identity and Access Management (IAM) para definir identidades, permisos y control de acceso sobre su infraestructura y workloads en la nube (región `us-east-1`, cuenta `623588626787`).

Esta documentación describe la estrategia IAM asociada a **US-03**, incluyendo los usuarios funcionales IAM, los roles de infraestructura, el acceso de privilegio mínimo y las prácticas de seguridad.

La configuración IAM se administra mediante Infraestructura como Código (IaC). Las declaraciones de recursos viven en la carpeta `infrastructure_MercAndes/aws/terraform`: `ecs_fargate.tf` (rol de ejecución ECS y task roles), `eks.tf` (roles de la prueba de concepto EKS) y `rds.tf` (networking de la base de datos), junto con los demás archivos de configuración del despliegue.

## 2. Principios de seguridad

La estrategia IAM sigue estos principios:

- **Mínimo privilegio:** otorgar solo los permisos necesarios para cada responsabilidad.
- **Protección de credenciales:** no incluir contraseñas, claves de acceso, tokens ni otros secretos en el código fuente.
- **Acceso basado en roles:** usar roles IAM para dar permisos a workloads de AWS y procesos automatizados.
- **Infraestructura como Código:** definir y mantener recursos IAM, políticas y relaciones de confianza en configuración versionada.
- **Separación de responsabilidades:** asignar permisos según la función específica de cada usuario o workload.
- **Gestión del ciclo de vida de credenciales:** aprovisionar, rotar y revocar credenciales mediante procedimientos seguros.

## 3. Usuarios funcionales IAM

Las identidades IAM funcionales definidas en el diseño de seguridad se organizan según sus responsabilidades.

| Usuario IAM        | Responsabilidad                                             |
| ------------------ | ------------------------------------------------------------ |
| `developer-api`    | Desarrollo de las APIs y supervisión de servicios.           |
| `developer-data`   | Administración de los flujos de datos por lotes y en tiempo real. |
| `devops-engineer`  | Aprovisionamiento de infraestructura y configuración de procesos. |
| `qa-engineer`      | Aseguramiento de calidad, pruebas y revisión de auditoría.    |

Estas identidades representan responsabilidades operativas distintas y sus permisos se delimitan a los recursos y acciones necesarias para cada función. Prácticas aplicadas a los usuarios funcionales:

- Credenciales individuales; las contraseñas no se comparten.
- Provisión de credenciales mediante procedimientos seguros y controles de autenticación apropiados.
- Permisos otorgados por políticas IAM controladas, sin privilegios administrativos por defecto.
- Revisiones periódicas de permisos que revocan el acceso que deja de ser necesario.

**Nota de seguridad:** las contraseñas iniciales y otras credenciales no se almacenan en esta documentación ni en el repositorio; el almacenamiento de secretos aprobado es la fuente de las credenciales operativas.

## 4. Roles IAM de infraestructura

La bitácora de despliegue registra seis roles de ejecución aprovisionados. Los roles IAM proveen permisos a los servicios y workloads sin incrustar claves de acceso de larga duración en las aplicaciones.

### 4.1 Rol API EC2

**Rol:** `mercaandes-api-ec2-role`

**Propósito:** proveer permisos a las cargas API, referenciado como task role de las definiciones de tareas ECS Fargate (ver `aws/terraform/ecs_fargate.tf`):

- Acceder a los recursos AWS requeridos por las APIs.
- Publicar logs de aplicación y operativos en CloudWatch.
- Acceder a los prefijos S3 designados para sus operaciones de datos.

### 4.2 Rol de procesamiento por lotes

**Rol:** `mercaandes-batch-node-role`

**Propósito:** soportar los workloads del nodo batch (Airflow y Spark):

- Leer los datos crudos de los prefijos S3 Bronze y Silver.
- Escribir los datos procesados en los prefijos Silver y Gold y en los recursos RDS configurados.

### 4.3 Rol de procesamiento streaming

**Rol:** `mercaandes-streaming-node-role`

**Propósito:** soportar los workloads del nodo streaming (operación de Kafka y RabbitMQ, consumidores Spark Streaming):

- Ingestar y procesar los eventos entrantes.
- Escribir los resúmenes procesados en los prefijos S3 designados.

### 4.4 Rol de pipeline CI/CD

**Rol:** `mercaandes-cicd-pipeline-role`

**Propósito:** soportar los workflows de despliegue automatizados asociados a GitHub Actions:

- Compilar y publicar imágenes en Amazon ECR (14 repositorios).
- Actualizar task definitions y desplegar servicios en Amazon ECS.

### 4.5 Roles de ejecución de tareas ECS

**Roles:** `mercaandes-ecs-task-execution-role` y `ecsTaskExecutionRole` (provisto por AWS)

**Propósito:** permitir a ECS extraer imágenes de ECR y publicar logs de contenedores en CloudWatch (política administrada `AmazonECSTaskExecutionRolePolicy`, ver `aws/terraform/ecs_fargate.tf`).

### 4.6 Roles de la prueba de concepto EKS

**Roles:** `mercaandes-eks-poc-cluster-role` y `mercaandes-eks-poc-node-role`

**Propósito:** soportar la prueba de concepto Kubernetes de la Sellers API (`aws/terraform/eks.tf`), adjuntando las políticas administradas AmazonEKSClusterPolicy y el conjunto de políticas del node group (AmazonEKSWorkerNodePolicy, AmazonEKS_CNI_Policy, AmazonEC2ContainerRegistryReadOnly).

## 5. Políticas IAM y relaciones de confianza

Las políticas IAM definen qué acciones AWS puede realizar cada identidad y sobre qué recursos se aplican. Las políticas de confiance definen qué entidades pueden asumir cada rol.

La configuración Terraform del repositorio es la fuente de las políticas y relaciones de confianza declaradas:

- **Políticas de identidad:** las acciones y el alcance de recursos de cada rol.
- **Relaciones de confianza:** ECS sostiene el principal de servicios; el rol CI/CD restringe las identidades y workflows que lo asumen vía GitHub OIDC donde está configurado.
- El **alcance de recursos** se acota a los buckets, secretos y log groups que cada workload consume.

Las revisiones periódicas cubren el alcance de recursos, los permisos sensibles (IAM, redes, bases de datos), la separación de funciones (desarrollo, procesamiento de datos, aseguramiento de calidad, despliegue) y las entidades autorizadas a asumir cada rol.

## 6. Cumplimiento y validación de seguridad

El equipo valida continuamente estos controles:

| Control                 | Validación                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Seguridad de la cuenta raíz | El usuario raíz queda fuera de las operaciones diarias; el monitoreo está configurado en la cuenta. |
| Mínimo privilegio       | Las políticas se revisan frente a las acciones consumidas por cada workload.                       |
| Protección de credenciales | Los secretos viven en `.env` (ignorado por git), el almacén de secretos y el runbook; gitleaks corre en CI (`.gitleaks.toml`). |
| Políticas de confianza  | Solo los principales autorizados asumen cada rol.                                                  |
| Infraestructura como Código | Las declaraciones Terraform coinciden con los recursos desplegados en `us-east-1`.               |
| Acceso CI/CD            | Credenciales de despliegue y asunción de roles restringidas al pipeline.                           |
| Revisiones de acceso    | Revisiones periódicas de permisos y de acceso sin uso.                                             |

## 7. Referencias de implementación

- `aws/terraform/ecs_fargate.tf` — roles de ejecución y task roles ECS.
- `aws/terraform/eks.tf` — roles de la prueba de concepto EKS.
- `aws/task-definitions` — task definitions registradas que referencian los roles.
- Bitácora de despliegue (`bitacora_despliegue_aws.md`) — registro histórico de los recursos aprovisionados (5 roles custom + roles de ejecución, 14 repositorios ECR, 4 Security Groups).

## 8. Resumen

La estrategia IAM de MercaAndes separa las identidades humanas de los roles de workload y aplica el privilegio mínimo a través de los servicios API, el procesamiento de datos, los workloads streaming y los despliegues automatizados.

El modelo de seguridad depende de políticas correctamente acotadas, relaciones de confianza restringidas y una gestión segura de credenciales, validada comparando las declaraciones Terraform con los recursos desplegados en la región `us-east-1`.
