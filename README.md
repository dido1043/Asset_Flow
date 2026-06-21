# AssetFlow

A role-based asset management and tracking system for organizations. AssetFlow lets leaders manage IT hardware inventory, assign assets to employees, and generate formal PDF protocols — all with fine-grained role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Roles & Permissions](#roles--permissions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Running with Docker](#running-with-docker)
  - [Running Locally (Manual)](#running-locally-manual)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)

---

## Features

- **User Management** — Registration, login, Google OAuth2, profile editing, role assignment
- **Organization Management** — Create organizations, add members, promote leaders
- **Asset/Product Inventory** — Track IT hardware and other types of assets by asset tag, type, brand, and model
- **Assignment Tracking** — Assign products to employees and record return dates
- **Protocol Generation** — Generate and download formal PDF protocols for asset assignments and returns
- **Role-Based Access Control** — Three-tier permission model (Admin / Leader / Employee)
- **Internationalization** — UI supports English and Bulgarian

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.0 |
| Database | PostgreSQL 16 |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Liquibase |
| Security | Spring Security, JWT (JJWT 0.11.5), OAuth2 |
| PDF Generation | iText 8 |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Testing | JUnit 5, Testcontainers |
| Build | Maven |

### Frontend
| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| State | React Context API |
| HTTP | Native Fetch API |
| Build | npm |

### Infrastructure
- **Docker & Docker Compose** — containerized multi-service setup
- **Embedded Tomcat** — bundled with the Spring Boot JAR

---

## Architecture Overview

```
┌──────────────────────────────────┐      ┌──────────────────────────────────────┐
│       Next.js Frontend           │      │          Spring Boot Backend          │
│  (localhost:3000)                │◄────►│  (localhost:8080)                    │
│                                  │ JWT  │                                      │
│  ┌──────────────────────────┐   │Cookie│  ┌──────────┐   ┌────────────────┐  │
│  │   Workspace Shell        │   │      │  │Controllers│──►│    Services    │  │
│  │  ┌────────────────────┐  │   │      │  └──────────┘   └───────┬────────┘  │
│  │  │ Sections (6 views) │  │   │      │                         │            │
│  │  │ - Profile          │  │   │      │  ┌──────────────────────▼─────────┐  │
│  │  │ - Users            │  │   │      │  │  Authorization Service (RBAC)  │  │
│  │  │ - Organizations    │  │   │      │  └──────────────────────┬─────────┘  │
│  │  │ - Products         │  │   │      │                         │            │
│  │  │ - Assignments      │  │   │      │  ┌──────────────────────▼─────────┐  │
│  │  │ - Protocols        │  │   │      │  │      Repositories / JPA        │  │
│  │  └────────────────────┘  │   │      │  └──────────────────────┬─────────┘  │
│  └──────────────────────────┘   │      │                         │            │
└──────────────────────────────────┘      └─────────────────────────┼────────────┘
                                                                     │
                                                          ┌──────────▼──────────┐
                                                          │    PostgreSQL 16     │
                                                          └─────────────────────┘
```

JWT tokens are stored in HTTP-only cookies. The frontend attaches them automatically on every request. Google OAuth2 is supported via an exchange endpoint.

---

## Roles & Permissions

| Action | EMPLOYEE | LEADER | ADMIN |
|---|:---:|:---:|:---:|
| View own profile | ✓ | ✓ | ✓ |
| View org users | | ✓ | ✓ |
| Manage org products | | ✓ | ✓ |
| Manage assignments | | ✓ | ✓ |
| Generate protocols | | ✓ | ✓ |
| Create / manage organizations | | ✓ | ✓ |
| Promote users to leader | | | ✓ |
| View all users / all assets | | | ✓ |
| Delete users | | | ✓ |

---

