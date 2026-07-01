# NEURO-ID Architecture

> SWEBOK v4 · C4 Model · LynxNode Trust

---

## C4 Level 1 — System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEUROTOKEN Ecosystem                          │
│                                                                  │
│  ┌──────────────┐   REST   ┌──────────────────────────────────┐ │
│  │ NEURO-ID App │ ──────► │ neuro-id-service:6000            │ │
│  │ (React Native│          │ (Fastify 4, TypeScript)           │ │
│  │  iOS/Android)│          └──────────────┬───────────────────┘ │
│  └──────────────┘                         │                      │
│         │ QR scan                  ┌──────┼──────────────┐       │
│         ▼                          ▼      ▼              ▼       │
│  neurotoken.cl              SmartLab    NEUROPAY    neurocoin     │
│  (web portal)                 :5000      :4000        :3001       │
│                                                                   │
│  Infrastructure: PostgreSQL:5432  MinIO:9000  ejabberd:5222       │
└─────────────────────────────────────────────────────────────────┘
```

---

## C4 Level 2 — Container Diagram

```
┌───────────────── NEURO-ID ──────────────────────────┐
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │         React Native App (Expo 51)              │ │
│  │                                                 │ │
│  │  AuthScreen ── IdentityScreen ── WalletScreen   │ │
│  │  TokensScreen ── NeuroPocketScreen ── QRScreen  │ │
│  │  SecondaryMarketScreen ── IIoTScreen             │ │
│  │                                                 │ │
│  │  Stores: auth.store (Zustand) · wallet.store    │ │
│  │  Services: identity · wallet · tokens · pocket  │ │
│  └───────────────────┬─────────────────────────────┘ │
│                      │ REST/HTTPS (JWT Bearer)        │
│  ┌───────────────────▼─────────────────────────────┐ │
│  │         neuro-id-service:6000                   │ │
│  │                                                 │ │
│  │  /v1/auth      /v1/identity  /v1/wallet         │ │
│  │  /v1/pocket    /v1/market    /v1/iiot            │ │
│  │  /v1/transactions            /health             │ │
│  │                                                 │ │
│  │  Services: identity · kyc · wallet · qr         │ │
│  │            pocket (MinIO) · market · iiot        │ │
│  └─────┬──────┬─────┬──────┬─────────────────────┘ │
│        │      │     │      │                         │
└────────┼──────┼─────┼──────┼─────────────────────────┘
         │      │     │      │
         ▼      ▼     ▼      ▼
      Smart   NEURO  NCN   ejabberd
       Lab     PAY  :3001   :5222
      :5000   :4000
         │
    PostgreSQL  MinIO
      :5432     :9000
```

---

## Sequence Diagrams

### SD-01: Register + First Login

```
App         neuro-id-svc     PostgreSQL     SmartLab
 │                │               │              │
 │ POST /register │               │              │
 │──────────────► │               │              │
 │                │ INSERT identity│              │
 │                │───────────────►              │
 │                │ ◄─────────────               │
 │                │ sign JWT(did)  │              │
 │◄───────────────│ {token,identity}              │
 │ store SecureStore               │              │
```

### SD-02: KYC Level 1 Submission

```
App         neuro-id-svc     SmartLab        PostgreSQL
 │                │               │               │
 │ PUT /identity/:did/kyc          │               │
 │──────────────► │               │               │
 │                │ POST /v1/compliance/kyc        │
 │                │──────────────► │               │
 │                │ {contractId}  │               │
 │                │◄──────────────│               │
 │                │ UPDATE kyc_level=1            │
 │                │───────────────────────────────►
 │◄───────────────│ {contractId, kycLevel:1}       │
```

### SD-03: Secondary Market Purchase

```
App          neuro-id-svc   SmartLab     NEUROPAY
 │                │              │           │
 │ POST /market/buy│              │           │
 │───────────────► │              │           │
 │                 │ POST /v1/marketplace/secondary/trade
 │                 │─────────────►│           │
 │                 │             │ POST /v1/payment
 │                 │             │──────────►│
 │                 │             │  {commission split}
 │                 │             │◄──────────│
 │                 │ {contractId, paymentId}  │
 │                 │◄─────────────│           │
 │◄────────────────│              │           │
```

### SD-04: NeuroPocket Document Upload + QR

```
App          neuro-id-svc   MinIO        PostgreSQL
 │                │              │           │
 │ POST /pocket/:did/documents (multipart)   │
 │───────────────►│              │           │
 │                │ putObject(key, buffer)   │
 │                │─────────────►│           │
 │                │ INSERT pocket_documents  │
 │                │──────────────────────────►
 │                │ generate QR payload      │
 │◄───────────────│ {document, qrPayload}    │
```

---

## Data Model

### neuro_id.identities
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| did | TEXT | W3C DID: `did:neuron:cl:<uuid>` |
| full_name | TEXT | Legal full name |
| email | TEXT | Login email |
| password_hash | TEXT | bcrypt 12 rounds |
| selfie_url | TEXT | MinIO path |
| selfie_hash | CHAR(64) | SHA-256 |
| document_type | TEXT | RUT/PASSPORT/NATIONAL_ID/COMPANY_RUT/TAX_ID |
| document_number | TEXT | Government ID number |
| document_hash | CHAR(64) | SHA-256 of KYC scan |
| country_code | CHAR(2) | ISO 3166-1 |
| kyc_level | SMALLINT | 0-3 |
| kyc_contract_id | UUID | FK → smartlab.kyc_records |
| wallet_address | TEXT | `ncn:<uuid-stripped>` |
| status | TEXT | PENDING/ACTIVE/SUSPENDED/REVOKED |
| biometric_challenge_hash | TEXT | Nonce for biometric auth |

### neuro_id.pocket_documents
| Column | Type | Description |
|--------|------|-------------|
| type | TEXT | DRIVER_LICENSE/PASSPORT/MEDICAL/INSURANCE/PROPERTY/CUSTOM |
| storage_key | TEXT | MinIO object key |
| content_hash | CHAR(64) | SHA-256 |
| qr_payload | TEXT | JSON for federated interop |
| expires_at | TIMESTAMPTZ | Optional expiry |

### neuro_id.iiot_connections
| Column | Type | Description |
|--------|------|-------------|
| asset_did | TEXT | DID of physical asset (unique) |
| asset_type | TEXT | REAL_ESTATE/INFRASTRUCTURE/etc |
| protocol | TEXT | XMPP/MQTT/HTTP |
| status | TEXT | CONNECTED/DISCONNECTED/ERROR |
| telemetry | JSONB | Latest sensor data |

---

## Security Design

| Layer | Mechanism |
|-------|-----------|
| Auth | JWT RS256, 24h expiry, jti stored in DB for revocation |
| Biometric | Challenge-response nonce (UUID), SHA-256 verified server-side |
| Passwords | bcrypt cost factor 12 |
| Documents | MinIO presigned URLs (1h TTL), content hash verified |
| Transport | TLS in production; helmet CSP headers |
| DID | W3C decentralized identifiers, no central authority |
| KYC docs | SHA-256 hash in SmartLab XML contract (non-repudiable) |

---

## Port Map

| Service | Port | Protocol |
|---------|------|----------|
| neuro-id-service | 6000 | HTTP/REST |
| smartlab-service | 5000 | HTTP/REST |
| neuropay-service | 4000 | HTTP/REST |
| neurocoin-service | 3001 | HTTP/REST |
| neuron-node (FBA ledger) | 3000 | HTTP/WS |
| PostgreSQL | 5432 | TCP |
| MinIO | 9000 | S3/HTTP |
| ejabberd XMPP | 5222 | XMPP |
| ejabberd HTTP API | 5280 | HTTP |
