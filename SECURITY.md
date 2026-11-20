# Security

MedCipher is a synthetic clinical-workflow prototype, not approved for real patient information or clinical operation. Do not put patient details or credentials in public issues.

Report security findings privately to the repository maintainer once the private repository is configured. Until then, use the project owner directly. Include reproducible synthetic steps and the affected commit, excluding secrets and raw encounter tokens.

Authorization comes from protected database memberships. Exposed tables use RLS; writes go through narrowly scoped database commands. Review SECURITY_AUDIT.md before any deployment. The public demo signs into shared synthetic accounts and must never be connected to real clinical data.
