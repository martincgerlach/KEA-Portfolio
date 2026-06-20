# Favicon And Logo Treatment Redesign

## Goal

Replace the current gradient `MG` favicon with a simpler mark and tighten the existing Gerlach Design wordmark treatment in the navigation and hero identity card.

## Approved Direction

- Use Canva candidate A as the visual source.
- Use one geometric capital `G`, not `MG` and not the full Gerlach Design wordmark.
- Keep the mark black and white with no gradient, shadow, texture or decorative illustration.
- Remove the small stray `G` visible at the lower-right edge of the generated Canva concept.
- Keep the strong angular negative-space detail inside the selected `G`.

Canva master: [Three Bold G Logo Designs for Gerlach Design](https://www.canva.com/d/C92yE5CTZmQ8joR)

## Composition

- Square canvas.
- Near-black geometric `G` centered on an off-white background.
- Even visual padding of approximately 10-12% around the mark.
- No rounded container inside the canvas; the browser supplies the favicon framing.
- The silhouette must remain clear at both 32 x 32 px and 16 x 16 px.

## Website Scope

- Replace the existing `favicon.png` asset.
- Keep the existing `<link rel="icon" type="image/png" href="favicon.png">` integration.
- Keep the original Gerlach Design wordmark paths, typography and black/white composition.
- Crop the existing `Gerlach Design.svg` canvas closely around the wordmark.
- Keep a white field behind `DESIGN` and a narrow, even white edge around the full wordmark.
- Remove the large white CSS tile around the logo in both the navigation and hero identity card.
- Use the approved compact treatment in both placements for consistency.
- Do not change the portfolio palette or other branding assets.
- Keep the source Canva design editable for future brand refinements.

## Approved Wordmark Preview

- The proposed compact crop shown on 20 June 2026 is approved.
- Preserve the existing vector paths; this is a crop and background treatment, not a new logo drawing.
- Use a compact SVG viewBox around the current artwork instead of scaling the large empty canvas.
- Keep only a small white margin around the wordmark and no rounded white card behind it.
- The navigation and hero identity card must use the same compact source asset.

## Export

- Export the approved, cleaned design as a square PNG at 512 x 512 px.
- Use RGB color and preserve crisp hard edges.
- Optimize the final file without visibly softening the monogram.
- Use the existing filename `favicon.png` so no new runtime dependency or path is introduced.

## Validation

- Confirm the favicon loads without a 404 locally and on `gerlachdesign.dk`.
- Check the icon in light and dark browser chrome.
- Inspect at 16 x 16 px, 32 x 32 px and the 512 x 512 px source size.
- Confirm there is no stray text, excessive white margin, blur or clipping.
- Confirm the compact wordmark is readable in the navigation and identity card in both themes.
- Run the existing automated portfolio tests and `git diff --check` before commit.

## Out Of Scope

- A complete Gerlach Design logo redesign.
- Changes to the Gerlach Design wordmark typography or letterforms.
- Broader changes to typography, colors or layout on the portfolio itself.
- Animated favicons or separate light/dark favicon files.
