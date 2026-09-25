# Contributing to DevHub

Thanks for helping improve DevHub.

DevHub is an open-source developer intelligence platform for exploring developers, repositories, activity, contributors, releases, languages, and other public GitHub signals in one workspace.

## Ways to contribute

Useful contributions include:

- bug fixes
- accessibility improvements
- performance improvements
- tests
- GitHub API reliability improvements
- documentation
- developer and repository intelligence features
- search and comparison improvements
- UI/UX improvements
- security hardening

Please keep contributions focused and avoid introducing hidden scoring or ranking systems for developers.

## Local setup

1. Fork the repository.
2. Clone your fork.
3. Install dependencies:

```bash
npm install
```

4. Copy the environment template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

5. Add the required local environment variables described in the README.
6. Start the development server:

```bash
npm run dev
```

## Before opening a pull request

Run:

```bash
npm run lint
npm run test
npm run build
```

Your pull request should:

- describe the problem and the change clearly
- stay focused on one logical change when possible
- include tests when behavior changes
- avoid committing secrets or local environment files
- preserve accessibility and responsive behavior
- update documentation when public behavior changes

## Security

Do not report security vulnerabilities in a public issue. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the repository's MIT License.
