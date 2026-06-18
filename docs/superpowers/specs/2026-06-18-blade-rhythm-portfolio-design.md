# Blade Rhythm Portfolio Integration

## Goal

Add Blade Rhythm as a playable JavaScript project that strengthens the portfolio's frontend and future SWE direction. The game should demonstrate real programming work without making the portfolio homepage feel busy or game-focused.

## Portfolio Placement

Blade Rhythm appears after Forni Pizza and before the Stream Deck and Todo projects. This creates a deliberate transition from client websites to technical and learning projects.

The project card contains:

- A gameplay screenshot taken from the working game.
- The label `JavaScript game`.
- A short description of its timing-based combat.
- The role `Game logic og frontend`.
- Technology badges for `JavaScript`, `HTML`, and `CSS`.
- A primary CTA labelled `Spil Blade Rhythm`.
- Space for a later GitHub CTA when a public repository is ready.

## Page Architecture

The game is copied into a self-contained `blade-rhythm/` directory inside the portfolio:

```text
blade-rhythm/
  index.html
  game.css
  script.js
  arena.png
  player.png
  orc.png
  blood-elf.png
  human.png
  favicon.png
```

The portfolio project card links to `blade-rhythm/index.html`. The game page includes a clear `Tilbage til portfolio` link and does not depend on the portfolio stylesheet or JavaScript.

## Game Page

The existing visual identity and core gameplay remain recognizable. The page is cleaned up only where needed for presentation, responsiveness, and input support.

The game page contains:

- Title and compact game status area.
- Responsive arena with player, enemy, and hit zone.
- Health, enemy health, difficulty, feedback, and notifications.
- Visible keyboard instructions.
- Touch controls for Attack, Heal, and Restart.
- A back link to the main portfolio.

The layout must work on desktop and mobile without horizontal overflow. Touch controls appear on touch-sized layouts but remain usable with a mouse.

## Gameplay And Input

The current vanilla JavaScript systems remain the technical focus:

- Repeating game loop and enemy movement.
- Keyboard input for Space, H, and R.
- Touch and click input using the same attack, heal, and restart functions.
- Hit-zone timing with normal and perfect attacks.
- Enemy selection and sprite changes.
- Health, combo healing, death, restart, and increasing difficulty.

Keyboard and touch controls must call shared handlers so the two input methods cannot drift into different game behavior.

## Resilience

- Repeated attack input continues to respect the attack cooldown.
- Heal input continues to respect full health and its cooldown.
- Restart resets all mutable game state and starts only one active game loop.
- Missing optional DOM elements do not crash input handlers.
- Controls have clear disabled or unavailable feedback where relevant.

## Accessibility

- Interactive controls use semantic buttons.
- Controls have visible keyboard focus states.
- Game instructions do not rely on emoji alone.
- Status messages remain readable against the arena.
- Touch targets are at least approximately 44 by 44 pixels.
- Motion respects `prefers-reduced-motion` for decorative idle and flashing animations.

## Verification

Test the following before considering the integration complete:

- The portfolio card image, content, badges, and CTA render correctly.
- The CTA opens the playable local game page.
- Space attacks, H heals, and R restarts.
- Attack, Heal, and Restart buttons work with mouse and touch input.
- Early, hit, and perfect timing produce the expected outcomes.
- Enemy defeat spawns a new enemy and increases difficulty.
- Death and restart reset the game without creating duplicate loops.
- Desktop and mobile layouts have no clipping or horizontal overflow.
- The game can return to the portfolio using the back link.
- Existing portfolio navigation, dark/light mode, and project links still work.

## Scope Boundary

This integration does not rebuild Blade Rhythm in a framework, add audio, add saved scores, or redesign it into a larger game. Those can become later improvements after the playable project is presented cleanly and reliably.
