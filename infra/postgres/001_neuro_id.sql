-- NEURO-ID schema
-- Ejecutar automáticamente al iniciar el contenedor postgres

CREATE SCHEMA IF NOT EXISTS neuro_id;

CREATE TABLE IF NOT EXISTS neuro_id.identities (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  did                      TEXT        NOT NULL UNIQUE,
  full_name                TEXT        NOT NULL,
  email                    TEXT        NOT NULL UNIQUE,
  password_hash            TEXT        NOT NULL,
  selfie_url               TEXT,
  selfie_hash              CHAR(64),
  document_type            TEXT        NOT NULL DEFAULT 'RUT'
                           CHECK (document_type IN ('RUT','PASSPORT','NATIONAL_ID','COMPANY_RUT','TAX_ID')),
  document_number          TEXT        NOT NULL,
  document_hash            CHAR(64),
  country_code             CHAR(2)     NOT NULL DEFAULT 'CL',
  kyc_level                SMALLINT    DEFAULT 0 CHECK (kyc_level BETWEEN 0 AND 3),
  kyc_contract_id          UUID,
  wallet_address           TEXT        UNIQUE,
  status                   TEXT        NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING','ACTIVE','SUSPENDED','REVOKED')),
  biometric_challenge_hash TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neuro_id.sessions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  identity_id  UUID        NOT NULL REFERENCES neuro_id.identities(id) ON DELETE CASCADE,
  jwt_jti      TEXT        NOT NULL UNIQUE,
  device_info  TEXT,
  ip_address   TEXT,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neuro_id.pocket_documents (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  identity_id  UUID        NOT NULL REFERENCES neuro_id.identities(id) ON DELETE CASCADE,
  type         TEXT        NOT NULL
               CHECK (type IN ('DRIVER_LICENSE','PASSPORT','MEDICAL','INSURANCE','PROPERTY','CUSTOM')),
  title        TEXT        NOT NULL,
  storage_key  TEXT        NOT NULL,
  content_hash CHAR(64)    NOT NULL,
  qr_payload   TEXT        NOT NULL,
  metadata     JSONB       NOT NULL DEFAULT '{}',
  issued_by    TEXT,
  valid_from   TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neuro_id.iiot_connections (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  identity_id   UUID        NOT NULL REFERENCES neuro_id.identities(id) ON DELETE CASCADE,
  token_id      TEXT        NOT NULL,
  asset_did     TEXT        NOT NULL UNIQUE,
  asset_name    TEXT        NOT NULL,
  asset_type    TEXT        NOT NULL
                CHECK (asset_type IN ('REAL_ESTATE','INFRASTRUCTURE','EMISSION_RIGHT','EQUIPMENT','FUND_UNIT','OTHER')),
  protocol      TEXT        NOT NULL DEFAULT 'XMPP'
                CHECK (protocol IN ('XMPP','MQTT','HTTP')),
  endpoint_url  TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'CONNECTED'
                CHECK (status IN ('CONNECTED','DISCONNECTED','ERROR')),
  last_seen_at  TIMESTAMPTZ,
  telemetry     JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS neuro_id_identities_email_idx    ON neuro_id.identities (email);
CREATE INDEX IF NOT EXISTS neuro_id_identities_status_idx   ON neuro_id.identities (status);
CREATE INDEX IF NOT EXISTS neuro_id_sessions_identity_idx   ON neuro_id.sessions (identity_id);
CREATE INDEX IF NOT EXISTS neuro_id_sessions_expires_idx    ON neuro_id.sessions (expires_at);
CREATE INDEX IF NOT EXISTS neuro_id_pocket_identity_idx     ON neuro_id.pocket_documents (identity_id);
CREATE INDEX IF NOT EXISTS neuro_id_pocket_type_idx         ON neuro_id.pocket_documents (type);
CREATE INDEX IF NOT EXISTS neuro_id_iiot_identity_idx       ON neuro_id.iiot_connections (identity_id);
CREATE INDEX IF NOT EXISTS neuro_id_iiot_status_idx         ON neuro_id.iiot_connections (status);
