# Bilingual Portfolio Design

## Goal

Make the portfolio useful for both Danish and international applications without maintaining two copies of either page.

The portfolio and Blade Rhythm open in English by default. Visitors can switch between English and Danish, and the choice follows them between the two pages.

## Language Behavior

- Supported language codes are `en` and `da`.
- A first-time visitor sees English.
- The selected language is stored in `localStorage` under `gerlach-language`.
- A returning visitor sees the last selected language.
- Invalid or missing stored values fall back to English.
- `localStorage` reads and writes use `try/catch`. If storage is unavailable, switching still works for the current page and English remains the next-page fallback.
- Switching language updates the current page immediately without reloading.
- The `<html lang>` attribute always matches the visible language.
- The language control exposes the current selection to assistive technology.

## Language Control

Use a compact segmented control with two visible options: `EN` and `DA`.

- On the portfolio, place it in the main navigation beside the theme control.
- On Blade Rhythm, place it in the game header near the back link.
- The active option has a clear visual state in dark and light mode.
- Each option has a minimum touch target of `44px`.
- The control remains usable at `320px` without forcing horizontal overflow.

## Translation Architecture

Use a small vanilla JavaScript localization layer:

- `language.js` contains the shared language state, fallback behavior, DOM updates, and `localStorage` integration.
- `portfolio-translations.js` contains English and Danish strings for `index.html`.
- `blade-rhythm/translations.js` contains static and dynamic Blade Rhythm strings.
- Elements with visible translated text use `data-i18n="translation.key"`.
- Translated attributes use `data-i18n-attr="attribute:translation.key"`. Multiple attributes use semicolon-separated pairs, for example `data-i18n-attr="alt:hero.portraitAlt;aria-label:hero.visualLabel"`.
- `language.js` exposes a small `t(key, values)` function for dynamic game messages.
- Missing Danish values fall back to the English value for the same key.
- Missing keys never render `undefined`; the existing text stays visible and a console warning identifies the missing key during development.

The page-specific translation file loads before `language.js`. Blade Rhythm loads both language files before its existing `script.js`, so game logic can call `t()` without owning the language state.

After each language change, `language.js` dispatches a `languagechange` event with the active language in `event.detail.language`. The portfolio theme script listens for this event and refreshes only its translated button label. Blade Rhythm does not restart or recreate any timers in response to the event.

## Portfolio Translation Scope

Translate all visitor-facing text in `index.html`:

- Page title and meta description.
- Skip link, navigation, theme control, and language control labels.
- Hero label, headline, introduction, CTAs, portrait alt text, and identity copy.
- All section labels, headings, introductions, facts, and card copy.
- Project type labels, role labels, problem/solution labels, descriptions, CTA labels, image alt text, and ARIA labels.
- About, skills, CV/material, contact, and footer text.

Keep these unchanged in both languages:

- Personal, company, and project names.
- Technology names such as HTML, CSS, JavaScript, GitHub, APIs, DOM, Figma, and Cloudflare.
- Email addresses, URLs, filenames, and code repository links.

The English writing must stay simple and personal. It should sound like Martin explaining his work, not like an agency or a corporate profile.

### Core English Copy

- Hero heading: `Web, UX and frontend with a technical background`
- Hero CTA: `View projects`
- Contact CTA: `Contact me`
- Projects heading: `Selected projects`
- About heading: `About me`
- Skills heading: `Skills`
- Material heading: `CV and material`
- Contact heading: `Let's have a chat`
- Background fact: `Qualified IT support specialist and currently studying Multimedia Design`
- Direction fact: `More code, stronger frontend and better case studies`

The Danish dictionary preserves the currently approved Danish text instead of introducing a second rewrite.

## Theme Control

The existing theme behavior remains unchanged.

Its visible label is translated:

- English: `Light mode` / `Dark mode`
- Danish: `Lyst tema` / `Mørkt tema`

Changing language must update the current theme label without changing the selected theme.

## Blade Rhythm Translation Scope

Translate all static text and accessibility labels in `blade-rhythm/index.html`:

- Back link, introduction, status labels, restart hint, controls, ARIA labels, and image alt text.
- Page title remains `Blade Rhythm | Martin Gerlach` in both languages.
- Character names, HP, keyboard keys, and the `Blade Rhythm` name remain unchanged.

Translate dynamic messages in `blade-rhythm/script.js` through `t()`:

| Key | English | Danish |
| --- | --- | --- |
| `game.feedback.enemyHit` | `💥 HIT BY ENEMY` | `💥 RAMT AF FJENDEN` |
| `game.feedback.tooEarly` | `❌ TOO EARLY` | `❌ FOR TIDLIGT` |
| `game.feedback.perfect` | `🔥 PERFECT` | `🔥 PERFEKT` |
| `game.feedback.hit` | `⚔️ HIT` | `⚔️ TRÆFFER` |
| `game.feedback.fullHealth` | `✨ ALREADY FULL` | `✨ ALLEREDE FULDT LIV` |
| `game.feedback.heal` | `✨ HEAL!` | `✨ HELBRED!` |
| `game.notification.spawn` | `👾 {name} has spawned!` | `👾 {name} er dukket op!` |
| `game.notification.comboHeal` | `💚 +{amount} HP` | `💚 +{amount} HP` |

Changing language while playing does not reset health, enemy, difficulty, position, combo, or timers. New feedback uses the newly selected language immediately.

## Responsive Design

- The portfolio navigation retains its existing two-row mobile structure.
- The language and theme controls share the first mobile navigation row without covering the logo.
- Blade Rhythm keeps its current game dimensions and controls.
- Language controls do not resize or shift nearby content when the active language changes.
- Test at `1440px`, `430px`, `390 x 844`, and `320px`.

## Accessibility

- Both language options are keyboard accessible.
- The active language uses `aria-pressed="true"`; the inactive language uses `false`.
- The language group has a translated accessible label.
- Focus states remain visible in both themes.
- Translated text does not remove existing live regions.
- `html[lang]`, translated alt text, and translated ARIA labels are verified in both languages.

## Testing

- Test English as the default when no stored preference exists.
- Test Danish and English toggling without reload.
- Test persistence through the shared `gerlach-language` key.
- Test fallback behavior for invalid language values and missing Danish strings.
- Test portfolio text, metadata, translated attributes, theme label, and ARIA state.
- Test Blade Rhythm static labels and every dynamic feedback key.
- Test that language changes do not create extra game-loop timers or reset game state.
- Run all existing portfolio and Blade Rhythm regression tests.
- Browser-test both pages in both languages, both portfolio themes, desktop, and mobile.

## Out Of Scope

- Separate `/en/` and `/da/` URLs.
- Automatic browser-language detection.
- Translating downloadable PDF files.
- Changing project names, technology tags, game rules, game art, or portfolio layouts.
- Adding a framework, translation library, or backend.
