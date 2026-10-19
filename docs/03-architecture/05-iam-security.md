
# MercaAndes AWS IAM Security & Access Control

## 1. Overview

MercaAndes uses AWS Identity and Access Management (IAM) to define identities, permissions, and access control for its cloud infrastructure and workloads.

This documentation describes the IAM strategy associated with **US-03**, including functional IAM users, infrastructure roles, least-privilege access, and security practices.

The IAM configuration is intended to be managed through Infrastructure as Code (IaC), allowing permissions and trust relationships to be defined and reviewed alongside the infrastructure configuration.

> **Implementation status:** The presence of IAM declarations in Terraform does not, by itself, confirm that the resources have been deployed or that the corresponding permissions are active in AWS. Deployment status must be verified independently.

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

These identities represent different operational responsibilities. Their actual permissions should be restricted to the resources and actions necessary for each role.

### 3.1 User Access Requirements

The following practices should be applied to functional users:

- Use individual credentials and avoid sharing passwords.
- Require secure credential provisioning and appropriate authentication controls.
- Grant permissions through controlled IAM policies.
- Review permissions periodically and revoke access when it is no longer required.
- Avoid granting administrative privileges by default.

**Security note:** Initial passwords and other credentials must not be stored in this documentation or committed to the repository.

## 4. Infrastructure IAM Roles

IAM roles provide permissions to AWS services and workloads without requiring applications to embed long-term AWS access keys.

The following roles are part of the MercaAndes IAM design.

### 4.1 API EC2 Role

**Role:** `mercaandes-api-ec2-role`

**Purpose:** Provide permissions required by API workloads running on EC2.

The intended responsibilities include:

- Accessing the AWS resources required by the APIs.
- Publishing application or operational logs.
- Supporting the configured interactions with database-related resources.

Permissions must be limited to the specific resources and actions required by the deployed application.

### 4.2 Batch Processing Role

**Role:** `mercaandes-batch-node-role`

**Purpose:** Support batch data-processing workloads involving Spark and Airflow.

The intended responsibilities include:

- Reading raw data from the appropriate Amazon S3 locations.
- Supporting data-processing operations.
- Writing processed data to the configured Amazon RDS resources.

The actual permissions must match the implemented processing architecture and the resources used by each workload.

### 4.3 Streaming Processing Role

**Role:** `mercaandes-streaming-node-role`

**Purpose:** Support workloads that ingest and process streaming events.

The intended responsibilities include:

- Supporting the required Kafka and RabbitMQ workloads.
- Processing incoming events.
- Writing processed summaries to the designated Amazon S3 locations.

Access to messaging services and storage must be explicitly configured according to the services used by the deployed architecture.

### 4.4 CI/CD Pipeline Role

**Role:** `mercaandes-cicd-pipeline-role`

**Purpose:** Support automated deployment workflows associated with GitHub Actions and AWS container services.

The intended responsibilities include:

- Supporting the deployment pipeline.
- Interacting with Amazon ECR for container image operations.
- Supporting deployments to Amazon ECS where configured.

If GitHub Actions assumes this role, the trust policy should restrict which identities and workflows can assume it. Where supported by the deployment setup, short-lived credentials and GitHub OIDC should be preferred over long-term access keys.

## 5. IAM Policies and Trust Relationships

IAM policies define which AWS actions an identity can perform and which resources those actions apply to.

Trust policies define which principals are allowed to assume an IAM role.

The MercaAndes IAM configuration should be reviewed for the following:

- **Identity policies:** Verify the actions granted to each user or role.
- **Resource scope:** Restrict permissions to the required AWS resources whenever possible.
- **Trust relationships:** Limit role assumption to authorized AWS services, identities, or deployment workflows.
- **Sensitive permissions:** Review permissions that allow changes to IAM, networking, databases, or production infrastructure.
- **Separation of duties:** Keep development, data processing, quality assurance, and deployment responsibilities appropriately separated.

The Terraform configuration in `main.tf` should be used as the source for documenting the IAM resources and trust policies actually declared in the repository.

Do not describe a permission as implemented unless it is supported by the configuration or verified in the AWS environment.

## 6. Compliance and Security Validation

The IAM design identifies several security requirements that should be validated during implementation and operation.

| Control                | Validation                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| Root account security  | Verify the root account's access-key status and other applicable security controls in AWS.       |
| Least privilege        | Review policies for unnecessary actions and broad resource permissions.                          |
| Credential protection  | Check that secrets are not committed to the repository or exposed in documentation.              |
| Role trust policies    | Confirm that only authorized principals can assume each role.                                    |
| Infrastructure as Code | Compare the IAM resources declared in Terraform with the deployed AWS configuration.             |
| CI/CD access           | Verify that deployment credentials and role-assumption permissions are appropriately restricted. |
| Access reviews         | Periodically review user identities, permissions, and unused access.                             |

**Important:** Compliance statements such as root access keys being revoked or deleted must only be recorded as completed after verification in AWS. Terraform declarations alone do not prove that an account-level security action has occurred.

## 7. Implementation References

The primary implementation reference for this IAM configuration is:

- `main.tf` — inspect the IAM resources, policy declarations, and trust relationships defined in the Terraform configuration.

Additional AWS configuration files may be referenced when they exist in the repository and contain relevant IAM declarations.

## 8. Summary

The MercaAndes IAM strategy separates human identities from workload roles and aims to enforce least-privilege access across API services, data processing, streaming workloads, and automated deployments.

The security model depends on correctly scoped policies, restricted trust relationships, secure credential management, and verification that the declared configuration matches the resources deployed in AWS.
