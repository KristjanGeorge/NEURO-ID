# NEURO-ID

**Digital Identity and Wallet for the NEUROTOKEN Tokenization Platform**

> IEEE 830-1998 Software Requirements Specification

---

## 1. Introduction

### 1.1 Purpose
NEURO-ID is the legal digital identity infrastructure for NEUROTOKEN platform users. It provides biometric-secured identity, NEUROCOIN wallet management, NEUROTOKEN asset portfolio, IIoT asset connections, and a personal document vault (NeuroPocket) — all accessible from a React Native mobile app.

### 1.2 Scope
- **Mobile App**: React Native / Expo (iOS + Android), dark NEUROTOKEN theme
- **Backend Service**: Fastify 4 microservice, port 6000
- **Storage**: PostgreSQL 16 (schema `neuro_id`), MinIO (documents/selfies)
- **Integrations**: SmartLab (KYC/market), NEUROPAY (transactions), NEUROCOIN (balance), ejabberd XMPP (IIoT)

### 1.3 Repository
`https://github.com/KristjanGeorge/NEURO-ID`

---

## 2. System Overview

```
NEURO-ID Mobile App (React Native)
         │  REST/HTTPS
         ▼
  neuro-id-service:6000
         │
  ┌──────┼──────────────┐
  │      │              │
  ▼      ▼              ▼
SmartLab NEUROPAY    neurocoin
 :5000    :4000        :3001
  (KYC)  (txns)    (balance)
         │
  PostgreSQL:5432  MinIO:9000  XMPP:5222
  (neuro_id schema)
```

---

## 3. Functional Requirements

### RF-01 — Authentication
- FR-01.1: Register with email, password, full name, document type/number
- FR-01.2: Login with JWT (24h expiry), session stored in PostgreSQL
- FR-01.3: Biometric authentication (fingerprint / Face ID) via challenge-response nonce
- FR-01.4: Credential storage in Expo SecureStore (never in AsyncStorage)

### RF-02 — Digital Identity (NEURO-ID Card)
- FR-02.1: W3C DID generation on registration: `did:neuron:cl:<uuid>`
- FR-02.2: Biometric selfie captured via expo-camera, stored in MinIO
- FR-02.3: KYC verification levels 1-3 via SmartLab (`/v1/compliance/kyc`)
- FR-02.4: QR code generation for wallet (PAYMENT, AUTH, TRANSFER types)
- FR-02.5: Identity card displays: photo, DID, document, KYC badge, status

### RF-03 — NEUROCOIN Wallet
- FR-03.1: Balance query from neurocoin-service (`/v1/balance/:did`)
- FR-03.2: Live USD/CLP parity from exchangerate-api (5-minute cache)
- FR-03.3: NEUROTOKEN holdings list from SmartLab
- FR-03.4: Transaction history from NEUROPAY
- FR-03.5: Wallet address derived from DID: `ncn:<did-uuid-stripped>`

### RF-04 — NEUROTOKEN Portfolio
- FR-04.1: List purchased NEUROTOKEN projects with quantities and values
- FR-04.2: Token detail: asset info, IIoT status, legal docs reference
- FR-04.3: Sell button to secondary market flow via SmartLab
- FR-04.4: Liquidation request to Escrow Bank contact

### RF-05 — NeuroPocket (Personal Document Vault)
- FR-05.1: Upload documents (driver license, passport, medical, insurance, property, custom)
- FR-05.2: Documents stored in MinIO with SHA-256 content hash
- FR-05.3: Each document generates QR payload for federated external interop
- FR-05.4: Presigned download URLs (1h TTL)
- FR-05.5: Expiry tracking and visual expiry badge

### RF-06 — IIoT Asset Connections (IEEE P1451.99)
- FR-06.1: Register asset connections (XMPP/MQTT/HTTP protocols)
- FR-06.2: Live status probe via ejabberd HTTP API
- FR-06.3: Telemetry display from last XMPP presence
- FR-06.4: One connection per physical asset (unique asset_did)

### RF-07 — Secondary Market
- FR-07.1: Browse active listings from SmartLab
- FR-07.2: Buy tokens: calls SmartLab `/v1/marketplace/secondary/trade` (1.4% commission via NEUROPAY)
- FR-07.3: List tokens for sale: calls SmartLab `/v1/marketplace/listings`
- FR-07.4: KYC level 1 minimum enforced by SmartLab

---

## 4. API Reference

Base URL: `http://neuro-id-service:6000`

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/register` | Create identity + DID + wallet |
| POST | `/v1/auth/login` | Email/password → JWT |
| POST | `/v1/auth/biometric/challenge` | Get nonce for biometric auth |
| POST | `/v1/auth/biometric/verify` | Verify nonce → JWT |

### Identity
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/identity/:did` | Get identity profile |
| PUT | `/v1/identity/:did/kyc` | Submit KYC documents |
| GET | `/v1/identity/:did/qr` | Get QR data URL |
| GET | `/v1/identity/:did/qr/png` | Get QR as PNG |

### Wallet
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/wallet/:did` | Balance + USD rate |
| GET | `/v1/wallet/:did/rate` | Current USD/CLP rate |
| GET | `/v1/wallet/:did/tokens` | NEUROTOKEN holdings |

### Transactions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/transactions/:did` | Payment history |

### NeuroPocket
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/pocket/:did/documents` | List documents |
| POST | `/v1/pocket/:did/documents` | Upload (multipart) |
| GET | `/v1/pocket/:did/documents/:id` | Get doc + presigned URL |
| GET | `/v1/pocket/:did/documents/:id/download` | Redirect to presigned URL |
| DELETE | `/v1/pocket/:did/documents/:id` | Delete |

### Market
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/market/listings` | Active listings |
| POST | `/v1/market/buy` | Buy token |
| POST | `/v1/market/sell` | List token for sale |

### IIoT
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/iiot/:did/connections` | Asset connections |
| GET | `/v1/iiot/:did/asset/:assetDid` | Single asset live status |
| POST | `/v1/iiot/:did/connections` | Register new connection |

---

## 5. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 6000 | Service port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `SMARTLAB_SERVICE_URL` | http://smartlab-service:5000 | SmartLab endpoint |
| `NEUROPAY_SERVICE_URL` | http://neuropay-service:4000 | NEUROPAY endpoint |
| `NEUROCOIN_SERVICE_URL` | http://neurocoin-service:3001 | NEUROCOIN balance endpoint |
| `MINIO_ENDPOINT` | minio | MinIO host |
| `MINIO_PORT` | 9000 | MinIO port |
| `MINIO_ACCESS_KEY` | neuron_minio | MinIO access key |
| `MINIO_SECRET_KEY` | neuron_minio_secret | MinIO secret key |
| `MINIO_BUCKET` | neuro-id | MinIO bucket name |
| `XMPP_HOST` | xmpp | ejabberd host |
| `XMPP_PORT` | 5280 | ejabberd HTTP API port |
| `JWT_SECRET` | — | JWT signing secret (min 32 chars) |

---

## 6. Running Locally

```bash
# Start the full NEUROTOKEN ecosystem first
cd E:\LynxNode\neurotoken-platform
docker compose up -d

# Then start NEURO-ID
cd E:\LynxNode\NEURO-ID
docker compose up -d --build

# Health check
curl http://localhost:6000/health

# Mobile app (Expo)
cd apps/neuro-id-app
npx expo start
```

---

## 7. License
MIT © LynxNode Trust
