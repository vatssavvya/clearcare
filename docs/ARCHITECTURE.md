# ClearCare architecture

## Design goals

ClearCare is shaped around three constraints: source fidelity, explicit uncertainty, and a dependable demo. The UI must be useful without a network call; the live path must be real and guarded; neither path may create medical instructions that are absent from the document.

## Runtime boundaries

The browser owns file selection, navigation, source review, teach-back scoring, print, and reset. Uploaded bytes cross the browser/server boundary only when the user explicitly submits a live document. The Next.js route validates the request and calls the OpenAI API using a server-only key. There is no client SDK initialization and no database.

The deterministic sample is a committed Zod-validated fixture tied to a generated fictional PDF. Its progress message and dashboard banner identify it as a no-API demo.

## Modules

| Area | Responsibility |
| --- | --- |
| `app/api/analyze` | Request parsing, rate limiting, safe response codes, no-store headers |
| `lib/documents` | File signature/MIME/size/page validation and local PDF text extraction |
| `lib/schema` | One canonical application contract and cross-reference invariants |
| `lib/ai/prompts` | Narrow evidence extraction and transformation instructions |
| `lib/ai/pipeline` | Two Structured Outputs passes, token preflight, refusal classification, fidelity checks |
| `lib/ai/synthetic-cache` | Hash-gated cache restricted to the committed fictional sample |
| `lib/ai/token-budget` | Dated price snapshot, hard run caps, append-only sanitized ledger |
| `lib/validation` | Exact/partial source matching and protected medication fields |
| `components` | Responsive, accessible care plan and evidence review |
| `lib/care-plan/teach-back` | Deterministic questions derived from validated fields |

## Data flow

1. Validate extension, MIME declaration, magic bytes, byte size, and PDF page count.
2. Reuse a validated cached result only if the bytes exactly match the committed fictional sample and model key; user documents are never eligible.
3. Extract local page text when possible; an extraction failure degrades matching confidence but does not invent evidence.
4. Count input tokens and enforce the configured run, model, and dollar guard.
5. Extract a complete evidence-grounded `CarePlanWithoutQuiz` value with Structured Outputs.
6. Require page coverage for every input page and valid source references for every linked item.
7. Transform only that validated structure into patient-friendly language with the same protected clinical fields.
8. Verify medication fidelity and match source excerpts against local page text.
9. Generate three or more deterministic teach-back questions and return the canonical `CarePlan`.

## Schema invariants

IDs are unique within their collections. All `sourceIds` and `conflictIds` must resolve. Source page numbers cannot exceed the document page count. Page coverage must contain exactly one record per input page. Cross-page evidence remains an ordered list of independent source objects. Medication action, name, dose, unit, route, frequency, duration, conditional text, and monitoring text cannot change during pass two.

## Failure behavior

The live endpoint never substitutes the deterministic sample. It maps validation, disabled-mode, authentication, permission, rate-limit, timeout, refusal, schema, and budget failures to safe codes plus a request ID. Document text and provider response bodies are not logged.

## Deployment shape

The build is a standard Next.js Node application. The API route declares Node runtime and a 180-second maximum duration. A deployment must provide sufficient request-body size for 10 MiB uploads and function time for multimodal extraction. See `docs/DEPLOYMENT.md`.
