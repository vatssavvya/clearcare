# ClearCare

**Turn complicated discharge instructions into a clear, source-linked care plan.**

ClearCare is a health-literacy platform designed to help patients better understand the instructions they receive after a medical visit. It transforms dense discharge documents into plain-language summaries, medication timelines, follow-up checklists, warning signs, and short teach-back quizzes—all while keeping each explanation connected to its original source.

> ClearCare organizes and explains uploaded instructions. It does not provide medical advice, diagnose conditions, recommend treatments, or replace a healthcare professional.

## The Problem

Discharge documents often combine clinical terminology, medication schedules, follow-up requirements, activity restrictions, and urgent warning signs in a format that can be difficult to process—especially when a patient is tired, stressed, or caring for someone else.

Misunderstanding even one instruction can result in missed medication, duplicated doses, delayed follow-up care, or uncertainty about when to seek help. ClearCare addresses that communication gap without creating new medical instructions.

## How ClearCare Helps

Users upload a discharge document or select a synthetic sample. ClearCare then presents the information as an accessible care-plan dashboard containing:

- A plain-language overview
- A chronological care timeline
- Source-linked medication cards
- A follow-up checklist
- Activity restrictions
- Important warning signs
- Explanations of difficult medical terms
- Confidence indicators and uncertainty flags
- A teach-back quiz that checks understanding

Every important item includes a page number and source excerpt so users can compare the simplified explanation with the original document.

## Core Workflow

1. **Upload** a PDF or image of discharge instructions.
2. **Extract** only information explicitly stated in the document.
3. **Validate** medication details, source references, and uncertain fields.
4. **Simplify** the validated information into a patient-friendly care plan.
5. **Review** each instruction alongside its original source.
6. **Confirm understanding** through a short teach-back quiz.

## Safety by Design

ClearCare is an informational and organizational tool. It must never:

- Diagnose a condition
- Recommend or change treatment
- Calculate or modify a medication dose
- Invent medication times or durations
- Check drug interactions
- Determine whether a user is experiencing an emergency
- Replace a doctor, pharmacist, or other healthcare professional

Missing, contradictory, or low-confidence information is visibly flagged for confirmation with a qualified professional. The application preserves the units and wording found in the source instead of filling in missing details.

## Technology

- **Framework:** Next.js with the App Router
- **Language:** TypeScript
- **Interface:** React, Tailwind CSS, and reusable UI components
- **Validation:** Zod schemas and deterministic safety checks
- **Document preview:** PDF.js
- **Testing:** Vitest
- **Planned document processing:** OpenAI Responses API with structured outputs
- **Deployment:** Vercel

## Project Status

ClearCare is currently a hackathon prototype.

### Phase 1: Interactive prototype

- Synthetic discharge document
- Mock analysis workflow
- Care-plan dashboard
- Source-verification drawer
- Teach-back quiz
- Responsive and accessible interface
- Structured care-plan schema
- Safety messaging and uncertainty states

### Phase 2: Document processing

- PDF and image uploads
- Two-pass document extraction and simplification
- Structured AI outputs
- Source-reference validation
- Low-confidence detection
- File-type and upload-size validation

### Future development

- Multilingual explanations
- Accessibility testing with users
- Stronger document-quality detection
- Clinician and patient feedback
- Encrypted, consent-based storage
- Formal privacy, security, and regulatory review

## Local Development

### Requirements

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/clearcare.git
cd clearcare
npm install
```

Create a local environment file if the current phase requires one:

```bash
cp .env.example .env.local
```

Never commit API keys, patient records, or other sensitive information.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification

Before submitting changes, run:

```bash
npm run lint
npm test
npm run build
```

Important test cases include:

- A document with no medications
- A medication with a missing dose or duration
- Contradictory instructions
- A low-quality scan
- Unsupported file types
- Missing source references
- An incorrect teach-back response

## Data and Privacy

The hackathon demonstration uses only fictional patients and synthetic medical documents. The prototype should not be presented as HIPAA-compliant or used for real clinical decisions.

Uploaded documents should not be permanently stored by the prototype. API keys must remain server-side, logs should not contain document contents, and real protected health information should not be used during development or demonstrations.

## Contributing

When contributing:

1. Preserve the medical-safety boundaries above.
2. Add or update tests for behavioral changes.
3. Keep generated instructions traceable to a source.
4. Run linting, tests, and the production build.
5. Document meaningful architectural changes.

## Disclaimer

ClearCare is an educational hackathon prototype. Its outputs may be incomplete or incorrect and must be checked against the original document and confirmed with a qualified healthcare professional. If you believe you are experiencing a medical emergency, contact local emergency services.

## License

Add the project license selected by the team before public distribution.
