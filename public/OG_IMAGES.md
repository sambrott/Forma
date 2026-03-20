# Open Graph images (1200×630)

Add these files **here** in `public/`:

| File | Role |
|------|------|
| `opengraph-image.png` | **Primary (dark)** — default for iMessage, Twitter, Slack, etc. |
| `og-image-light.png` | **Backup (light)** — second image in `app/layout.tsx` metadata |

Paths in the app: `/opengraph-image.png` and `/og-image-light.png`.

**Do not** duplicate as `app/opengraph-image.png` if you use these — one canonical asset avoids conflicting OG routes.
