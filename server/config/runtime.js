function getRuntimeConfig() {
  const jwtSecret = process.env.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.trim().length < 32) {
    throw new Error(
      'JWT_SECRET must contain at least 32 characters. Set a random secret in server/.env.',
    );
  }

  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (
    !origins.length ||
    origins.some((origin) => {
      try {
        const parsed = new URL(origin);
        return !['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin;
      } catch {
        return true;
      }
    })
  ) {
    throw new Error('CLIENT_ORIGIN must contain valid HTTP(S) origins separated by commas.');
  }

  const trustProxy = process.env.TRUST_PROXY || '0';
  if (!['0', '1'].includes(trustProxy)) {
    throw new Error('TRUST_PROXY must be 0 (direct connection) or 1 (one trusted reverse proxy).');
  }
  return { jwtSecret, origins, trustProxy: Number(trustProxy) };
}

module.exports = getRuntimeConfig;
