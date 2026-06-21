/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Wrap with Sentry only when a DSN is configured, so local dev works without Sentry.
let configToExport = nextConfig;
try {
  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const { withSentryConfig } = require("@sentry/nextjs");
    configToExport = withSentryConfig(nextConfig, { silent: true });
  }
} catch (e) {
  // @sentry/nextjs not installed yet — fine for early scaffolding.
}

module.exports = configToExport;
