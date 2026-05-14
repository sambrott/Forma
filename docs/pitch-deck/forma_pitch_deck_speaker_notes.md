# Forma pitch deck · speaker notes

Use with `forma_pitch_deck.html`: **13 slides** in order (← →). Bullets are a live script—you can shorten on the fly.

---

## Slide 1 · Cover (`s1`)

- Good [morning / afternoon]. I’m [name]. This is **Forma**.
- Tagline on screen: **work done—without the noise.** That’s the product promise.
- Domain: **forma.cool**.
- *[Pause]* The motion behind the logo is the same inward-sweep idea we ship on marketing surfaces—warmth and craft, not stock SaaS vibes.

---

## Slide 2 · The problem (`s2`)

- The category isn’t missing tools—it’s missing **trust and respect**.
- **Smallpdf**, **iLovePDF**: familiar names—paywalls, caps, surprise charges surface in reviews.
- I’m not reading random tweets—the slide cites **G2, Capterra, Reddit**.
- Thesis: users feel the products are **designed to frustrate them into upgrading**. Forma treats that as the opening.

---

## Slide 3 · Brand directions (`s3`)

- Early on we explored **three brand directions**.
- **A · “Pxl”** — dark-first, neon, monospace—felt like a developer utility, not a document product.
- **B · “Mixboard”** — warm and playful—we liked the energy but it risked feeling toy-like for serious files.
- **C · “Toolmark” [selected]** — editorial serif, neutral sans, **one orange accent**, gallery-quiet. That’s what became Forma visually.

---

## Slide 4 · Brand system (`s4`)

- **Guidelines**: not a fuzzy mood board—tokens we actually ship.
- **Colors**: accent **#E8622A**, page **#F7F4EF**, text **#181614**, dark base **#060606**—light and dark are first-class.
- **Type**: **Fraunces** for display, **Geist** for UI and body—the sample headline matches the marketing line.
- **Mini layouts**: simplified **forma.cool** home—same structure in **warm** vs **dark** so people see parity.
- **Hero motion**: left tile labelled **main**—**halftone** that reacts on hover—the real interaction language from production. Right tile (**alternate**) is the **inward sweep** dot animation used on cover and banner contexts.
- *[Optional demo]* Mention you can hover the halftone on this slide briefly.

---

## Slide 5 · Design & prototyping (`s6`)

- How we got from PDF of guidelines to a site: **three steps**, no hand-waving.
- **01 · Brand system defined** — everything in **tokens** (color, type, spacing, states).
- **02 · Every component in HTML** — upload zones, file cards, progress, results—in **static HTML** before frameworks so behavior was cheap to iterate.
- **03 · Built with Claude in Cursor** — Composer-style workflow; references to those tokens kept the AI output aligned. Ships as **Next.js on Vercel** with **Supabase**.

---

## Slide 6 · Tool demo · Compress PDF (`s7`)

- **Compress** is representative: frictionless intake, honest progress, tangible outcome.
- Walk through silently or narrate lightly: drag/drop cue → file card → staged progress messages → **~74% savings**-style result.** Numbers on deck are illustrative; adjust if you cite live benchmarks.

---

## Slide 7 · Tool demo · Split PDF (`s8`)

- **Split** sells **deterministic document logic** — one artifact becomes two with clear semantics.
- On screen: spine between sides, labels **Pages 1–12 · Pages 13–24** once the animation completes.
- Tie to roadmap: splitting is plumbing other tools stack on—we own the dull core well.

---

## Slide 8 · Tool demo · Receipt → Excel (`s9`)

- **Receipt → spreadsheet** proves **structured extraction**, not OCR theatre.
- Line items roll into rows; totals reconcile—shows **trust** (“the math checks”) more than flashy UI.

---

## Slide 9 · Tool stack (`s10`)

- One line: **Tool stack.** Boring-by-design on purpose—we’re buying **maintainability and speed**.
- Lower band: split—**ten free / no-account tools** vs **five AI tools on Pro** ($9/mo framing elsewhere); the on-screen list matches what’s on forma.
- **Next.js 14** App Router · **TypeScript** · **CSS Modules**.
- **Vercel** for deploy and scaling with minimal ops.
- **Supabase** for **PostgreSQL**, auth patterns, row-level security when we need it.
- **Claude Haiku + Whisper**: Haiku for **extraction**/document tasks cheap at scale; Whisper when users need **transcription**.
- *[If questioned on cost]*: frame Haiku vs Opus consciously—we picked **unit economics**.

---

## Slide 10 · Marketing (`s11`)

- **Marketing.** Headline stays short intentionally—everything lives in the four tiles.
- **Twitter**: build in public—authentic beats polished when you’re unknown.
- **Reddit**: high-intent **r/SideProject**, productivity, freelance—truthful posts in the right thread convert.
- **Product Hunt**: one concentrated spike — coordinate support the night before; free attention if you nail timing.
- **Instagram + LinkedIn**: awareness—not primary conversion—Reels demos and one sharp LinkedIn story about **trusted tools in an abused category**.

---

## Slide 11 · Pricing (`s12`)

- **Pricing** in three tiers—plain language matches the slides.
- **Free · $0** — ads, optional sign-in framing; cite **fractional pennies** per recreational user **only if** you’re confident in real telemetry.
- **Pro · $9/mo** — unlimited AI framing, batch, storage—call out **estimated API exposure** (**~$1.50–2.50 / user / month**) **as your model assumption**, strong margin thesis.
- **Business** — **consultative** quoting: teams, flat contracts, bespoke **Tool Program**.
- *[Don’t extrapolate revenue]*—you removed bottom stat tiles deliberately; anchor on **pricing logic**, not unsubstantiated forecasts.

---

## Slide 12 · The ask (`s13`)

- **$12,000 · six months of runway.** Round number on purpose—not a padded Series A cartoon.
- **$3k marketing** — Product Hunt push, influencer-style posts budgeted thin, Reddit/Twitter pushes, polished demo reel.
- **$6k API bridge** — **$800–1,200 / month ballpark while ~500 AI-heavy subscribers ramp** — stress that’s **scenario-based**, not a promise.
- **$3k operations** — trademark, infra, legal buffer, contingency.
- Close the loop: this is **distribution + safe technical scaling headroom**, not founder salary drama.

---

## Slide 13 · Close · Why Forma (`s14`)

- Three beats—align your spoken line with what’s on screen.
- **01** — **A tool suite built for security and functionality**—position Forma as serious infrastructure, not a toy converter.
- **02** — **A tool that freelancers and teams alike can love.**—emotion and retention; broaden beyond solo users without diluting craft.
- **03** — **The product exists** — this wedge is largely **finding people who need it** and proving it works. You’re underwriting **distribution and trust**, not R&D from zero.
- End on **forma.** / **forma.cool** footer—invite questions.

---

## Quick logistics

- **Navigate**: arrow keys, space bar, footer dots.
- Practice **slides 6–8** (**Compress**, **Split**, **Receipt**) once—loops run automatically once you land on those slides; rehearse so you aren’t talking over the payoff animations.
- Customize any **financial** bullets to match diligence you’d actually defend.
