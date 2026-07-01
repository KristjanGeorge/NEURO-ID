import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(6000),
  databaseUrl: z.string().url(),
  smartlabServiceUrl: z.string().url().default('http://smartlab-service:5000'),
  neuropayServiceUrl: z.string().url().default('http://neuropay-service:4000'),
  neurocoinServiceUrl: z.string().url().default('http://neurocoin-service:3001'),
  minioEndpoint: z.string().default('minio'),
  minioPort: z.coerce.number().default(9000),
  minioAccessKey: z.string().default('neuron_minio'),
  minioSecretKey: z.string().default('neuron_minio_secret'),
  minioBucket: z.string().default('neuro-id'),
  xmppHost: z.string().default('xmpp'),
  xmppPort: z.coerce.number().default(5280),
  jwtSecret: z.string().min(32),
  usdRateApiUrl: z.string().url().default('https://api.exchangerate-api.com/v4/latest/USD'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    smartlabServiceUrl: process.env.SMARTLAB_SERVICE_URL,
    neuropayServiceUrl: process.env.NEUROPAY_SERVICE_URL,
    neurocoinServiceUrl: process.env.NEUROCOIN_SERVICE_URL,
    minioEndpoint: process.env.MINIO_ENDPOINT,
    minioPort: process.env.MINIO_PORT,
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    minioBucket: process.env.MINIO_BUCKET,
    xmppHost: process.env.XMPP_HOST,
    xmppPort: process.env.XMPP_PORT,
    jwtSecret: process.env.JWT_SECRET,
    usdRateApiUrl: process.env.USD_RATE_API_URL,
    nodeEnv: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.flatten());
    process.exit(1);
  }
  return result.data;
}

export const config = loadConfig();
