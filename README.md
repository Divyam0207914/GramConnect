# GramConnect

> **Citizen-Centric Civic Issue Reporting, Offline Resilience & Governance Platform**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-5.1.0-blue.svg)](https://expressjs.com/)
[![React Version](https://img.shields.io/badge/react-18.2.0-61dafb.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-4.4.5-646cff.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB%20Atlas-47a248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Security Status](https://img.shields.io/badge/security-hardened-success.svg)](./docs/adr/0002-centralized-jwt-and-jurisdictional-rbac.md)

---

## Executive Summary

**GramConnect** is an enterprise-grade, full-stack civic governance platform engineered to eliminate bureaucratic delays, data tampering, and accessibility barriers in public grievance redressal. 

Built specifically to handle high-stakes civic management across rural, semi-urban, and urban landscapes, GramConnect delivers **offline-first client resilience**, **multi-modal reporting** (text, photo, and voice), **cryptographic tamper detection** via deterministic state hashing, and an **automated 3-tier hierarchical escalation engine** (`Block` $\to$ `District` $\to$ `State`).

Following recent infrastructure hardening ([ADR-0001](./docs/adr/0001-runtime-decoupling-and-attack-surface-reduction.md) and [Issues 001–006](./.issues)), the platform features a streamlined, deployable production core (MERN stack with Vercel SPA routing and Render-ready Node.js/Express backend) with zero external boot friction, while isolating experimental deep-learning and smart-contract pipelines into standalone companion modules.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Engineering Innovations](#key-engineering-innovations)
3. [Technology Stack](#technology-stack)
4. [Key File Map](#key-file-map)
5. [Local Development Setup](#local-development-setup)
6. [Cloud Deployment Runbook](#cloud-deployment-runbook)
7. [API Reference & Route Specifications](#api-reference--route-specifications)
8. [Companion Research Modules](#companion-research-modules)
9. [Architecture Decisions (ADRs) & Domain Model](#architecture-decisions-adrs--domain-model)
10. [Troubleshooting & Debugging](#troubleshooting--debugging)
11. [Contributing & Code Quality](#contributing--code-quality)

---

## Architecture Overview

GramConnect is architected in two clean, distinct tiers:
1. **Production Platform Core**: A hardened MERN stack responsible for all live citizen workflows, administrative triage, authentication, offline synchronization, and state integrity auditing.
2. **Companion Research Modules**: Standalone, decoupled research subsystems (PyTorch ViT/BLIP image pipeline, Vosk multilingual speech engine, and Hardhat Ethereum smart contract) preserved for offline experimentation and enterprise on-chain anchoring.

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Client Layer (Browser / PWA)                             │
│  - React 18.2 + Vite Single Page Application                                           │
│  - TailwindCSS responsive civic interface (English + Multilingual UI)                  │
│  - Service Worker (sw.js) static asset & shell caching                                  │
│  - IndexedDB (offline-complaints, sync-queue) for zero-connectivity field submission    │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                                            │ HTTPS / REST (JWT Bearer Auth)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           API Gateway & Backend (Express 5.1)                           │
│  - Centralized JWT Engine & Fail-Fast Secret Hygiene (ADR-0002)                         │
│  - 4-Tier Jurisdictional RBAC (Block, District, State, Owner)                           │
│  - Insecure Direct Object Reference (IDOR) Scoping Guards                               │
│  - Daily Auto-Escalation Engine (node-cron @ 02:00 AM) (ADR-0005)                       │
│  - Deterministic 30-Minute State Hash Tamper Detection (ADR-0003)                      │
└─────────────────────┬───────────────────────────┬─────────────────────────┬─────────────┘
                      │                           │                         │
                      ▼                           ▼                         ▼
┌───────────────────────────────┐   ┌───────────────────────────┐   ┌─────────────────────┐
│   Primary Database (Atlas)    │   │  Media Storage Service    │   │ Cryptographic Audit │
│  - MongoDB with Mongoose 8.19 │   │  - Cloudinary CDN         │   │ - SystemMeta (main) │
│  - Complaints & Validations   │   │  - Multer multipart/form  │   │ - SHA-256 Digest    │
│  - Scoped Official Accounts   │   │  - MemoryStorage fallback │   │ - Versioned History │
└───────────────────────────────┘   └───────────────────────────┘   └─────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │ (Decoupled Companion Modules - Standalone)    │
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │   AI/ML Research Subsystem  │                 │  Smart Contract Subsystem   │
     │  - PyTorch 2.0+ ViT / BLIP  │                 │  - Hardhat 3.0 + Solidity   │
     │  - Vosk Multilingual STT    │                 │  - SystemHash.sol Anchor    │
     └─────────────────────────────┘                 └─────────────────────────────┘
```

---

## Key Engineering Innovations

### 1. Offline-First Field Resilience
Civic issues frequently occur in rural zones with intermittent or absent cellular networks. GramConnect ensures zero data loss:
- **Service Worker (`sw.js`)**: Serves the application shell instantly from local cache.
- **IndexedDB Local Storage**: Intercepts offline submissions, creates local temporary IDs, and buffers records into a persistent transactional client store.
- **Auto-Sync Manager (`syncManager.js`)**: Automatically listens for `window.online` events and flushes pending records to the backend via sequential FIFO dispatch.

### 2. Hardened Jurisdictional RBAC & IDOR Elimination
Remediated under [Issues 001–006](./.issues) and documented in [ADR-0002](./docs/adr/0002-centralized-jwt-and-jurisdictional-rbac.md):
- **Centralized Middleware**: `authenticate`, `requireRole`, and `requireDesignation` enforce uniform claims validation.
- **No Client Privilege Escalation**: Registration forces `role: "citizen"`. Incoming payloads cannot inject roles or official designations.
- **Strict Query Scoping**: Citizens can only query their own authored complaints (`req.user.id`). Officials can only view complaints inside their assigned department and jurisdictional boundaries (`Block`, `District`, `State`).
- **Owner Administrative Shield**: Only officials with `designation: "Owner"` can publish system hashes, access global cross-jurisdiction audits, or delete official profiles.

### 3. Cryptographic State Hashing & Tamper Detection
To ensure that records are not manipulated or deleted within the database:
- **Deterministic SHA-256 Digest**: The backend compiles all complaint documents in sorted `_id` sequence and produces a canonical cryptographic digest.
- **`SystemMeta` Singleton**: The digest is version-stamped in MongoDB `SystemMeta` alongside a rolling historical audit log (`hashHistory`).
- **Automated 30-Minute Sentinel**: A background interval recalculates active database integrity against the stored digest. Discrepancies immediately flag a `TAMPERED` diagnostic status.

### 4. Automated 3-Tier Escalation Engine
Bureaucratic delays are countered through programmatic promotion ([ADR-0005](./docs/adr/0005-hierarchical-auto-escalation-state-machine.md)):
- A daily cron scheduler (`0 2 * * *`) scans unresolved complaints (`submitted` or `in_progress`).
- Complaints stagnant at `Block` or `District` for $\ge 10$ days are automatically escalated to the next administrative tier:
  $$\text{Block} \xrightarrow{\ge 10\text{ days}} \text{District} \xrightarrow{\ge 10\text{ days}} \text{State}$$
- Each escalation unassigns the prior officer, notifies the higher tier, and records an immutable log entry in `escalationHistory`.

### 5. Community Validation Integrity Gate
Officials cannot arbitrarily mark an issue as `closed` to artificially inflate resolution statistics. 
- When an official completes work (`resolved`), a **Validation Request** is dispatched to community citizens.
- The complaint transitions to `closed` only after the reporting citizen or local community members explicitly verify the resolution in the real world.

---

## Technology Stack

### Core Production Platform

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `18.2.0` | Declarative, component-based user interface |
| **Build Tooling** | Vite | `4.4.5` | Fast HMR and optimized SPA production bundling |
| **Styling** | Tailwind CSS | `3.3.3` | Utility-first responsive design and civic UI system |
| **Routing** | React Router DOM | `6.16.0` | Client-side routing with role-protected route wrappers |
| **Icons & UI** | Lucide React | `0.284.0` | Modern, accessible iconography |
| **Client Storage** | IndexedDB API | Native | Offline transactional complaint and sync storage |
| **Offline Proxy** | Service Workers | Native | Network caching and offline application shell |
| **Backend Runtime** | Node.js (ES Modules) | `>=18.0.0` | Scalable asynchronous JavaScript server runtime |
| **Web Framework** | Express | `5.1.0` | Lightweight REST API gateway and routing |
| **Database & ODM** | MongoDB / Mongoose | `8.19.2` | Document database with strict schema validation |
| **Authentication** | JSON Web Tokens | `9.0.2` | Stateless cryptographic bearer authentication |
| **Password Hashing** | bcryptjs | `3.0.2` | Salted SHA-512 password protection |
| **File Storage** | Cloudinary & Multer | `1.41.3` | Cloud media uploads with in-memory fallback |
| **Cron Scheduling** | node-cron | `4.2.1` | Background job execution for auto-escalation |

### Companion Subsystems (Standalone)

| Module | Technologies | Status | Purpose |
| :--- | :--- | :--- | :--- |
| **`img_to_txt`** | PyTorch, Vision Transformer (ViT), BLIP | Standalone / Research | Deep-learning civic image classification and captioning |
| **`Spch_to_txt`** | Vosk, Python Audio Pipeline | Standalone / Research | Offline multilingual Indian language speech transcription |
| **`blockchain-systemHash`**| Solidity `0.8.28`, Hardhat `3.0` | Standalone / Extension | On-chain EVM smart contract for external state anchoring |

---

## Key File Map

```
JanMitra/
├── CONTEXT.md                    # Ubiquitous domain terminology and bounded contexts map
├── README.md                     # Main documentation & engineering runbook
├── .issues/                      # Security audit specifications (Issues 001–006)
├── docs/
│   └── adr/                      # Architecture Decision Records (0001–0005)
│       ├── 0001-runtime-decoupling-and-attack-surface-reduction.md
│       ├── 0002-centralized-jwt-and-jurisdictional-rbac.md
│       ├── 0003-state-hash-tamper-detection-via-systemmeta.md
│       ├── 0004-offline-first-resilience-with-indexeddb-and-service-workers.md
│       └── 0005-hierarchical-auto-escalation-state-machine.md
├── backend/
│   ├── .env.example              # Documented backend environment configuration
│   ├── package.json              # Backend dependencies & npm scripts
│   └── src/
│       ├── app.js                # Express app, CORS allowlists, route mounting
│       ├── index.js              # Server entry point, cron schedulers, fail-fast checks
│       ├── middleware/
│       │   └── auth.js           # Centralized JWT authentication & 4-tier RBAC guards
│       ├── models/
│       │   ├── complaint.model.js# Complaint schema, escalation history, status enums
│       │   ├── official.model.js # Official schema, designations (Block, District, State, Owner)
│       │   ├── user.model.js     # Citizen schema with strict role protections
│       │   ├── validation.model.js# Community peer-validation records
│       │   └── systemMeta.model.js# Singleton cryptographic global state hash tracker
│       ├── controllers/          # Business logic handlers (sanitized projections, IDOR checks)
│       ├── routes/               # API route definitions
│       ├── services/
│       │   └── autoEscalation.js # 10-day cron escalation state machine
│       └── utils/
│           ├── hashUtils.js      # Deterministic SHA-256 state calculation
│           ├── hashComparison.js # Multi-user and system hash auditing
│           └── tamperDetection.js# Automated 30-minute tamper detection engine
└── frontend/
    ├── .env.example              # Documented frontend API URL configuration
    ├── vercel.json               # Vercel SPA routing rewrite rules
    ├── package.json              # Frontend dependencies & npm scripts
    ├── public/
    │   └── sw.js                 # Service Worker for offline caching
    └── src/
        ├── App.jsx               # Client routing with ProtectedRoute guards
        ├── pages/                # User & Admin Dashboards, Login, Signup, Landing
        ├── components/           # Civic UI forms, triage tables, system integrity widget
        ├── services/
        ├── api.js                # Axios client with automatic Bearer token interceptor
        └── utils/
            ├── indexedDB.js      # Client-side offline storage engine
            ├── syncManager.js    # Automatic FIFO online synchronization queue
            └── registerSW.js     # Service Worker registration helper
```

---

## Local Development Setup

> **Target Setup Time: Under 10 minutes**

### Prerequisites
- **Node.js**: `>= 18.0.0` ([Download Node.js](https://nodejs.org/))
- **npm**: `>= 9.0.0`
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/gramconnect`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

---

### Step 1: Clone and Enter Repository

```bash
git clone https://github.com/AayushM0/JanMitra.git GramConnect
cd GramConnect
```

---

### Step 2: Configure & Start Backend

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `backend/.env` with your preferred editor:
   ```ini
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

   # MongoDB Connection String
   MONGODB_URI=mongodb://localhost:27017/gramconnect

   # JWT Secret (minimum 32 characters for security)
   JWT_SECRET=gramconnect-super-secure-jwt-secret-key-32-chars-min

   # Cloudinary (Optional: leaves uploads in memory if empty)
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```
   *Expected Output:*
   ```text
   Environment variables:
   - MONGODB_URI: SET
   - JWT_SECRET: SET
   MongoDB Connected successfully
   Server running on port 5000
   Auto-escalation scheduler started (runs daily at 2:00 AM)
   ```

---

### Step 3: Configure & Start Frontend

1. **Open a new terminal and enter the frontend directory:**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure environment variables (Optional in dev):**
   ```bash
   cp .env.example .env
   ```
   *For local development, leaving `VITE_API_URL` empty automatically proxies API calls to Vite's local routing.*

3. **Start the Vite dev server:**
   ```bash
   npm run dev
   ```
   *Expected Output:*
   ```text
     VITE v4.4.5  ready in 240 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

---

### Step 4: Verification Checklist

- [ ] Open `http://localhost:5173` in your browser. The GramConnect landing page should render with navigation links.
- [ ] Test the backend health endpoint:
  ```bash
  curl http://localhost:5000/
  # Returns: "hello"
  ```
- [ ] Test system hash integrity check:
  ```bash
  curl http://localhost:5000/api/system/hash-check
  # Returns: {"message":"Hash comparison completed","report":{...}}
  ```
- [ ] Register a test citizen at `http://localhost:5173/register` and file a test complaint.
- [ ] Toggle browser DevTools Network tab to **Offline**: verify the Service Worker loads and that the submission is preserved in IndexedDB.

---

## Cloud Deployment Runbook

### Backend Deployment (Render / Railway / Fly.io)

1. **Create a new Web Service** connected to your repository.
2. **Root Directory**: Set to `backend`.
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enforces fail-fast JWT validation |
   | `PORT` | `5000` (or platform default `$PORT`) | Server listener port |
   | `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/gramconnect` | MongoDB Atlas URI |
   | `JWT_SECRET` | `<32+ random characters>` | Cryptographic signing secret |
   | `ALLOWED_ORIGINS` | `https://your-gramconnect-frontend.vercel.app` | Comma-separated CORS allowed origins |
   | `CLOUDINARY_CLOUD_NAME` | `<your-cloud-name>` | Cloudinary CDN bucket |
   | `CLOUDINARY_API_KEY` | `<your-api-key>` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `<your-api-secret>` | Cloudinary API Secret |

---

### Frontend Deployment (Vercel)

1. **Import the repository** into Vercel.
2. **Root Directory**: Select `frontend`.
3. **Framework Preset**: `Vite`.
4. **Build & Output Settings**:
   - Build Command: `vite build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
6. **SPA Routing**: The included `frontend/vercel.json` automatically handles client-side routing rewrites:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

---

## API Reference & Route Specifications

All mutating endpoints require `Authorization: Bearer <token>` unless explicitly marked public.

### Authentication & Citizens (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Registers a new citizen. Forces `role: "citizen"`. |
| `POST` | `/api/users/login` | Public | Authenticates citizen and returns signed JWT token. |
| `GET` | `/api/users` | Official | Returns sanitized list of registered citizens. |
| `PUT` | `/api/users/:id` | Authenticated | Updates personal profile (`name`, `phone`, `location`). |
| `DELETE`| `/api/users/:id` | Authenticated | Deletes own account. |

### Government Officials (`/api/officials`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/officials/register`| Public / Admin | Registers an official (`Block`, `District`, `State`, `Owner`).|
| `POST` | `/api/officials/login` | Public | Authenticates official and returns scoped token claims. |
| `GET` | `/api/officials/dashboard`| Official | Returns complaints scoped strictly to official's jurisdiction.|
| `PUT` | `/api/officials/:id` | Official | Updates official profile and operational metadata. |
| `DELETE`| `/api/officials/:id` | Owner | Deletes official account (strictly locked to `Owner`). |

### Complaint Lifecycle (`/api/complaints`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Citizen | Creates complaint (binds author strictly to `req.user.id`). |
| `GET` | `/api/complaints` | Authenticated | Returns complaints scoped to user role/jurisdiction. |
| `PUT` | `/api/complaints/:id` | Authenticated | Modifies complaint content (IDOR protected). |
| `PUT` | `/api/complaints/:id/status`| Official | Updates status (`submitted` $\to$ `in_progress` $\to$ `resolved`).|
| `PUT` | `/api/complaints/:id/escalate`| Official | Manually promotes complaint to higher administrative tier. |
| `GET` | `/api/complaints/eligible-escalation`| Official | Lists complaints exceeding 10-day inactivity window. |
| `POST` | `/api/complaints/auto-escalate`| Owner | Triggers batch auto-escalation evaluation on demand. |
| `POST` | `/api/complaints/process-image`| Authenticated | Ingests image multipart upload and returns metadata. |
| `DELETE`| `/api/complaints/:id` | Authenticated | Removes complaint (restricted to author or Owner). |

### Community Validation (`/api/validation`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/validation/request` | Official | Dispatches a community peer-review request for an issue. |
| `POST` | `/api/validation/respond` | Citizen | Submits citizen resolution vote (`verified` or `rejected`).|
| `GET` | `/api/validation/pending/:userId`| Authenticated | Retrieves pending validation requests for user's locale.|
| `GET` | `/api/validation/stats/:complaintId`| Authenticated| Returns aggregate validation percentages and status. |

### Cryptographic Integrity & Tamper Detection

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/system/hash-check` | Public / Audit | Runs comprehensive 30-min comparison audit of database. |
| `GET` | `/api/blockchain/get-hash` | Authenticated | Retrieves active state hash from `SystemMeta`. |
| `POST` | `/api/blockchain/update-hash`| Owner | Recalculates and commits a new global state hash. |

---

## Companion Research Modules

The repository preserves three high-value standalone research and extension modules:

### 1. Vision Classifier & Captioner (`img_to_txt/`)
- **Technologies**: PyTorch 2.0+, Vision Transformer (ViT), BLIP (`Salesforce/blip-image-captioning-base`).
- **Capability**: Trained on civic datasets (`electricpole`, `garbage`, `potholes`) to classify civic issue categories and generate human-readable defect descriptions from photos.
- **Run Standalone:**
  ```bash
  cd img_to_txt
  pip install -r requirements.txt
  python generate_description.py --image potholes.jpg
  ```

### 2. Multilingual Speech-to-Text Pipeline (`Spch_to_txt/`)
- **Technologies**: Vosk offline acoustic models (`vosk-model-spk-0.4`).
- **Capability**: Processes spoken voice input across Indian regional languages (Hindi, Telugu, Punjabi, Gujarati, Marathi) without cloud API latency.
- **Run Standalone:**
  ```bash
  cd Spch_to_txt
  pip install vosk sounddevice
  python speech_to_text.py
  ```

### 3. Hardhat EVM Smart Contract (`blockchain-systemHash/`)
- **Technologies**: Solidity `0.8.28`, Hardhat, Ethers.js.
- **Capability**: `SystemHash.sol` stores immutable state digests on Ethereum-compatible blockchains for multi-organization civic consortiums.
- **Run Standalone:**
  ```bash
  cd blockchain-systemHash
  npm install
  npx hardhat test
  ```

---

## Architecture Decisions (ADRs) & Domain Model

Every foundational architectural choice in GramConnect is formally documented:

- **[`CONTEXT.md`](./CONTEXT.md)**: Ubiquitous Language glossary, bounded contexts, and complaint lifecycle state machine.
- **[`ADR-0001: Runtime Decoupling & Attack Surface Reduction`](./docs/adr/0001-runtime-decoupling-and-attack-surface-reduction.md)**: Severing in-process Python/Web3 dependencies for instant, zero-friction cloud deployment.
- **[`ADR-0002: Centralized JWT Engine & Jurisdictional RBAC`](./docs/adr/0002-centralized-jwt-and-jurisdictional-rbac.md)**: Fail-fast secrets, citizen role enforcement, IDOR elimination, and 4-tier official scoping.
- **[`ADR-0003: State Hash Tamper Detection via SystemMeta`](./docs/adr/0003-state-hash-tamper-detection-via-systemmeta.md)**: Deterministic SHA-256 database auditing with versioned historical rollback logs.
- **[`ADR-0004: Offline-First Resilience with IndexedDB & Service Workers`](./docs/adr/0004-offline-first-resilience-with-indexeddb-and-service-workers.md)**: Zero-loss client caching and auto-sync queue for connectivity-constrained field environments.
- **[`ADR-0005: Hierarchical Auto-Escalation State Machine`](./docs/adr/0005-hierarchical-auto-escalation-state-machine.md)**: 10-day cron-driven escalation across `Block` $\to$ `District` $\to$ `State` tiers.

---

## Troubleshooting & Debugging

| Symptom / Error | Cause | Resolution & Verification |
| :--- | :--- | :--- |
| `FATAL: JWT_SECRET environment variable is missing or insecure in production.` | `NODE_ENV=production` is set but `JWT_SECRET` is missing or $< 32$ characters. | Set a secure 32+ character string in `backend/.env`. Verify: Server boots with `JWT_SECRET: SET`. |
| `MongooseServerSelectionError: connect ECONNREFUSED` | MongoDB is not running locally or Atlas network access IP is blocked. | Ensure local mongod is active (`mongod`) or add `0.0.0.0/0` to your MongoDB Atlas IP Access List. |
| `Not allowed by CORS` | The client origin is not registered in `ALLOWED_ORIGINS`. | Add your frontend URL (e.g., `http://localhost:5173` or Vercel domain) to `ALLOWED_ORIGINS` in `backend/.env`. |
| `401 Unauthorized: Access denied. No token provided.` | Protected endpoint called without Bearer token. | Inspect Network tab: Ensure `Authorization: Bearer <token>` header is attached. |
| `403 Forbidden: Higher administrative designation required.` | Non-Owner official attempting to update system hashes or delete accounts. | Authenticate with an account configured with `designation: "Owner"`. |
| `IntegrityStatus: TAMPERED` | Direct DB manipulation detected: active complaint data does not match `globalHash`. | Check `/api/system/hash-check` report; inspect database logs for unauthorized manual writes. |

---

## Contributing & Code Quality

1. **Fork the repository** and create a feature branch (`git checkout -b feature/governance-enhancement`).
2. **Follow Code Conventions**:
   - Maintain the ubiquitous language defined in [`CONTEXT.md`](./CONTEXT.md).
   - Never introduce unauthenticated endpoints or fallback credentials.
   - Guard all new routes with `authenticate`, `requireRole`, or `requireDesignation`.
3. **Run Code Linters**:
   ```bash
   cd frontend && npm run lint
   ```
4. **Submit a Pull Request** linking to any corresponding Architecture Decision Records.

---

## License

This project is licensed under the [ISC License](LICENSE).
