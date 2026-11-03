# Publishing and editing

Two surfaces, one owner per layer. Do not edit the same thing in both places.

| What you are changing | Where to change it | How it ships |
| --- | --- | --- |
| Project entries, page copy, media, site settings, taxonomy terms | Admin UI at `https://soyalejo.com/_emdash/admin` | Immediately. No build, no deploy. |
| Templates, layouts, styles, queries, routes | Repository (`src/`) | Branch → pull request → merge to `main`. CI builds and deploys over SSH. |
| Collections, fields, taxonomies | Admin UI (**Content Types**), then mirror into `seed/seed.json` | Immediately in the admin; the seed entry keeps fresh databases reproducible. |

The live site is a Node container behind Cloudflare's proxy, not a Cloudflare Worker. Content lives in `/opt/soyalejo/runtime/data.db`, which is a Docker volume mount and survives every deploy. Templates live in the image.

## Editing content (the normal case)

Open the admin, edit, publish. Nothing else. Wait for nothing.

This works because deploys seed with `--on-conflict skip`, which creates records that are missing and leaves existing ones alone.

## Changing code

```bash
git checkout -b <branch>
# edit src/, astro.config.mjs, styles
npm run typecheck && npm run build
git push
```

Open a pull request. CI runs `npm run bootstrap`, `npm run typecheck`, and `npm run build` on every pull request. Merging to `main` deploys to production.

## Changing the content model

1. Change collections or fields in the admin under **Content Types**.
2. Regenerate the TypeScript types the templates use: `npx emdash types --url https://soyalejo.com`.
3. Mirror the same change into `seed/seed.json` so a fresh database can be recreated.
4. Commit the seed and any template change that uses the new fields.

Deploying a changed seed does not evolve a live schema on its own — the admin change is what takes effect. The seed edit is for reproducibility.

## What the seed file is for

`seed/seed.json` is schema plus first-time fixtures, not a content publishing channel.

- **Add a new entry in the admin**, not in the seed.
- **Do not edit existing seed entries' `data`.** On any database that already holds that slug, the seed cannot win without risking an overwrite, and with `skip` it is silently ignored anyway.
- Regenerating the seed on purpose: `npx emdash export-seed --database ./data.db --with-content=all > seed/seed.json`. Review the diff before committing — it rewrites settings, content, and media references.

## Deploy safety

`verify-and-deploy.yml` seeds production with `--on-conflict skip`. `update` was removed deliberately: it replaces content data and reconciles taxonomy assignments, which destroys anything edited in the admin. Verified by test — an edited title survived `skip` and was overwritten by `update`.

The image seeds at build time because `astro build` requires `data.db` to exist for `COPY data.db` to succeed. That seeded copy is never authoritative: the runtime database is mounted over it, so the image's content is only a fallback for a fresh volume.

If a deploy ever needs to intentionally write seed content into production, do it as a separate, explicit, manual operation against a backup.

## Known emdash 0.30 bugs

`--no-content` and `--skip-media` are documented but ignored by the CLI (citty parses `--no-content` as negating a `content` flag). Do not rely on them. `--on-conflict` works and is what this repository depends on.

## Rollback

```bash
cd /opt/soyalejo
docker ps                                   # confirm current container
cp runtime/data.db runtime/data.db.bak      # back up before any restore
```

Redeploy a previous revision from the repository. Restoring database content is a separate step: check out the older database file and repoint the volume.
