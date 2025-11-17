# PopFlash Monorepo

PopFlash is a Counter-Strike 2 virtual asset marketplace combining trading, social collections, and AI-powered insights. This repository hosts the full-stack implementation spanning web, mobile, backend services, infrastructure, and automation.

## Structure

```
apps/            # User-facing clients (web, mobile)
services/        # Backend microservices (API gateway, auth, trading, escrow, compliance)
packages/        # Shared libraries, UI kit, config packages
infrastructure/  # IaC definitions (Terraform, deployment configs)
.github/         # CI/CD workflows
```

## Getting Started

1. Install prerequisites: Node.js 18+, npm 9+, Docker, Terraform.
2. Install dependencies (locked):
   ```bash
   npm install --ignore-scripts
   ```
3. Copy `.env.example` files within each workspace and populate required secrets.
4. Run checks:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

## Milestones

- **Milestone 1**: Platform foundations (auth, user profiles, Steam sync, escrow scaffolding).
- **Milestone 2**: Trading flows, payments, Persona KYC integration.
- **Milestone 3**: Collections, social discovery, analytics instrumentation.
- **Milestone 4**: AI insights and content generation features.
- **Milestone 5**: Hardening, compliance certification, launch readiness.