# Deployment guide

## Recommended shape

Deploy as a Node.js Next.js application on a host that supports App Router route handlers, multipart uploads of at least 10 MiB, and request durations of at least 180 seconds. Vercel is a natural fit, but the project is not coupled to it.

## Environment

Set secrets in the hosting provider, never in the repository:

```dotenv
OPENAI_API_KEY=<secret>
OPENAI_MODEL=gpt-5.6-terra
OPENAI_FINAL_MODEL=gpt-5.6
CLEARCARE_ENABLE_LIVE_API=false
CLEARCARE_MAX_LIVE_PIPELINE_RUNS=15
CLEARCARE_MAX_SOL_PIPELINE_RUNS=3
CLEARCARE_BUDGET_SOFT_STOP_USD=8
RUN_LIVE_API_TESTS=false
```

Start with live mode off. Enable it only after a synthetic staging test, cost review, provider/account review, privacy assessment, and explicit operational approval. `RUN_LIVE_API_TESTS` should remain false in deployed environments.

## Build and start

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

The health endpoint is `GET /api/health`. It returns readiness, deterministic-demo availability, and a boolean live-configuration status; it never returns secret values.

## Production hardening

Replace the in-memory rate limiter with a shared, privacy-reviewed store. Add authenticated access if live uploads are permitted. Define maximum concurrency, timeouts, abuse controls, observability with field-level redaction, alerting on error categories and spend, and a tested kill switch. Confirm content security policy, response headers, malware scanning, regional processing, deletion, and provider contract requirements.

Do not use this prototype with real medical records until security, privacy, clinical, accessibility, legal, and regulatory reviews are complete.

## Rollback

The safest operational rollback is to set `CLEARCARE_ENABLE_LIVE_API=false`, leaving the deterministic fictional sample available. Keep the previous deployment artifact and lockfile. Never silently replace a failed live analysis with the sample for an uploaded document.

No deployment, domain, cloud resource, or public endpoint was created during the hackathon build.
