# Privacy and data handling

## Prototype posture

All committed data are fictional. ClearCare is not represented as HIPAA compliant, and real protected health information should not be used in the hackathon prototype.

## What the application stores

The application has no database, analytics SDK, account system, or upload archive. Selected live files, their blob preview URLs, returned live care plans, sample state, and teach-back progress remain in browser memory; Reset revokes the preview URL and clears that state. The API route sends `Cache-Control: no-store` and `Pragma: no-cache`.

The optional local live-call ledger stores only timestamp, SHA-256 fixture hash, model, pass number, token counts, estimated cost, and a result category. It does not contain filenames, document text, source excerpts, patient fields, API keys, provider response bodies, or raw errors. `.clearcare/` is excluded from source control and release packages.

During development, a successful provider result can be cached only when the submitted bytes exactly match the committed fictional sample PDF and the result is still marked synthetic. The cache key is the content hash plus a hashed model identifier. Arbitrary user uploads and their derived care plans are never eligible for disk caching. The synthetic cache is stored under ignored, package-excluded `.clearcare/synthetic-cache/`.

## Provider processing

Live document bytes are sent from the Next.js server to the OpenAI Responses API for the current request. Requests set `store: false`. This is an application-level choice, not a substitute for reviewing provider terms, organization settings, regional processing, or a data-processing agreement.

## Secret handling

`OPENAI_API_KEY` is read only in server code and ignored `.env.local`. The repository contains an empty `.env.example`. Release staging rejects environment files and scans text for common secret formats before creating the ZIP. Browser bundles never receive the key.

## Production requirements

Before processing real patient data, define data ownership, legal basis and consent, a minimum necessary dataset, retention and deletion, encryption in transit and at rest, key rotation, least-privilege access, tenant isolation, audit trails, logging redaction, incident response, backups, vendor agreements, data residency, subject requests, and breach notification. Commission privacy, security, clinical, accessibility, and regulatory reviews. Do not imply compliance merely because one vendor supports a regulated workload.
