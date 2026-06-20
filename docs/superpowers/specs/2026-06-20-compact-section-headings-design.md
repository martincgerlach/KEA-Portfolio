# Compact Section Headings Design

## Goal

Make the portfolio's repeated section introductions feel calmer, more coherent, and less like separate hero sections. The change should lead visitors into the actual project and profile content faster.

## Approved Direction

Use one compact, left-aligned section heading pattern for the Projects, About, Skills, and CV sections.

Each heading contains:

1. A small accent label.
2. A direct section title.
3. A short supporting paragraph below the title.

The three elements stay in one content column. The current split layout, with the label isolated on the left and oversized text on the right, is removed.

## Section Copy

### Projects

- Label: `Portfolio`
- Title: `Udvalgte projekter`
- Supporting text: `Et udvalg af websites, frontend-projekter og designcases, der viser hvordan jeg arbejder med struktur, brugeroplevelse og kode.`

### About

- Label: `Profil`
- Title: `Om mig`
- Supporting text: `Hej, jeg hedder Martin. Jeg er 22 år og uddannet IT-supporter. Jeg bruger den tekniske baggrund til at forstå problemerne bag et website, ikke kun hvordan det ser ud på overfladen.`

### Skills

- Label: `Det arbejder jeg med`
- Title: `Kompetencer`
- Supporting text: `De områder og værktøjer jeg bruger i mine projekter og gerne vil udvikle videre.`

### CV And Material

- Label: `Ansøgning`
- Title: `CV og materiale`
- Supporting text: `Dokumenter og cases, der supplerer mit CV og mine ansøgninger.`

## Visual Rules

- Section headings are left-aligned on all viewport sizes.
- The heading block has a maximum width of `760px`.
- Desktop titles use `clamp(3rem, 5vw, 3.75rem)`, producing a `48px` to `60px` range.
- Mobile titles use `clamp(2.125rem, 9vw, 2.375rem)`, producing a `34px` to `38px` range.
- Supporting paragraphs use `1.05rem` with a maximum width of `700px`.
- The label sits directly above the title with a small gap.
- The paragraph sits directly below the title with `18px` spacing.
- Reduce the space between the heading block and the following cards or panels.
- Keep the existing dark/light color system and green accent.
- Do not add gradients, illustrations, animations, or new card layouts.

## HTML And CSS Scope

- Reuse the existing `.section-heading`, `.section-label`, and section markup.
- Update the four titles, labels, and supporting texts in `index.html`.
- Change `.section-heading` from a two-column grid to a compact one-column layout in `style.css`.
- Remove CSS rules that place the label, title, and paragraph in separate grid columns.
- Preserve current section IDs, navigation links, accessibility structure, and responsive behavior.

## Responsive Behavior

- At desktop widths, the heading block remains compact rather than filling the full viewport height.
- At `390px` and `320px`, titles must wrap naturally without clipping or horizontal overflow.
- The first project card should remain close to the Projects introduction, with no new large empty area.

## Verification

- Add or update a Node test for the four approved titles and the one-column `.section-heading` rule.
- Run all existing Node tests.
- Check desktop at `1440px` wide.
- Check mobile at `390 x 844` and `320px` wide.
- Verify dark and light mode.
- Confirm no horizontal overflow, clipped text, or console errors.

## Out Of Scope

- Changes to project cards, navigation, hero, profile facts, or footer.
- New JavaScript or external libraries.
- New visual assets.
