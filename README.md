# Cert-Maker Application Blueprint

## Project Overview
**Cert-Maker** is a Next.js-based certificate generation platform that enables users to design and generate certificates dynamically. Users can authenticate via Google OAuth or traditional email/password authentication. The platform offers a dashboard to create certificate templates, manage datasets, and execute certificate projects, with an option to schedule certificate generation.

## Tech Stack
- **Frontend:** Next.js, Tailwind CSS, ShadCN UI Components
- **Backend:** Supabase (Auth & Database), Prisma ORM
- **Authentication:** Supabase Auth (Google OAuth & Email/Password)
- **Storage:** Supabase Storage (for PDFs & images)
- **Scheduler:** Supabase Edge Functions (for scheduled executions)

## Features & Modules

### 1. Authentication & User Management
- Users can register and log in using:
  - Google OAuth
  - Email & Password authentication
- Users can manage their profile settings.

### 2. Dashboard
After logging in, users will access a dashboard with the following functionalities:

#### a) Certificate Template Management
- Users can create custom certificate templates.
- Options for template dimensions (A4, Letter, Custom).
- Upload PDF as a base template.
- Add static and dynamic labels:
  - Customize font-family, font size, font style, alignment, etc.
- Add images and adjust their size/position.
- Define naming conventions for generated certificates with a running number to ensure uniqueness.

#### b) Dataset Management
- Users can create datasets to feed into certificate templates.
- Options for data input:
  - Upload CSV files.
  - Manually create datasets (Add columns and rows).
- Datasets will be stored in Supabase.

#### c) Certificate Generation & Execution
- Users can generate certificates manually or schedule automatic execution.
- Execution progress can be monitored in real-time.
- Option to compress generated certificates into a single ZIP file.
- Users can preview and download generated certificates.

## Database Schema (Using Prisma ORM)

### User Table
```prisma
model User {
  id           String  @id @default(uuid())
  email        String  @unique
  name         String?
  password     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### CertificateTemplate Table
```prisma
model CertificateTemplate {
  id           String  @id @default(uuid())
  userId       String
  title        String
  baseTemplate String  // PDF URL
  dimensions   String  // A4, Letter, Custom
  labels       Json    // Label configurations
  images       Json    // Image configurations
  fileNaming   String  // Naming convention with running number
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User @relation(fields: [userId], references: [id])
}
```

### Dataset Table
```prisma
model Dataset {
  id        String  @id @default(uuid())
  userId    String
  title     String
  data      Json    // Store CSV data as JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User @relation(fields: [userId], references: [id])
}
```

### CertificateExecution Table
```prisma
model CertificateExecution {
  id              String  @id @default(uuid())
  userId          String
  templateId      String
  datasetId       String
  status          String  // Queued, Processing, Completed
  outputFiles     Json    // List of generated files
  scheduledAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User @relation(fields: [userId], references: [id])
  template        CertificateTemplate @relation(fields: [templateId], references: [id])
  dataset        Dataset @relation(fields: [datasetId], references: [id])
}
```

## API Endpoints
### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`

### Certificate Templates
- `POST /api/templates/create`
- `GET /api/templates/list`
- `GET /api/templates/:id`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`

### Dataset Management
- `POST /api/datasets/create`
- `GET /api/datasets/list`
- `GET /api/datasets/:id`
- `PUT /api/datasets/:id`
- `DELETE /api/datasets/:id`

### Certificate Execution
- `POST /api/execute/manual`
- `POST /api/execute/schedule`
- `GET /api/execute/status/:id`
- `GET /api/execute/result/:id`

## Deployment & Hosting
- **Frontend Hosting:** Vercel
- **Backend & Database:** Supabase
- **File Storage:** Supabase Storage

## Future Enhancements
- AI-powered auto-layout for certificate templates.
- Webhooks for notifying users about execution completion.
- Team collaboration features.
- Integration with third-party email services for sending certificates.

## Conclusion
Cert-Maker provides an intuitive and scalable solution for designing and generating certificates. Built with Next.js, Supabase, and Prisma ORM, it ensures a seamless experience for users to create, manage, and generate certificates efficiently.

