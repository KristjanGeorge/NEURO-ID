import { Pool } from 'pg';
import axios from 'axios';
import { config } from '../config.js';

export interface IIoTConnection {
  id: string;
  identityId: string;
  tokenId: string;
  assetDid: string;
  assetName: string;
  assetType: string;
  protocol: string;
  endpointUrl: string;
  status: string;
  lastSeenAt: string | null;
  telemetry: Record<string, unknown> | null;
  createdAt: string;
}

export async function getConnections(pool: Pool, identityId: string): Promise<IIoTConnection[]> {
  const rows = await pool.query(
    'SELECT * FROM neuro_id.iiot_connections WHERE identity_id = $1 ORDER BY created_at DESC',
    [identityId]
  );
  return rows.rows.map(mapRow);
}

export async function getAssetStatus(pool: Pool, identityId: string, assetDid: string): Promise<IIoTConnection | null> {
  const row = await pool.query(
    'SELECT * FROM neuro_id.iiot_connections WHERE identity_id = $1 AND asset_did = $2',
    [identityId, assetDid]
  );
  if (!row.rows[0]) return null;

  const conn = mapRow(row.rows[0]);

  // Probe XMPP HTTP API for live status
  if (conn.protocol === 'XMPP') {
    try {
      const xmppApiBase = `http://${config.xmppHost}:${config.xmppPort}`;
      const res = await axios.get(`${xmppApiBase}/api/get_presence`, {
        params: { user: assetDid, host: 'neuron.local' },
        timeout: 3000,
      });
      const online = res.data?.online === true;
      conn.status = online ? 'CONNECTED' : 'DISCONNECTED';

      await pool.query(
        'UPDATE neuro_id.iiot_connections SET status = $1, last_seen_at = NOW() WHERE id = $2',
        [conn.status, conn.id]
      );
    } catch {
      conn.status = 'DISCONNECTED';
    }
  }

  return conn;
}

export async function registerConnection(
  pool: Pool,
  identityId: string,
  input: {
    tokenId: string;
    assetDid: string;
    assetName: string;
    assetType: string;
    protocol?: string;
    endpointUrl: string;
  }
): Promise<IIoTConnection> {
  const row = await pool.query(
    `INSERT INTO neuro_id.iiot_connections
       (identity_id, token_id, asset_did, asset_name, asset_type, protocol, endpoint_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (asset_did) DO UPDATE SET
       asset_name = EXCLUDED.asset_name,
       endpoint_url = EXCLUDED.endpoint_url,
       updated_at = NOW()
     RETURNING *`,
    [identityId, input.tokenId, input.assetDid, input.assetName,
     input.assetType, input.protocol ?? 'XMPP', input.endpointUrl]
  );
  return mapRow(row.rows[0]);
}

function mapRow(r: Record<string, unknown>): IIoTConnection {
  return {
    id: r.id as string,
    identityId: r.identity_id as string,
    tokenId: r.token_id as string,
    assetDid: r.asset_did as string,
    assetName: r.asset_name as string,
    assetType: r.asset_type as string,
    protocol: r.protocol as string,
    endpointUrl: r.endpoint_url as string,
    status: r.status as string,
    lastSeenAt: r.last_seen_at ? (r.last_seen_at as Date).toISOString() : null,
    telemetry: r.telemetry as Record<string, unknown> | null,
    createdAt: (r.created_at as Date).toISOString(),
  };
}
