# Security Policy

Security matters in DevHub because the application integrates GitHub credentials, Supabase authentication, PostgreSQL data, and user-controlled input.

## Supported version

Security fixes are applied to the latest version on the `main` branch.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for a suspected vulnerability.

Instead, contact the maintainer privately through the contact information available on the maintainer's GitHub profile. Include:

- a concise description of the issue
- affected route, component, or workflow
- reproduction steps
- expected and actual behavior
- potential impact
- any suggested mitigation, if known

Please avoid accessing data that does not belong to you, degrading the service, or publishing sensitive details before a fix is available.

## Sensitive information

Never include real secrets in issues, pull requests, screenshots, logs, or example configuration.

Examples include:

- GitHub tokens
- Supabase service-role keys
- passwords
- session tokens
- private API keys
- production database credentials

DevHub keeps privileged credentials server-side and uses environment variables for secrets.
