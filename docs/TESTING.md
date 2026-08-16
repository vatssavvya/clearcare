# Verification and test matrix

## Commands

| Command | Purpose | Network/API spend |
| --- | --- | --- |
| `npm run lint` | ESLint with zero warnings | None |
| `npm run typecheck` | Strict TypeScript check | None |
| `npm test` | Unit, schema, safety, component, and policy tests | None; live flags forced off |
| `npm run build` | Optimized Next.js production build | None |
| `npm run test:e2e` | Chromium journey and responsive screenshots | None; deterministic sample |
| `npm run secrets:check` | Text secret-pattern scan excluding local secret files from output | None |
| `npm run test:live-api` | Explicit synthetic live pipeline proof | Yes; opt-in only |
| `npm run package` | Secret-scan staging and create submission ZIP | None |

## Automated coverage

The 56 Vitest cases cover:

- canonical fixture validity, unique IDs, complete page coverage, and broken-reference rejection;
- exact medication and threshold fidelity;
- cross-page source order and normalized matching;
- semicolon splitting, duplicate normalization, contradiction handling, and uncertainty preservation;
- deterministic teach-back construction and scoring behavior;
- file extension, MIME, signature, size, PDF page-count, and unreadable-file validation;
- rate/cost budget boundaries, model-specific caps, and completion of pass two for an already-approved final-cap pipeline;
- nested Responses API refusal detection and source-controlled synthetic-cache key restrictions;
- live-disabled error behavior without any provider call;
- key interface states and a strict release allowlist that rejects secrets, build output, caches, internal workflow files, and unrecognized top-level metadata.

The three Playwright tests cover:

- complete judging journey, visible diagnoses, real page-image navigation, Escape close/focus restoration, wrong-answer correction, completion, evidence-rich print output, reset, console errors, and request failures;
- 390 px mobile and 768 px tablet usability with no horizontal overflow;
- unsupported-file rejection, same-file reselection, safe mocked authentication failure, uploaded-image source preview, and object-URL cleanup without a provider call.

## Manual visual QA

Desktop, mobile, source, teach-back, and print screenshots were inspected at original resolution. The in-app browser was also used to verify the visible dashboard sections, diagnoses, medication groups, actual page preview, drawer focus behavior, page 2 to page 3 evidence navigation, quiz recovery and completion, and reset with no console warnings or errors. The four generated PDF pages were rendered with Poppler and checked for clipping, overlap, blank pages, legibility, and synthetic labeling.

## Current release results

- ESLint: pass, zero warnings
- TypeScript: pass
- Vitest: 8 files, 56 tests passed
- Playwright: 3 tests passed
- Next.js production build: pass
- npm audit after PDF.js update: zero known vulnerabilities
- Live API: authentication rejected before token count or generation; zero paid ledger entries

The final extracted-ZIP rebuild result is recorded in `FINAL_HANDOFF.md` after packaging.
