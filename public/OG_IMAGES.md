# Open Graph images (1200×630)

OG images live next to `app/layout.tsx` and are **imported** there (not served from `public/`).

| File (in `app/`) | Role |
|------------------|------|
| `forma-og-dark.png` | **Primary (dark)** — default for Twitter, first in `openGraph.images` |
| `forma-og-light.png` | **Alternate (light)** — second image in `openGraph.images` |

`metadata.openGraph` / `twitter` use the hashed `/_next/static/...` URLs from those imports.

**Do not** also add `app/opengraph-image.png` (Next file convention) unless you remove the imports — duplicate OG sources can conflict.
