# EmDash Portfolio Template

A visual portfolio for showcasing creative work, built with [EmDash](https://github.com/emdash-cms/emdash). Runs on any Node.js server with SQLite and local file storage. Project pages with tag filtering, case study layouts, and an RSS feed for new work.

![Portfolio template work page](https://raw.githubusercontent.com/emdash-cms/emdash/main/assets/templates/portfolio/latest/work-light-desktop.jpg)

## What's Included

- Project grid with hover effects
- Tag-based filtering on the work page
- Individual project pages with galleries
- About and contact pages
- RSS feed for new projects
- SEO metadata and JSON-LD
- Dark/light mode

## Pages

| Page | Route |
|---|---|
| Homepage | `/` |
| Work listing | `/work` |
| Single project | `/work/:slug` |
| About | `/about` |
| Contact | `/contact` |
| RSS | `/rss.xml` |
| 404 | fallback |

## Screenshots

| | Desktop | Mobile |
|---|---|---|
| Light | ![work light desktop](https://raw.githubusercontent.com/emdash-cms/emdash/main/assets/templates/portfolio/latest/work-light-desktop.jpg) | ![work light mobile](https://raw.githubusercontent.com/emdash-cms/emdash/main/assets/templates/portfolio/latest/work-light-mobile.jpg) |
| Dark | ![work dark desktop](https://raw.githubusercontent.com/emdash-cms/emdash/main/assets/templates/portfolio/latest/work-dark-desktop.jpg) | ![work dark mobile](https://raw.githubusercontent.com/emdash-cms/emdash/main/assets/templates/portfolio/latest/work-dark-mobile.jpg) |

## Infrastructure

- **Runtime:** Node.js
- **Database:** SQLite (local file)
- **Storage:** Local filesystem
- **Framework:** Astro with `@astrojs/node`

## Local development

```bash
npm install
npm run bootstrap
npm run dev
```

`npm run bootstrap` applies `seed/seed.json` to the local SQLite database and
downloads the seed cover images. Run it for a new or intentionally reset local
database. It updates existing seeded content; it is not required for routine
starts once `data.db` already contains the portfolio.

Open http://localhost:4321 for the site and http://localhost:4321/_emdash/admin for the CMS.

## Want Cloudflare Instead?

See the [Cloudflare variant](../portfolio-cloudflare) for a version that deploys to Cloudflare Workers with D1 and R2.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/portfolio-cloudflare)

## See Also

- [All templates](../)
- [EmDash documentation](https://github.com/emdash-cms/emdash/tree/main/docs)
