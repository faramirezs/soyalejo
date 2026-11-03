# Alejandro Ramírez: Automation & Integrations Engineer

An EmDash portfolio for reliable workflow systems, API integrations, accounting automation, document processing, developer tools, and open-source work.

## Case studies

- **From SEO traffic to case-specific guidance**: Make, Airtable, data intake, deterministic routes, and delivery automation for JurisDATA.
- **From supplier PDF to an idempotent Lexware invoice**: n8n document parsing, duplicate prevention, tax-bucket preservation, and source-evidence attachment.
- **Accounting automation that refuses to guess**: a fail-closed SumUp → Lexware workflow with persisted state and read-back verification.
- **Payout evidence belongs with the voucher**: scheduled PDF matching and attachment checks for accounting audit trails.
- **A CLI for a supplier portal built for clicks**: public `hamberger-dl` proof of OIDC, document download, filters, ZIP export, and safe re-runs.
- **Merged open-source contribution**: [iii-hq/workers#690](https://github.com/iii-hq/workers/pull/690), a Rust streaming LLM provider for OpenCode Go.

## Local development

```bash
npm install
npm run bootstrap
npm run dev
```

`npm run bootstrap` applies `seed/seed.json` to the local SQLite database with `--on-conflict skip`: it creates missing records and never overwrites ones you already have. Run it for a new database or after adding schema to the seed. Pull local content back into the seed with `npx emdash export-seed --with-content=all > seed/seed.json`. Start the site at `http://localhost:4321`.

See [PUBLISHING.md](PUBLISHING.md) for what to edit in the admin UI versus the repository.

## Verification

```bash
npm run typecheck
npm run build
```

## Technical stack

- Astro + EmDash CMS
- Node.js server adapter
- SQLite and local media storage
- Seeded CMS schema and fixtures in `seed/seed.json`; live content lives in the admin database

## Publication boundary

The case studies are sanitised. This repository does not contain customer data, financial records, production workflow exports, API credentials, connection IDs, document IDs, or raw legal-intake data.
