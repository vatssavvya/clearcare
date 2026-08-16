# Safety boundaries

## Intended use

ClearCare helps a person review written discharge instructions and locate the source behind each organized item. It is not a clinician, diagnostic system, treatment recommender, interaction checker, dose calculator, or emergency triage service.

## Hard prohibitions

The prompts, schema, validation, UI copy, and tests prohibit ClearCare from:

- adding, removing, or changing treatment;
- inferring a missing medication dose, route, frequency, duration, or restart time;
- resolving contradictory medication instructions;
- ranking urgency beyond the wording of the source;
- interpreting symptoms as an emergency or a non-emergency;
- claiming that all important information was found when a page is unreadable;
- hiding uncertainty, a missing attachment, or an unsupported excerpt.

## Source-first presentation

Every important field has one or more source IDs. The UI exposes the page, document section, exact excerpt, extraction method, and match status. Cross-page medication content remains navigable as separate pieces of evidence. Plain-language explanations are visibly distinct from the excerpt.

## Uncertainty and conflict handling

Missing or ambiguous details become explicit confirmation cards. Contradictory values are shown together with the statement that ClearCare does not choose one. Users are prompted to check with a qualified healthcare professional. A medication with an unresolved action remains in the `unclear` group.

## Warning-sign language

ClearCare repeats only the action and sign written in the source. It does not add generic emergency advice to each item. The global disclaimer says that a person who believes they are experiencing an emergency should contact local emergency services; this is not presented as an interpretation of the uploaded document.

## Validation before clinical use

The prototype uses synthetic documents only. Any clinical deployment would require clinician-led evaluation of extraction fidelity, usability and accessibility research with patients and caregivers, representative scan-quality testing, bias and language testing, failure-mode review, regulatory analysis, operational monitoring, and a defined escalation path. The current project makes no claim of clinical validation or regulatory clearance.
