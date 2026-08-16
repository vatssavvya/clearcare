# ClearCare design system

## Design intent

ClearCare should feel calm, evidence-first, and editorial rather than clinical-software generic. The central visual metaphor is **document → verified path → care plan**. It appears in the logo, landing illustration, analysis checkpoints, source links, and pitch deck.

The interface is designed for a cognitively demanding moment. Hierarchy must stay obvious, important actions must remain close to their evidence, and uncertainty must never be visually softened into certainty.

## Core principles

1. **Lead with the next useful action.** Explicit source-written timing appears before background context.
2. **Keep evidence one interaction away.** Important plan items use a consistent source-link control with page references.
3. **Make uncertainty visible.** Conflicts use coral; missing or unverified details use amber; neither is presented as a resolved answer.
4. **Prefer one strong composition.** Large editorial headings and a single dominant visual replace dense grids of interchangeable cards.
5. **Use calm motion only.** Motion communicates progress or state change and respects `prefers-reduced-motion`.

## Visual tokens

| Role | Token | Value |
| --- | --- | --- |
| Primary ink | Navy | `#0E2338` |
| Verified action | Teal | `#16746F` |
| Soft verified field | Mint | `#DFF0EB` |
| Page background | Paper | `#F7F5EF` |
| Supporting text | Slate | `#5A6976` |
| Attention / locator | Amber | `#EAB64B` |
| Conflict / hard boundary | Coral | `#9B2F2F` |

Display type uses the system’s variable display face with tight tracking; body copy uses the corresponding UI face. Clinical numbers use tabular numerals so thresholds, doses, and timing align consistently.

## Product surfaces

- **Landing:** editorial split hero, document-to-plan illustration, direct sample and upload actions, and a connected three-step journey.
- **Analysis:** four honest checkpoints rather than a fabricated completion percentage.
- **Care plan:** sticky source-linked navigation, a high-contrast at-a-glance summary, distinct medication and uncertainty treatments, and print-safe source references.
- **Source verification:** a dark evidence-desk header, original excerpt, page preview, match state, and keyboard-contained modal behavior.
- **Teach-back:** a numbered progress rail, locally scored choices, correction with source recovery, and a clear completion state.

## Accessibility and responsive behavior

- Visible focus uses a three-pixel amber ring with sufficient offset.
- Primary controls maintain a minimum 44-pixel touch target.
- Color is never the only indicator of state; icons and text labels accompany success, warning, conflict, and match status.
- Mobile navigation remains horizontally scrollable without forcing page overflow.
- Source verification traps focus, closes with Escape, restores focus, and locks background scroll.
- Print removes interactive chrome and preserves evidence page references.

## Pitch deck standard

The seven-slide deck uses the same navy, teal, paper, and amber system with one audience-facing claim per slide. Each project visual is used once, screenshots are evidence rather than decoration, visible metrics are current, and limitations remain explicit. Every slide includes a `[Sources]` block in speaker notes.
