# Handoff: pitch sites for local businesses (as of 2026-09-28)

Summary of a long session, so a new conversation can start from here. Read this first.

## Business idea

Roma (developer and designer, works with Claude) and his friend Ilya (good at talking to people and closing deals) want to turn the pitch-site workflow into a joint business:

- find a local business with a good map card but a weak or missing website;
- build a free demo site from its public data before the first contact;
- Ilya shows the demo to the owner and sells the real site.

Next step: a separate portfolio / agency site for Roma and Ilya that shows these demos and sells the service. Open questions for that project: studio name, domain, prices (see the `user-handles` memory for the current packages), contacts, languages (RU and EN audiences), stack (default Vite + React + TS + Tailwind; Next.js if SEO matters).

## Live demos (all in ~/Portfolio, GitHub Pages from `main`)

| Site | Link | Design | Signature idea |
|---|---|---|---|
| «Груша», beauty salon, Khimki | https://lilbunnych.github.io/Portfolio/pitch/grusha/ | Light futurism: mint wavy shader background, frosted glass panels, Unbounded + Manrope, one lime accent | 3D glass pear refracting a giant "ГРУША" wordmark; service filters with "хит" badges; 2D gallery that leans with scroll speed; 4-step booking |
| Марина Борухсон, beauty salon, Khimki | https://lilbunnych.github.io/Portfolio/pitch/borukhson/ | Grusha layout in pearl and berry (from the pink «МБ» logo) | 3D glass nail-polish bottle; shade picker recolours the lacquer; laser hair removal zone builder that finds the cheapest complex; perks from reviews |
| Студия Анастасии Бабиевой, Khimki | https://lilbunnych.github.io/Portfolio/pitch/babieva/ | Grusha layout, fox palette: cream, amber, rust, forest green (from the fox logo) | Cartoon fox head of translucent amber glass; "Подология" filter |
| M13, barbershop, Khimki | https://lilbunnych.github.io/Portfolio/pitch/m13/ | Dark loft: graphite, brick red, bone text, film grain, sharp corners, Oswald + Onest, numbered sections | 3D barber pole with climbing stripes; price ticker; "family barbershop" block (kids room, father + son) |
| РЕАЛ, barbershop, Novokurkino | https://lilbunnych.github.io/Portfolio/pitch/real/ | Street poster: paper white, ink, signal red, Dela Gothic One + Golos Text, price stickers, pills | 3D straight razor that flips open across a giant "REAL"; price list as a receipt builder (items print into a torn-edge receipt, "book with this receipt"); "Real = настоящий" facts from reviews; "cats only" rule |

Older pitch folders from earlier sessions: `kosmos`, `natali`, `tina`, `yakhont`. Full Grusha design spec: `_snippets/design-grusha.md`.

Separate client project: **Shtukaturking** (`~/Shtukaturking`, Next.js 16, branch `redesign-demos`, uncommitted). The «Корона» variant (glass-crown intro, owner photo, gold on graphite) is now the home page; other variants were deleted. Waiting for the owner's photo, contacts, prices and text checks listed in `REVIEW.md`.

## Workflow that works (about 1-2 hours per site)

1. **Data.** Resolve the short map link: `curl -sIL <link> | grep -i location` gives `/maps/org/<slug>/<id>/`. Download `https://yandex.ru/maps/org/<slug>/<id>/{,prices/,reviews/,gallery/}` with a Safari User-Agent. Strip tags to text and read name, rating, number of ratings and reviews, address, phone, prices, review topics with counts, and reviews. Hours come from `"workingTimeText"` and coordinates from `"displayCoordinates"` in the HTML.
2. **Photos.** Collect `avatars.mds.yandex.net/get-altay/...` URLs from the gallery page and build a contact sheet first.
   - Only the first N photos belong to the business. The rest are "similar places", often other barbershops such as M13: never use them.
   - Download with `/orig`, resize with `sips -Z 1400`, and convert WebP to JPEG.
3. **Build.** `rsync -a --exclude node_modules pitch/<closest>-src/ pitch/<slug>-src/`, then set `outDir: '../<slug>'` in `vite.config.ts` and the name in `package.json`.
   - Files to change: `src/data.ts`, `src/prices.ts`, `src/index.css` (tokens), `Hero.tsx`, `Nav.tsx`, `Sections.tsx`, `three/*Scene.tsx`, `index.html` (title, meta, favicon, DEMO banner text), `README.md`.
   - Shared pieces that work as they are: booking store and dialog, 2D gallery, lightbox, text effects, open/closed status in Moscow time.
4. **Check.** Serve `~/Portfolio` with `python3 -m http.server 8765`. Screenshot at 1440x900 and 390x844 in Playwright WebKit (from `~/Shtukaturking/node_modules/playwright`), because the user uses Safari.
5. **Deploy.** Commit only `pitch/<slug>-src` and `pitch/<slug>` (no node_modules), then push to `main`. Pages updates in 1-2 minutes. Send the link `https://lilbunnych.github.io/Portfolio/pitch/<slug>/` early.

## Rules the user set or confirmed

- No em-dashes in visible text. No invented claims: every fact comes from the card or reviews. Avoid "from Yandex Maps" wording.
- Owner's words stay a quoted placeholder until the owner writes them.
- Reviews: pick real positive ones, shorten surnames. Counts must be real; hand-counted topics are labelled as such. No per-card stars when the real rating is unknown.
- When promotions conflict (for example "30%" on the card and "1 200 ₽" in the price list), show only the consistent fact.
- Every demo keeps the yellow DEMO tab and `noindex`.
- For a new site, change the design each time unless the user asks for "exactly like Grusha". Improvise from the business itself: logo colours, interior, a quirk from the card or reviews.

## Technical pitfalls already solved

- 3D text (troika `Text`) needs a `.woff` font file, not woff2.
- `transmission` glass blurs whatever is behind it. For sharp content inside glass (the barber pole), use plain `transparent` + `opacity`.
- Transmissive objects on a dark environment look muddy: add `emissive` to coloured liquids, or brighten the environment.
- A giant wordmark overflows on phones: size it by `vw` with a smaller factor on mobile.
- Horizontal scroll rows inside a grid column stretch the column: add `min-w-0`.
- WebGL canvas and its anchor must be measured against the same element (the canvas container).
- When forking between themes, re-check corner radius and text colours in shared components (Booking, Gallery2D, Lightbox): for example, a red fill needs white text, not the theme foreground.
