# Contributing to Quill — Modular Content Publishing Engine

Thank you for considering contributing to Quill!

## Development Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. Ensure type check and tests pass before submitting a pull request:
   ```bash
   npx -p typescript tsc --noEmit
   npm test
   ```

## Commit Style
Use present tense imperative commit messages (e.g. `Add user auth flow`, `Fix token refresh logic`).
