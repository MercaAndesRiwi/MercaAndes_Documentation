
# MercaAndes AWS IAM Security & Access Control

## 1. Overview

MercaAndes uses AWS Identity and Access Management (IAM) to define identities, permissions, and access control for its cloud infrastructure and workloads (region `us-east-1`, account `623588626787`).

This documentation describes the IAM strategy associated with **US-03**, including functional IAM users, infrastructure roles, least-privilege access, and security practices.

The IAM configuration is managed through Infrastructure as Code (IaC). The resource declarations live in the `infrastructure_MercAndes/aws/terraform` folder: `ecs_fargate.tf` (ECS execution role and task roles), `eks.tf` (EKS proof-of-concept roles), and `rds.tf` (database networking), with other resources declared in the region's root configuration files of the deployment.

## 2. Security Principles

The IAM strategy follows these principles:

- **Least privilege:** Grant only the permissions required to perform each responsibility.
- **Credential protection:** Do not hardcode passwords, access keys, tokens, or other secrets in source code.
- **Role-based access:** Use IAM roles to provide permissions to AWS workloads and automated processes.
- **Infrastructure as Code:** Define and maintain IAM resources, policies, and trust relationships through version-controlled configuration.
- **Separation of responsibilities:** Assign permissions according to the user's or workload's specific function.
- **Credential lifecycle management:** Provision, rotate, and revoke credentials through secure procedures.

## 3. Functional IAM Users

The functional IAM identities defined in the security design are organized according to their responsibilities.

| IAM user            | Responsibility                                              |
| ------------------- | ----------------------------------------------------------- |
| `developer-api`   | Backend API development and service monitoring.             |
| `developer-data`  | Data pipeline management for batch and streaming workloads. |
| `devops-engineer` | Infrastructure provisioning and pipeline configuration.     |
| `qa-engineer`     | Quality assurance, testing, and audit inspection.           |

These identities represent different operational responsibilities, and their permissions stay scoped to the resources and actions necessary for each function. Practices applied to functional users:

- Individual credentials; passwords are not shared.
- Credential provisioning through secure procedures and appropriate authentication controls.
- Permissions granted through controlled IAM policies, with no administrative privileges by default.
- Periodic permission reviews that revoke access no longer required.

**Security note:** Initial passwords and other credentials are not stored in this documentation or committed to the repository; the approved secret store is the source for operational credentials.

## 4. Infrastructure IAM Roles

The deployment log records six provisioned execution roles. IAM roles provide permissions to AWS services and workloads without embedding long-term AWS access keys in the applications.

### 4.1 API EC2 Role

**Role:** `mercaandes-api-ec2-role`

**Purpose:** Provide permissions to the API workloads, referenced as the task role of the ECS Fargate task definitions (see `aws/terraform/ecs_fargate.tf`):

- Access the AWS resources required by the APIs.
- Publish application and operational logs to CloudWatch.
- Access the designated S3 prefixes for their data operations.

### 4.2 Batch Processing Role

**Role:** `mercaandes-batch-node-role`

**Purpose:** Support the batch node workloads (Airflow and Spark):

- Read raw data from the Bronze and Silver S3 prefixes.
- Write processed data to the Silver and Gold prefixes and to the configured RDS resources.

### 4.3 Streaming Processing Role

**Role:** `mercaandes-streaming-node-role`

**Purpose:** Support the streaming-node workloads (Kafka and RabbitMQ operations, Spark Streaming consumers):

- Ingest and process incoming events.
- Write processed summaries to the designated S3 prefixes.

### 4.4 CI/CD Pipeline Role

**Role:** `mercaandes-cicd-pipeline-role`

**Purpose:** Support the automated deployment workflows associated with GitHub Actions:

- Build and publish images to Amazon ECR (14 repositories).
- Update task definitions and deploy services to Amazon ECS.

### 4.5 ECS Task Execution Roles

**Roles:** `mercaandes-ecs-task-execution-role` and the AWS-provided `ecsTaskExecutionRole`

**Purpose:** Allow ECS to pull images from ECR and publish container logs to CloudWatch (managed policy `AmazonECSTaskExecutionRolePolicy`, see `aws/terraform/ecs_fargate.tf`).

### 4.6 EKS Proof-of-Concept Roles

**Roles:** `mercaandes-eks-poc-cluster-role` and `mercaandes-eks-poc-node-role`

**Purpose:** Support the Sellers API Kubernetes proof of concept (`aws/terraform/eks.tf`), attaching the managed AmazonEKSClusterPolicy and the worker-node policy set (AmazonEKSWorkerNodePolicy, AmazonEKS_CNI_Policy, AmazonEC2ContainerRegistryReadOnly).

## 5. IAM Policies and Trust Relationships

IAM policies define which AWS actions an identity can perform and which resources those actions apply to. Trust policies define which principals can assume each role.

The repository's Terraform configuration is the source for the declared policies and trust relationships:

- **Identity policies:** each role's permission actions and resource scope.
- **Trust relationships:** ECS holds the services principal; the CI/CD role restricts the identities and workflows that assume it through GitHub OIDC where configured.
- **Resource scope** is narrowed to the buckets, secrets, and log groups each workload consumes.

Periodic reviews cover the resource scope, sensitive permissions (IAM, networking, databases), separation of duties (development, data processing, quality assurance, deployment), and the entities authorized to assume each role.

## 6. Compliance and Security Validation

The team continuously validates these controls:

| Control                | Validation                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| Root account security  | Root user stays out of daily operations; monitoring configured in the account.                     |
| Least privilege        | Policies reviewed against the actions consumed by each workload.                                  |
| Credential protection  | Secrets live in `.env` (git-ignored), the secret store, and the runbook; gitleaks runs in CI (`.gitleaks.toml`). |
| Role trust policies    | Only authorized principals assume each role.                                                      |
| Infrastructure as Code | Terraform declarations match the deployed `us-east-1` resources.                                  |
| CI/CD access           | Deployment credentials and role assumption restricted to the pipeline.                            |
| Access reviews         | Periodic permission and unused-access reviews.                                                    |

## 7. Implementation References

- `aws/terraform/ecs_fargate.tf` — ECS execution and task roles.
- `aws/terraform/eks.tf` — EKS proof-of-concept roles.
- `aws/task-definitions` — registered task definitions that reference the roles.
- Deployment log (`bitacora_despliegue_aws.md`) — historical record of the provisioned resources (5 custom roles + task execution roles, 14 ECR repositories, 4 Security Groups).

## 8. Summary

The MercaAndes IAM strategy separates human identities from workload roles and enforces least-privilege access across API services, data processing, streaming workloads, and automated deployments.

The security model depends on correctly scoped policies, restricted trust relationships, and secure credential management, validated by comparing the Terraform declarations with the resources deployed in the `us-east-1` region.
