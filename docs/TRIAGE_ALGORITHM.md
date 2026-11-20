# Demonstration triage algorithm

This is software workflow logic, not a diagnostic algorithm or validated triage protocol. No invented physiological thresholds are used.

1. Structured reported emergency signs (unresponsive, severe breathing difficulty, uncontrolled bleeding, suspected stroke, ongoing seizure, major trauma, suspected shock) produce RED and an immediate human-assessment pathway.
2. Without a reported emergency trigger, the automated recommendation remains ASSESSMENT_REQUIRED. Normal category is never inferred from a low pain value, missing vital signs or absent warnings.
3. Qualified staff explicitly confirm a category and document reasoning. Nurses cannot downgrade an active emergency; a doctor must record that decision.
4. Original recommendation, final category, observations, actor, protocol label and timestamp are retained.
5. Deterioration and configured time intervals produce review flags. Waiting never silently changes clinical category.

## Secondary score

`demo-1.0-unvalidated` requires recorded symptoms, human verification, pain, progression and all five recorded vital fields before producing a score. Missing data produces null, displayed as unavailable.

Demonstration points: structured warning = 40; reported pain × 1.5 (maximum 15); worsening = 10. The current configuration therefore spans 0–65 within the allowed 0–100 range. Decimals are preserved to two places. These weights are engineering examples, not clinically meaningful risk estimates. The database recalculates and stores the breakdown. Vital-sign abnormalities are deliberately not scored without an approved protocol. Configurable score administration is not implemented.

Queue ordering: category RED → YELLOW → GREEN; assessment-required records remain explicitly labelled and have their own filter. Within a category: emergency override, clinical subpriority, deterioration, overdue review, arrival, stable ID. The demonstration score is excluded from ranking.

Outstanding: clinically reviewed rules and sources, vital-sign threshold engine, risk-factor rules, rule editing/review/activation workflow, protocol-specific reassessment schedules and clinician-reviewed scenario expectations. Clinical operational use stays disabled.
