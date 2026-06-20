# Bilingual Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an English-default `🇬🇧 EN | 🇩🇰 DA` language switcher to the portfolio and Blade Rhythm while preserving theme and game state.

**Architecture:** A shared `language.js` module owns language state, persistence, fallback, DOM translation, and the `t()` API. Each page supplies its own flat English/Danish dictionary before loading the shared module. Static content uses `data-i18n`; Blade Rhythm uses the same API for dynamic feedback.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, `localStorage`, Node.js built-in test runner, browser QA.

---

## File Structure

- Create `language.js`: shared language engine used by both pages.
- Create `portfolio-translations.js`: all portfolio English and Danish strings.
- Create `blade-rhythm/translations.js`: all game English and Danish strings.
- Modify `index.html`: English fallback content, translation hooks, language control, and translated theme label.
- Modify `style.css`: stable desktop/mobile language and navigation controls.
- Modify `blade-rhythm/index.html`: English fallback content, translation hooks, and language control.
- Modify `blade-rhythm/game.css`: compact game toolbar and responsive switcher.
- Modify `blade-rhythm/script.js`: route dynamic messages through `GerlachLanguage.t()`.
- Create `tests/language-engine.test.mjs`: shared engine behavior.
- Create `tests/portfolio-language.test.mjs`: portfolio coverage and markup.
- Create `tests/blade-rhythm-language.test.mjs`: game coverage and state preservation.
- Modify existing static tests where they currently assume Danish fallback HTML.

### Task 1: Build The Shared Language Engine

**Files:**
- Create: `tests/language-engine.test.mjs`
- Create: `language.js`

- [ ] **Step 1: Write failing engine tests**

Create `tests/language-engine.test.mjs`. Load `language.js` in a `vm` context with a small fake document, buttons, `CustomEvent`, and optional throwing storage. Assert these contracts:

```js
test("English is the default and invalid stored values fall back to English", () => {
  assert.equal(runLanguageEngine({ stored: null }).language, "en");
  assert.equal(runLanguageEngine({ stored: "fr" }).language, "en");
});

test("a valid stored Danish preference is restored", () => {
  assert.equal(runLanguageEngine({ stored: "da" }).language, "da");
});

test("translation falls back to English and interpolates values", () => {
  const app = runLanguageEngine({
    translations: {
      en: { greeting: "Hello {name}", fallback: "English fallback" },
      da: { greeting: "Hej {name}" },
    },
  });
  app.api.setLanguage("da");
  assert.equal(app.api.t("greeting", { name: "Martin" }), "Hej Martin");
  assert.equal(app.api.t("fallback"), "English fallback");
});

test("storage failures do not stop current-page switching", () => {
  const app = runLanguageEngine({ storageThrows: true });
  assert.doesNotThrow(() => app.api.setLanguage("da"));
  assert.equal(app.api.getLanguage(), "da");
});

test("language changes update html lang, pressed state and dispatch an event", () => {
  const app = runLanguageEngine();
  app.api.setLanguage("da");
  assert.equal(app.document.documentElement.lang, "da");
  assert.equal(app.buttons.da.getAttribute("aria-pressed"), "true");
  assert.equal(app.buttons.en.getAttribute("aria-pressed"), "false");
  assert.deepEqual(app.events.at(-1).detail, { language: "da" });
});
```

The helper must execute the source with `vm.runInContext`, expose `window.pageTranslations`, and implement only the DOM methods used by the engine: `querySelectorAll`, `addEventListener`, `setAttribute`, `getAttribute`, `textContent`, and `documentElement.lang`.

- [ ] **Step 2: Run the engine tests and verify they fail**

Run:

```bash
node --test tests/language-engine.test.mjs
```

Expected: FAIL because `language.js` does not exist.

- [ ] **Step 3: Implement the shared language engine**

Create `language.js` with this public contract:

```js
(function () {
  "use strict";

  const STORAGE_KEY = "gerlach-language";
  const SUPPORTED = new Set(["en", "da"]);
  const translations = window.pageTranslations || { en: {}, da: {} };

  function readStoredLanguage() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.has(stored) ? stored : "en";
    } catch {
      return "en";
    }
  }

  let currentLanguage = readStoredLanguage();

  function interpolate(value, values = {}) {
    return value.replace(/\{(\w+)\}/g, (match, key) =>
      Object.hasOwn(values, key) ? String(values[key]) : match,
    );
  }

  function findTranslation(key, language = currentLanguage) {
    return translations[language]?.[key] ?? translations.en?.[key] ?? null;
  }

  function t(key, values = {}) {
    const value = findTranslation(key);
    if (typeof value !== "string") {
      console.warn(`Missing translation: ${key}`);
      return key;
    }
    return interpolate(value, values);
  }

  function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = findTranslation(element.dataset.i18n);
      if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      element.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attribute, key] = pair.split(":");
        const value = findTranslation(key);
        if (attribute && typeof value === "string") element.setAttribute(attribute, value);
      });
    });

    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
    });
  }

  function setLanguage(language, options = {}) {
    currentLanguage = SUPPORTED.has(language) ? language : "en";
    if (options.persist !== false) {
      try {
        window.localStorage.setItem(STORAGE_KEY, currentLanguage);
      } catch {
        // Current-page switching still works when storage is unavailable.
      }
    }
    applyTranslations();
    document.dispatchEvent(new CustomEvent("languagechange", {
      detail: { language: currentLanguage },
    }));
  }

  function init() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    setLanguage(currentLanguage, { persist: false });
  }

  window.GerlachLanguage = {
    getLanguage: () => currentLanguage,
    setLanguage,
    t,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
```

- [ ] **Step 4: Run the focused tests**

Run `node --test tests/language-engine.test.mjs`.

Expected: all shared engine tests pass.

- [ ] **Step 5: Commit the engine**

```bash
git add language.js tests/language-engine.test.mjs
git commit -m "Add shared language engine"
```

### Task 2: Translate The Portfolio

**Files:**
- Create: `portfolio-translations.js`
- Create: `tests/portfolio-language.test.mjs`
- Modify: `index.html`
- Modify: `style.css`
- Modify: `tests/portfolio-refinements.test.mjs`
- Modify: `tests/section-headings.test.mjs`

- [ ] **Step 1: Write failing portfolio language tests**

Create tests that read `index.html`, `style.css`, and `portfolio-translations.js` and assert:

```js
test("portfolio defaults to English and loads translations before the engine", () => {
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<script src="portfolio-translations\.js"><\/script>\s*<script src="language\.js"><\/script>/s);
});

test("portfolio exposes the approved flag controls", () => {
  assert.match(html, /data-language="en"[^>]*>\s*<span[^>]*>🇬🇧<\/span>\s*EN/s);
  assert.match(html, /data-language="da"[^>]*>\s*<span[^>]*>🇩🇰<\/span>\s*DA/s);
});

test("portfolio dictionary covers both languages and core approved copy", () => {
  assert.match(source, /en:\s*\{/);
  assert.match(source, /da:\s*\{/);
  assert.match(source, /"hero\.heading": "Web, UX and frontend with a technical background"/);
  assert.match(source, /"hero\.heading": "Web, UX og frontend med teknisk baggrund"/);
  assert.match(source, /"facts\.backgroundValue": "Qualified IT support specialist and currently studying Multimedia Design"/);
});

test("mobile navigation keeps logo, language and theme controls on the first row", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));
  assert.match(mobile, /\.nav-actions\s*\{[^}]*grid-column:\s*2/s);
  assert.match(mobile, /\.theme-label\s*\{[^}]*display:\s*none/s);
});
```

Update the existing Danish static-copy tests to assert English fallback HTML plus the Danish values in `portfolio-translations.js`.

- [ ] **Step 2: Run the portfolio language tests and verify failure**

Run:

```bash
node --test tests/portfolio-language.test.mjs tests/portfolio-refinements.test.mjs tests/section-headings.test.mjs
```

Expected: FAIL because the portfolio has no translation dictionary, hooks, or switcher.

- [ ] **Step 3: Create the complete portfolio dictionary**

Create `portfolio-translations.js` as `window.pageTranslations = { en: {...}, da: {...} }`.

Use flat keys grouped by these prefixes:

```js
window.pageTranslations = {
  en: {
    "meta.title": "Martin Gerlach - Portfolio | Web Design, UX & Frontend",
    "meta.description": "Martin Gerlach's portfolio featuring web design, UX, frontend development and technical problem-solving.",
    "skip.content": "Skip to content",
    "nav.label": "Primary navigation",
    "nav.home": "Martin Gerlach home",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.cv": "CV",
    "nav.contact": "Contact",
    "language.label": "Choose language",
    "theme.light": "Light mode",
    "theme.dark": "Dark mode",
    "hero.label": "Portfolio / Web / UX / Frontend",
    "hero.heading": "Web, UX and frontend with a technical background",
    "hero.intro": "I build websites where the content is easy to understand, the layout feels calm and the technology stays out of the way. My IT support background makes me think practically: what does the user need to do, and how do we make it work properly?",
    "hero.projectsCta": "View projects",
    "hero.contactCta": "Contact me",
    "hero.visualLabel": "Portrait and visual identity",
    "hero.portraitAlt": "Portrait of Martin Gerlach",
    "hero.identity": "I aim for solutions that feel clear, useful and easy to explain.",
    "projects.label": "Portfolio",
    "projects.heading": "Selected projects",
    "projects.intro": "A selection of websites, frontend projects and design cases showing how I work with structure, user experience and code.",
    "project.role": "My role:",
    "project.problem": "Problem",
    "project.solution": "Solution",
    "project.challenge": "Challenge",
    "project.mySolution": "My solution",
    "project.view": "View project",
    "project.code": "View code",
    "project.building": "In development",
    "project.play": "Play Blade Rhythm",
    "project.case": "Read case",
    "project.openApp": "Open web app",
    "lg.type": "Client website",
    "lg.description": "A professional website for an advisory company working with life science and investment. The task was to make a complex field feel calm, credible and easy to understand.",
    "lg.role": "Web design, frontend and content structure",
    "lg.problem": "The company needed a clear and professional online presence.",
    "lg.solution": "A focused website with clear structure, calm visual direction and straightforward navigation.",
    "lg.techAria": "Technologies used for LG Bio Capital Partners",
    "lg.imageAlt": "Screenshot of the LG Bio Capital Partners website",
    "life.type": "Website in development",
    "life.description": "An upcoming website focused on professional presentation, clear information architecture and a visual identity that can grow with the project.",
    "life.role": "Information architecture, frontend and signup flow",
    "life.problem": "The project needs a clear digital foundation from the start.",
    "life.solution": "A planned website with structure, visual direction and responsive components.",
    "life.techAria": "Technologies planned for LifeScienceNextGen",
    "life.conceptAlt": "Concept card for the LifeScienceNextGen website",
    "forni.type": "Client website",
    "forni.description": "A website for a pizza food trailer focused on the menu, contact details and a simple presentation that works well on mobile.",
    "forni.role": "Web design and frontend",
    "forni.problem": "The client needed a clear online presentation.",
    "forni.solution": "A simple website with clear structure and an easy way to get in touch.",
    "forni.techAria": "Technologies used for Forni Pizza",
    "forni.imageAlt": "Screenshot of the Forni Pizza Food Trailer website",
    "blade.type": "JavaScript game",
    "blade.description": "A timing-based browser game where the player attacks, heals and faces faster enemies as the difficulty increases.",
    "blade.role": "Game logic and frontend",
    "blade.challenge": "Making input, timing and game state work as one system.",
    "blade.solution": "A vanilla JavaScript game loop with hit zones, combos, health and dynamic difficulty.",
    "blade.techAria": "Technologies used for Blade Rhythm",
    "blade.imageAlt": "Blade Rhythm gameplay showing the player, enemy and green timing zone",
    "stream.type": "UI/UX case",
    "stream.description": "A personal interface redesign focused on stronger hierarchy, calmer navigation and a clearer user experience.",
    "stream.role": "UI analysis and redesign",
    "stream.problem": "The interface could be easier to scan and understand.",
    "stream.solution": "A redesign with more structure, a clearer flow and stronger visual priorities.",
    "stream.techAria": "Technologies used for the Stream Deck redesign",
    "stream.imageAlt": "Screenshot of the Stream Deck UI redesign",
    "todo.type": "Frontend exercise",
    "todo.description": "A small JavaScript web app focused on interaction, local data storage and a simple user flow.",
    "todo.role": "JavaScript and frontend",
    "todo.problem": "The user needs a simple way to save and manage small tasks.",
    "todo.solution": "A clear app with JavaScript logic and local storage.",
    "todo.techAria": "Technologies used for the todo web app",
    "todo.imageAlt": "Screenshot of the todo web app",
    "facts.label": "A short profile of Martin",
    "facts.focus": "Focus",
    "facts.focusValue": "Building clear websites that are easy to use",
    "facts.background": "Background",
    "facts.backgroundValue": "Qualified IT support specialist and currently studying Multimedia Design",
    "facts.direction": "Direction",
    "facts.directionValue": "More code, stronger frontend and better case studies",
    "about.label": "Profile",
    "about.heading": "About me",
    "about.intro": "Hi, I'm Martin. I'm 22 and a qualified IT support specialist. I use my technical background to understand the problems behind a website, not only how it looks on the surface.",
    "about.directionHeading": "My direction",
    "about.directionText": "Right now, I use this portfolio to support applications for internships, jobs and projects within web, UX and frontend. Later, I want to use the same foundation to move further towards software engineering.",
    "about.processHeading": "How I work",
    "about.processText": "I start by understanding the need, clean up the structure and then build a solution that is easy to use. I like things to feel simple while still being technically sound.",
    "about.valueHeading": "What I can contribute",
    "about.valueText": "I combine IT support, troubleshooting, visual awareness and frontend development. That helps me build solutions where both user experience and technical operation make sense.",
    "skills.label": "What I work with",
    "skills.heading": "Skills",
    "skills.intro": "The areas and tools I use in my projects and want to keep developing.",
    "materials.label": "Applications",
    "materials.heading": "CV and material",
    "materials.intro": "Documents and cases that support my CV and applications.",
    "materials.cvText": "Download my CV in Danish or English.",
    "materials.danishCv": "Danish CV",
    "materials.englishCv": "English CV",
    "materials.caseText": "Read my Stream Deck case as an example of analysis, redesign and user flow.",
    "materials.downloadCase": "Download case",
    "materials.certificate": "Trade certificate",
    "materials.certificateText": "Documentation of my completed IT support education.",
    "materials.downloadCertificate": "Download certificate",
    "contact.label": "Contact",
    "contact.heading": "Let's have a chat",
    "contact.text": "I'm open to internships, junior roles and projects where I can combine IT, design and web development.",
    "contact.email": "Send email",
    "footer.thanks": "Thanks for visiting my portfolio.",
    "footer.copyright": "© 2026 Gerlachdesign"
  },
  da: {
    "meta.title": "Martin Gerlach - Portfolio | Webdesign, UX & Frontend",
    "meta.description": "Martin Gerlachs portfolio med webdesign, UX, frontend, IT-support og projekter med teknisk retning.",
    "skip.content": "Spring til indhold",
    "nav.label": "Primær navigation",
    "nav.home": "Martin Gerlach forside",
    "nav.projects": "Projekter",
    "nav.about": "Om mig",
    "nav.skills": "Kompetencer",
    "nav.cv": "CV",
    "nav.contact": "Kontakt",
    "language.label": "Vælg sprog",
    "theme.light": "Lyst tema",
    "theme.dark": "Mørkt tema",
    "hero.label": "Portfolio / Web / UX / Frontend",
    "hero.heading": "Web, UX og frontend med teknisk baggrund",
    "hero.intro": "Jeg laver websites, hvor indholdet er nemt at forstå, layoutet er roligt, og teknikken ikke står i vejen. Min IT-supportbaggrund gør, at jeg tænker praktisk: hvad skal brugeren kunne, og hvordan får vi det til at virke ordentligt?",
    "hero.projectsCta": "Se projekter",
    "hero.contactCta": "Kontakt mig",
    "hero.visualLabel": "Portræt og identitet",
    "hero.portraitAlt": "Portræt af Martin Gerlach",
    "hero.identity": "Jeg går efter løsninger, der føles tydelige, brugbare og nemme at forklare.",
    "projects.label": "Portfolio",
    "projects.heading": "Udvalgte projekter",
    "projects.intro": "Et udvalg af websites, frontend-projekter og designcases, der viser hvordan jeg arbejder med struktur, brugeroplevelse og kode.",
    "project.role": "Min rolle:",
    "project.problem": "Problem",
    "project.solution": "Løsning",
    "project.challenge": "Udfordring",
    "project.mySolution": "Min løsning",
    "project.view": "Se projekt",
    "project.code": "Se kode",
    "project.building": "Under opbygning",
    "project.play": "Spil Blade Rhythm",
    "project.case": "Læs case",
    "project.openApp": "Åbn webapp",
    "lg.type": "Client website",
    "lg.description": "Et professionelt website for en rådgivningsvirksomhed inden for life science og investering. Opgaven handler om at gøre et komplekst område mere roligt, troværdigt og nemt at forstå.",
    "lg.role": "Webdesign, frontend og content structure",
    "lg.problem": "Virksomheden skulle fremstå professionel og klar online.",
    "lg.solution": "Et enkelt site med tydelig struktur, rolig visuel retning og klar navigation.",
    "lg.techAria": "Teknologier brugt i LG Bio Capital Partners",
    "lg.imageAlt": "Screenshot af LG Bio Capital Partners website",
    "life.type": "Website under udvikling",
    "life.description": "Et kommende website med fokus på professionel præsentation, klar informationsarkitektur og en visuel identitet, der kan vokse med projektet.",
    "life.role": "Informationsarkitektur, frontend og signup-flow",
    "life.problem": "Projektet har brug for en tydelig digital base fra starten.",
    "life.solution": "Planlagt website med struktur, visuel retning og responsive komponenter.",
    "life.techAria": "Teknologier planlagt til LifeScienceNextGen",
    "life.conceptAlt": "Konceptkort for LifeScienceNextGen website",
    "forni.type": "Client website",
    "forni.description": "Et website til en pizza foodtrailer med fokus på menu, kontakt og en enkel præsentation, som fungerer godt på mobil.",
    "forni.role": "Webdesign og frontend",
    "forni.problem": "Kunden havde brug for en overskuelig online præsentation.",
    "forni.solution": "Et simpelt website med tydelig struktur og kontaktmulighed.",
    "forni.techAria": "Teknologier brugt i Forni Pizza",
    "forni.imageAlt": "Screenshot af Forni Pizza Foodtrailer website",
    "blade.type": "JavaScript game",
    "blade.description": "Et timing-baseret browsergame, hvor spilleren angriber, healer og møder hurtigere fjender, efterhånden som sværhedsgraden stiger.",
    "blade.role": "Game logic og frontend",
    "blade.challenge": "At få input, timing og game state til at fungere som ét samlet system.",
    "blade.solution": "Et vanilla JavaScript game loop med hit zones, combos, health og dynamisk sværhedsgrad.",
    "blade.techAria": "Teknologier brugt i Blade Rhythm",
    "blade.imageAlt": "Gameplay fra Blade Rhythm med spiller, fjende og grøn timing-zone i arenaen",
    "stream.type": "UI/UX case",
    "stream.description": "Et personligt interface-redesign med fokus på bedre hierarki, mere rolig navigation og en tydeligere brugeroplevelse.",
    "stream.role": "UI-analyse og redesign",
    "stream.problem": "Interfacet kunne blive lettere at scanne og forstå.",
    "stream.solution": "Redesign med mere struktur, klarere flow og bedre visuel prioritering.",
    "stream.techAria": "Teknologier brugt i Stream Deck redesign",
    "stream.imageAlt": "Screenshot af Stream Deck UI redesign",
    "todo.type": "Frontend exercise",
    "todo.description": "En lille JavaScript webapp, hvor fokus er interaktion, lokal datalagring og et simpelt brugerflow.",
    "todo.role": "JavaScript og frontend",
    "todo.problem": "Brugeren skal kunne gemme og styre små opgaver nemt.",
    "todo.solution": "En overskuelig app med JavaScript-logik og local storage.",
    "todo.techAria": "Teknologier brugt i Todo-liste webapp",
    "todo.imageAlt": "Screenshot af Todo-liste webapp",
    "facts.label": "Kort om Martins profil",
    "facts.focus": "Fokus",
    "facts.focusValue": "Bygge enkle websites der er lette at bruge",
    "facts.background": "Baggrund",
    "facts.backgroundValue": "Uddannet IT-supporter og studerer til multimediedesigner",
    "facts.direction": "Retning",
    "facts.directionValue": "Mere kode, bedre frontend og stærkere cases",
    "about.label": "Profil",
    "about.heading": "Om mig",
    "about.intro": "Hej, jeg hedder Martin. Jeg er 22 år og uddannet IT-supporter. Jeg bruger den tekniske baggrund til at forstå problemerne bag et website, ikke kun hvordan det ser ud på overfladen.",
    "about.directionHeading": "Min retning",
    "about.directionText": "Lige nu bygger jeg portfolioen som støtte til job, praktik og projekter inden for web, UX og frontend. Senere vil jeg gerne bruge den samme base til at bevæge mig mere mod software engineering.",
    "about.processHeading": "Min måde at arbejde på",
    "about.processText": "Jeg starter med at forstå behovet, rydder op i strukturen og bygger derefter en løsning, der er nem at bruge. Jeg kan godt lide når ting føles enkle, men stadig er teknisk ordentlige.",
    "about.valueHeading": "Det jeg kan bidrage med",
    "about.valueText": "Jeg kan kombinere IT-support, fejlfinding, visuel sans og frontend. Det gør mig god til at bygge løsninger, hvor både brugeroplevelse og teknisk drift giver mening.",
    "skills.label": "Det arbejder jeg med",
    "skills.heading": "Kompetencer",
    "skills.intro": "De områder og værktøjer jeg bruger i mine projekter og gerne vil udvikle videre.",
    "materials.label": "Ansøgning",
    "materials.heading": "CV og materiale",
    "materials.intro": "Dokumenter og cases, der supplerer mit CV og mine ansøgninger.",
    "materials.cvText": "Download mit CV på dansk eller engelsk.",
    "materials.danishCv": "Dansk CV",
    "materials.englishCv": "Engelsk CV",
    "materials.caseText": "Læs min Stream Deck case som eksempel på analyse, redesign og brugerflow.",
    "materials.downloadCase": "Download case",
    "materials.certificate": "Svendebrev",
    "materials.certificateText": "Dokumentation for min afsluttede IT-supporteruddannelse.",
    "materials.downloadCertificate": "Download bevis",
    "contact.label": "Kontakt",
    "contact.heading": "Skal vi tage en snak?",
    "contact.text": "Jeg er åben for praktik, juniorroller og projekter, hvor jeg kan kombinere IT, design og webudvikling.",
    "contact.email": "Send email",
    "footer.thanks": "Tak fordi du besøgte min portfolio.",
    "footer.copyright": "© 2026 Gerlachdesign"
  }
};
```

- [ ] **Step 4: Convert portfolio fallback HTML to English and add hooks**

- Set `<html lang="en">`.
- Add `data-i18n` to every translated text element.
- Add `data-i18n-attr` to the meta description, ARIA labels and alt text.
- Wrap the theme and language controls in `.nav-actions`.
- Use this exact language control:

```html
<div class="language-switcher" role="group" aria-label="Choose language" data-i18n-attr="aria-label:language.label">
  <button type="button" data-language="en" aria-pressed="true"><span aria-hidden="true">🇬🇧</span> EN</button>
  <button type="button" data-language="da" aria-pressed="false"><span aria-hidden="true">🇩🇰</span> DA</button>
</div>
```

- Change the theme button to contain `.theme-icon` and `.theme-label`; update the existing theme function to call `GerlachLanguage.t(isDark ? "theme.light" : "theme.dark")`.
- Listen for `languagechange` and rerun only `updateButton()`.
- Load scripts in this order: `portfolio-translations.js`, `language.js`, then the existing inline theme script.

- [ ] **Step 5: Style stable desktop and mobile controls**

Add `.nav-actions`, `.language-switcher`, language button, active, hover and focus styles. Use a stable `44px` height. At `max-width: 680px`, keep `.nav-actions` in grid column 2, hide `.theme-label`, and make `.theme-toggle` a `44px` square while preserving its translated `aria-label`.

- [ ] **Step 6: Run portfolio tests**

Run:

```bash
node --test tests/portfolio-language.test.mjs tests/portfolio-refinements.test.mjs tests/section-headings.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Commit portfolio localization**

```bash
git add index.html style.css portfolio-translations.js tests/portfolio-language.test.mjs tests/portfolio-refinements.test.mjs tests/section-headings.test.mjs
git commit -m "Add bilingual portfolio content"
```

### Task 3: Translate Blade Rhythm Without Resetting Game State

**Files:**
- Create: `blade-rhythm/translations.js`
- Create: `tests/blade-rhythm-language.test.mjs`
- Modify: `blade-rhythm/index.html`
- Modify: `blade-rhythm/game.css`
- Modify: `blade-rhythm/script.js`

- [ ] **Step 1: Write failing Blade Rhythm language tests**

Assert English fallback markup, both flag controls, script order, all eight dynamic keys, calls to `GerlachLanguage.t()`, and absence of `restartGame()` or `gameTick()` inside a `languagechange` listener.

Add a VM test that starts the game, records `player.health`, `difficulty`, `target.health`, and active timer count, dispatches `languagechange`, and confirms those values and the timer count are unchanged.

- [ ] **Step 2: Run the game language tests and verify failure**

Run `node --test tests/blade-rhythm-language.test.mjs`.

Expected: FAIL because Blade Rhythm has no bilingual controls or dictionary.

- [ ] **Step 3: Create the game dictionary**

Create `blade-rhythm/translations.js`:

```js
window.pageTranslations = {
  en: {
    "game.back": "Back to portfolio",
    "game.intro": "Attack when the enemy reaches the green zone, and heal between attacks.",
    "game.statusLabel": "Game status",
    "game.health": "Health",
    "game.enemy": "Enemy",
    "game.difficulty": "Difficulty",
    "game.arenaLabel": "Combat arena",
    "game.playerAlt": "The player's warrior",
    "game.enemyAlt": "Enemy warrior",
    "game.restartHint": "Press R to restart",
    "game.controlsLabel": "Game controls",
    "game.attack": "Attack",
    "game.heal": "Heal",
    "game.restart": "Restart",
    "language.label": "Choose language",
    "game.feedback.enemyHit": "💥 HIT BY ENEMY",
    "game.feedback.tooEarly": "❌ TOO EARLY",
    "game.feedback.perfect": "🔥 PERFECT",
    "game.feedback.hit": "⚔️ HIT",
    "game.feedback.fullHealth": "✨ ALREADY FULL",
    "game.feedback.heal": "✨ HEAL!",
    "game.notification.spawn": "👾 {name} has spawned!",
    "game.notification.comboHeal": "💚 +{amount} HP"
  },
  da: {
    "game.back": "Tilbage til portfolio",
    "game.intro": "Angrib, når fjenden rammer den grønne zone, og helbred dig mellem angrebene.",
    "game.statusLabel": "Spilstatus",
    "game.health": "Liv",
    "game.enemy": "Fjende",
    "game.difficulty": "Sværhedsgrad",
    "game.arenaLabel": "Kamparena",
    "game.playerAlt": "Spillerens kriger",
    "game.enemyAlt": "Fjendtlig kriger",
    "game.restartHint": "Tryk R for at starte igen",
    "game.controlsLabel": "Spilkontroller",
    "game.attack": "Angrib",
    "game.heal": "Helbred",
    "game.restart": "Genstart",
    "language.label": "Vælg sprog",
    "game.feedback.enemyHit": "💥 RAMT AF FJENDEN",
    "game.feedback.tooEarly": "❌ FOR TIDLIGT",
    "game.feedback.perfect": "🔥 PERFEKT",
    "game.feedback.hit": "⚔️ TRÆFFER",
    "game.feedback.fullHealth": "✨ ALLEREDE FULDT LIV",
    "game.feedback.heal": "✨ HELBRED!",
    "game.notification.spawn": "👾 {name} er dukket op!",
    "game.notification.comboHeal": "💚 +{amount} HP"
  }
};
```

- [ ] **Step 4: Add game translation hooks and toolbar**

- Set `<html lang="en">` and English fallback content.
- Add `.game-toolbar` containing the back link and the exact `🇬🇧 EN | 🇩🇰 DA` switcher.
- Add static `data-i18n` and `data-i18n-attr` hooks.
- Load `translations.js`, `../language.js`, then `script.js`.
- Style the toolbar and switcher without changing arena or control dimensions.

- [ ] **Step 5: Replace only dynamic user-facing strings**

Replace literals with calls such as:

```js
showFeedback(GerlachLanguage.t("game.feedback.tooEarly"));
showNotification(GerlachLanguage.t("game.notification.spawn", { name: target.name }));
showNotification(GerlachLanguage.t("game.notification.comboHeal", { amount: comboHeal }));
```

Do not add a `languagechange` listener to the game loop. The current language is read when each new message is created.

- [ ] **Step 6: Run all Blade Rhythm tests**

Run:

```bash
node --test tests/blade-rhythm-*.test.mjs tests/language-engine.test.mjs
```

Expected: existing gameplay tests and new language tests pass.

- [ ] **Step 7: Commit game localization**

```bash
git add blade-rhythm/index.html blade-rhythm/game.css blade-rhythm/script.js blade-rhythm/translations.js tests/blade-rhythm-language.test.mjs
git commit -m "Add bilingual Blade Rhythm interface"
```

### Task 4: Full Verification And Review Branch

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run automated verification**

```bash
node --test tests/*.test.mjs
node --check language.js
node --check portfolio-translations.js
node --check blade-rhythm/translations.js
node --check blade-rhythm/script.js
git diff --check
```

Expected: all tests pass and all syntax/diff checks exit `0`.

- [ ] **Step 2: Browser-test portfolio**

At `1440px`, `430px`, `390 x 844`, and `320px` verify:

- English appears on first visit after clearing `gerlach-language`.
- `🇩🇰 DA` changes all visible text, metadata, `html lang`, alt text, ARIA labels and theme label without reload.
- `🇬🇧 EN` restores English.
- Language choice survives reload and navigation to Blade Rhythm.
- Dark/light mode remains unchanged when switching language.
- No overflow, clipping, layout shift, console errors or missing-key warnings.

- [ ] **Step 3: Browser-test Blade Rhythm**

Verify both languages, static labels and all dynamic messages. Switch language during combat and confirm current health, enemy health, difficulty, enemy position and timer behavior continue unchanged.

- [ ] **Step 4: Run final verification after browser QA**

Repeat the commands from Task 4 Step 1 and confirm `git status --short` is clean.

- [ ] **Step 5: Push and create a ready pull request for review**

```bash
git push -u origin codex/bilingual-portfolio
```

Create a ready PR titled `[codex] Add bilingual portfolio and Blade Rhythm`. Do not merge until the English and Danish copy has been reviewed in the browser.
