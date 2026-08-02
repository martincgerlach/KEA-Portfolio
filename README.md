# Gerlach Design Portfolio

Personal portfolio for Martin Gerlach, a Multimedia Design student and qualified IT support specialist developing towards frontend, software and creative technology roles.

## Featured work

- StudyMate AI - AI UX, frontend and backend prototype
- LG Bio Capital Partners - live client website
- Blade Rhythm - vanilla JavaScript browser game
- PlayNext - React, TypeScript, API architecture and bounded AI recommendations

The homepage also includes smaller client and visual-storytelling work without giving every project the same visual weight.

## Stack

- Semantic HTML
- CSS Grid and Flexbox
- Vanilla JavaScript
- English and Danish translations
- GitHub Pages and Cloudflare domain setup

No framework or build step is required.

## Run locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

## Test

```bash
node --test tests/*.test.mjs
```

The tests cover translation hooks, project order and links, responsive rules, key accessibility behavior, image assets and Blade Rhythm game logic.

## Accessibility approach

The site uses semantic landmarks, a logical heading structure, visible focus states, a skip link, minimum touch targets, reduced-motion support and descriptive image alternatives. Dark and light themes are both tested at common mobile, tablet and desktop widths.

## Deployment

The production site is [gerlachdesign.dk](https://gerlachdesign.dk/). Changes should be reviewed in a feature branch and verified locally before merging to `main`.
