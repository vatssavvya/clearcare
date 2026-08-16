# AI pipeline

## Purpose

The optional live pipeline converts only facts supported by a user-provided discharge document. It is an organizing and explanation layer, not a clinical reasoning engine.

## Pass 1: evidence extraction

The original PDF is sent as an `input_file` with high detail; PNG/JPEG inputs use `input_image`. The extraction instructions require page-by-page review, exact preservation of medication fields, numbers, units, timing, conditional language, contradictions, missing items, and source excerpts. The response is parsed through a Zod-backed Structured Outputs format.

The schema includes document metadata, encounter context, explicit actions, medication reconciliation, monitoring, follow-up, restrictions, services, equipment, pending tests, warning signs, patient education, glossary terms, uncertainties, conflicts, sources, and one coverage record per input page.

## Deterministic validation boundary

Before pass two, Zod and local code check structure and cross-references. Page coverage must match the validated input page count. The model cannot skip empty or background pages without recording them. Sources are separate objects so a single item may point across pages.

## Pass 2: transformation

Only the validated JSON from pass one is sent to pass two—never the original PDF again. Instructions permit organization and plain-language explanation but prohibit new facts, treatment advice, inferred medication details, urgency rankings, or resolution of conflicts. Pass two returns the same clinical structure without quiz or analysis metadata.

Protected medication fields are compared byte-for-byte between passes. A change fails the pipeline.

## Local verification and teach-back

PDF.js extracts page text locally on a best-effort basis. Normalized excerpts are marked matched, partially matched, or unverified. A low-quality or image-only page can remain unverified; ClearCare never upgrades confidence without evidence. Match counts are computed after this local check.

Teach-back questions are generated deterministically from validated high-value fields such as an exact monitoring threshold, explicit follow-up timing, restrictions, and unresolved conflicts. Scoring and retry state remain in the browser.

## API controls

- OpenAI Responses API with `responses.parse`
- Zod helper for Structured Outputs
- Low reasoning effort for both passes
- `store: false`
- Default service tier and no automatic SDK retries
- Input token count before each pass
- Maximum 12,000 output tokens per pass
- Default run caps: 15 total pipelines, three higher-cost model pipelines
- Default estimated-cost soft stop: $8
- Run caps are charged at pass-one preflight; pass two of an already-approved final-cap pipeline still enforces the dollar guard without being miscounted as a new pipeline
- Token-count, budget, refusal, and generation failures are categorized in the sanitized ledger without storing raw provider errors

## Synthetic development cache

Before extraction, the server checks a narrow development cache keyed by content hash and a hashed model identifier. It is eligible only when the uploaded bytes exactly match the committed fictional sample PDF. Successful cached values must pass the canonical Zod schema and remain marked synthetic and live-API-derived. No arbitrary user document or derived care plan can enter this cache, and `.clearcare/` is excluded from Git and the release ZIP.

The dated pricing snapshot was checked against [official API pricing](https://developers.openai.com/api/docs/pricing) on 2026-08-15. It must be reviewed before production use.

## Test policy and current live result

The normal test suite sets `CLEARCARE_ENABLE_LIVE_API=false` and `RUN_LIVE_API_TESTS=false`; it cannot spend API credits. The separate `test:live-api` script requires an explicit opt-in and accepts only the synthetic sample.

On 2026-08-15, the network-enabled integration reached OpenAI but returned an authentication error before token counting or generation. The configured value was present, key-shaped, non-placeholder, and free of whitespace. At that time the ledger remained empty, so the recorded cost was $0. The pipeline now records token-count failures as sanitized zero-token failure categories. The retry policy correctly stopped further calls pending a credential change. This is an external credential limitation, not a simulated pass.
