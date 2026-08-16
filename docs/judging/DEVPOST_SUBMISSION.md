# ClearCare — Devpost submission draft

## Inspiration

The moment after discharge is cognitively expensive. A patient may be holding several pages that mix medication changes, appointments, activity restrictions, measurements, and warning signs—often while tired, uncomfortable, or supporting someone else. A generic summary is not enough: people also need to know where each simplified instruction came from and what the software could not confidently determine.

## What it does

ClearCare turns a discharge PDF or image into a prioritized care-plan dashboard. It groups exact medication actions, monitoring thresholds, time-sensitive tasks, follow-up, home services, restrictions, education, glossary terms, and warning signs. Every important card opens a source-verification drawer with the original page and excerpt. Cross-page instructions stay cross-page.

When the document is unclear, contradictory, or references a missing attachment, ClearCare does not guess. It creates a visible “needs confirmation” item. A short deterministic teach-back helps the user revisit key source-grounded instructions. ClearCare never diagnoses, recommends treatment, changes medication details, or decides whether an emergency is happening.

## How we built it

The application uses Next.js 16, React 19, strict TypeScript, Tailwind CSS, Zod, the OpenAI Responses API, PDF.js, pdf-lib, Vitest, and Playwright.

The optional live path uses two Structured Outputs passes. Pass one extracts evidence and complete page coverage from the original file. Deterministic checks validate the schema, IDs, sources, and page count. Pass two sees only that validated structure and creates plain-language explanations. Protected medication fields are compared exactly between passes. Local PDF text matching then labels each excerpt matched, partial, or unverified. Teach-back questions are generated deterministically from the final validated fields.

The included four-page fictional sample exercises a realistic range of states without a key or network call. It is generated reproducibly and tied to a committed schema-valid fixture.

## Challenges

The hardest problem was designing for evidence and uncertainty rather than merely fluent output. Discharge documents can split one medication instruction across pages, omit a route or duration, reference an attachment that is not present, and contradict themselves. The schema and UI needed to preserve those situations without turning them into false confidence.

The second challenge was making a demo that is both dependable and honest. The sample path is deterministic and visibly labeled; the upload path is real, server-only, guarded, and never silently replaced by sample output.

## Accomplishments

- Complete source-linked care plan with a polished responsive workflow
- Cross-page evidence navigation and accessible focus restoration
- Exact medication-field fidelity between AI passes
- Full page-coverage invariant and local source matching
- Explicit conflicts, uncertainties, and missing-attachment states
- Deterministic teach-back, print view, reset, and no retained sample state
- 56 unit/integration tests, three Playwright journeys, production build, secret scanning, cost caps, and release packaging
- Original four-page fictional PDF, judge screenshots, seven-slide editable deck, and submission documentation

## What we learned

Plain language is safest when it follows structured evidence, not when it replaces it. Confidence should be actionable and local: a user needs to know which fact needs confirmation, not receive an abstract score. We also learned that a good healthcare demo should be designed around failure states—missing facts, conflicting facts, unreadable pages—not just the ideal document.

## What’s next

Next steps would be clinician-led fidelity evaluation, patient and caregiver usability research, accessibility and multilingual testing, robust OCR quality detection, a privacy and security architecture for regulated data, shared rate limits and monitoring, and jurisdiction-specific regulatory review. ClearCare is a hackathon prototype, not a clinically validated product or medical device.

## Built with

Next.js, React, TypeScript, Tailwind CSS, Zod, OpenAI Responses API, Structured Outputs, PDF.js, pdf-lib, Vitest, Testing Library, Playwright, and Lucide.

## Links to add before publishing

- Demo URL: `[ADD PUBLIC URL]`
- Repository: `[ADD REPOSITORY URL]`
- Video: `[ADD VIDEO URL]`
- Team: `[ADD NAMES AND ROLES]`
