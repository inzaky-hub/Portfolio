# Requirements Document

## Introduction

The Living Datacenter is a portfolio website for the AWS Student Builder Challenge. It merges two metaphors: a **book** (representing a life journey) and a **datacenter / SOC environment** (representing a SOC/SysAdmin career aesthetic). The site is built with React + Vite + TypeScript + Tailwind CSS + GSAP, deployed on AWS Amplify, and driven by a single `profil.json` data file so all personal content can be updated without touching source code.

The portfolio consists of five pages: Cover, Architect, Superpowers, Missions, and AskInza.

---

## Glossary

- **App**: The complete React/Vite/TypeScript single-page application.
- **ProfileData**: The parsed contents of `profil.json` — the single source of truth for all personal content.
- **Cover_Page**: The first page; features a 3D CSS book opening as the entry animation.
- **Architect_Page**: The About Me page; displays biography alongside an isometric server rack visualization.
- **Superpowers_Page**: The Skills page; renders skills as interactive, animated server rack cards.
- **Missions_Page**: The Projects page; showcases projects with the PFE cryptojacking detection project featured.
- **AskInza_Page**: The chatbot page; provides a terminal-style Q&A interface powered entirely by `profil.json`.
- **QuickReadMode**: A globally accessible toggle that replaces full page content with a condensed key-info summary.
- **GSAP_Animator**: The GSAP-based animation layer applied throughout the App.
- **Amplify_Pipeline**: The AWS Amplify continuous-deployment configuration connecting the repository to production hosting.
- **Terminal**: The AskInza chat interface styled to look like a command-line terminal.
- **PFE_Project**: The featured final-year project on cryptojacking detection displayed in Missions_Page.
- **ServerRack_Viz**: The isometric server rack visualization rendered on the Architect_Page.
- **SkillRack_Card**: An interactive server rack card displayed on the Superpowers_Page representing one skill category.
- **QuickSummary**: The condensed representation of a page rendered when QuickReadMode is active.

---

## Requirements

### Requirement 1: Data-Driven Content via profil.json

**User Story:** As a site owner, I want all personal content stored in a single `profil.json` file, so that I can update my information without modifying source code.

#### Acceptance Criteria

1. THE App SHALL load `profil.json` at startup and parse it into a ProfileData object before rendering any page content.
2. IF `profil.json` fails to load due to a network error or file-not-found condition, THEN THE App SHALL display a full-page fallback error message stating the content is unavailable, and SHALL NOT render any profile-dependent page sections.
3. THE App SHALL derive all biography text, skill entries, project entries, and AskInza Q&A pairs exclusively from ProfileData, with no hardcoded fallback values substituted for missing content.
4. WHEN ProfileData is updated and the page is reloaded (a full browser page load), THE App SHALL reflect the updated content without requiring source-code changes or a project rebuild.
5. THE App SHALL validate that ProfileData contains the following required fields: `name` (string, 1–100 chars), `biography` (string, 1–2000 chars), `skills` (array, min 1 item), `projects` (array, min 1 item), and `chatResponses` (object, min 1 key); IF any required field is missing or fails its type/length constraint, THEN THE App SHALL log a descriptive error identifying the offending field name and SHALL render a fallback UI for only the affected section, leaving all other sections unaffected.

---

### Requirement 2: Cover Page — 3D Book Entry Animation

**User Story:** As a visitor, I want to see a 3D book open as the entry animation, so that I immediately experience the book metaphor and feel drawn into the portfolio.

#### Acceptance Criteria

1. WHEN the Cover_Page's root element first intersects the viewport, THE GSAP_Animator SHALL trigger the 3D CSS book-opening animation within 300ms of that intersection event.
2. THE Cover_Page SHALL render the book using CSS 3D transforms where the front cover rotates from 0° to -180° on the Y-axis with a perspective value applied to simulate a realistic page-turn.
3. WHEN the book-opening animation reaches 100% of its total duration, THE Cover_Page SHALL transition the owner's name and the call-to-action element from opacity 0 to opacity 1 within 200ms.
4. WHEN a visitor activates the enter call-to-action, THE App SHALL navigate to the Architect_Page.
5. THE Cover_Page SHALL be fully responsive: the 3D book SHALL scale proportionally on screen widths from 320px to 2560px, with a minimum rendered height of 180px at a 320px viewport width.
6. WHERE the visitor's device has `prefers-reduced-motion` set to `reduce`, THE Cover_Page SHALL skip the 3D animation and display the static open-book state with the owner's name and call-to-action at full opacity immediately.

---

### Requirement 3: Architect Page — About Me with Isometric Server Rack

**User Story:** As a visitor, I want to read a biography alongside an isometric datacenter visualization, so that I understand who the portfolio owner is within the datacenter aesthetic.

#### Acceptance Criteria

1. THE Architect_Page SHALL render biography text sourced from ProfileData fields: `name` (1–100 chars), `role` (1–100 chars), and `biography` (1–2000 chars).
2. THE Architect_Page SHALL render the ServerRack_Viz as an isometric illustration constructed from CSS or SVG, containing between 1 and 20 individually addressable server units.
3. WHEN the Architect_Page enters the viewport, THE GSAP_Animator SHALL animate each server unit in ServerRack_Viz sliding into place sequentially; the stagger interval between units SHALL be no less than 50ms and no greater than 200ms, and the total animation sequence SHALL complete within (number_of_units × 200ms) + 600ms.
4. WHEN a visitor hovers over a server unit in ServerRack_Viz, THE Architect_Page SHALL highlight the unit and display a tooltip within 100ms; IF the unit has no corresponding career milestone in ProfileData, THEN THE Architect_Page SHALL display a generic "No milestone linked" tooltip message.
5. THE Architect_Page SHALL lay out biography text and ServerRack_Viz side-by-side on screen widths ≥ 768px, and stack them vertically on screen widths < 768px.
6. IF ProfileData fails to load, THEN THE Architect_Page SHALL render a fallback state displaying a static placeholder rack and an error message instead of biography content.

---

### Requirement 4: Superpowers Page — Interactive Skill Racks

**User Story:** As a visitor, I want to explore my skills displayed as interactive server racks, so that the datacenter metaphor extends to technical competencies.

#### Acceptance Criteria

1. THE Superpowers_Page SHALL render one SkillRack_Card per skill category defined in ProfileData.
2. WHEN a SkillRack_Card becomes at least 10% visible in the viewport, THE GSAP_Animator SHALL animate it scaling from 0.8 to 1.0 with an ease-out curve over 400ms, triggering this animation only once per card per page load.
3. WHEN a visitor hovers over a SkillRack_Card, THE Superpowers_Page SHALL reveal each individual skill item within the card sequentially with a per-item fade-in duration of 200ms and a stagger interval of 80ms between items.
4. WHEN a visitor clicks a collapsed SkillRack_Card, THE Superpowers_Page SHALL expand the card over 300ms to display the skill name and proficiency level for each skill item sourced from ProfileData, and SHALL visually distinguish the expanded state from the collapsed state.
5. WHEN a visitor clicks an expanded SkillRack_Card, THE Superpowers_Page SHALL collapse it to its default state over 300ms.
6. THE Superpowers_Page SHALL be responsive: SkillRack_Cards SHALL display in a single column on widths less than 640px, two columns on widths 640px–1023px, and three to four columns on widths of 1024px or greater.

---

### Requirement 5: Missions Page — Projects Showcase with Featured PFE

**User Story:** As a visitor, I want to browse projects with the PFE cryptojacking detection project highlighted, so that I can quickly identify the most significant work.

#### Acceptance Criteria

1. THE Missions_Page SHALL render all projects sourced from ProfileData, with PFE_Project displayed in a visually distinct featured position at the top of the page, where "visually distinct" means the PFE_Project card occupies full available width and uses a different background treatment than non-featured cards.
2. THE PFE_Project card SHALL display a title of no more than 100 characters, a description of no more than 300 characters, up to 10 technology tags each no more than 30 characters, and all links defined in ProfileData as clickable elements.
3. THE Missions_Page SHALL render non-featured projects in a grid below the PFE_Project card, with each card displaying the same fields as defined in criterion 2.
4. WHEN a project card enters the viewport, THE GSAP_Animator SHALL animate it fading in from opacity 0 to opacity 1 and translating upward by 30px, with the animation completing within 600ms.
5. WHEN a visitor hovers over a project card, THE Missions_Page SHALL apply a glowing border effect using the datacenter aesthetic accent color defined in the design theme, with the glow transition completing within 200ms.
6. THE Missions_Page SHALL be responsive: the project grid SHALL display 2 or more columns on screen widths ≥ 640px and SHALL switch to a single-column layout on screen widths < 640px.
7. IF ProfileData contains no projects other than PFE_Project, THEN THE Missions_Page SHALL render only the PFE_Project featured card with no grid section below it.

---

### Requirement 6: AskInza Page — Local Terminal Chatbot

**User Story:** As a visitor, I want to ask questions about the portfolio owner in a terminal-style interface, so that exploring the portfolio feels like querying a system without relying on any external API.

#### Acceptance Criteria

1. THE AskInza_Page SHALL render the Terminal with: (a) a dark background (luminance < 20% of full white), (b) a monospaced font applied to all Terminal text, and (c) accent text in either green (#00FF00 ± 10% hue tolerance) or amber (#FFBF00 ± 10% hue tolerance).
2. WHEN a visitor submits a non-empty query in the Terminal, THE AskInza_Page SHALL match the query against chatResponses in ProfileData using case-insensitive keyword matching, where a match occurs when at least one keyword from a chatResponses entry is found as a substring within the submitted query text.
3. WHEN a matching response is found, THE AskInza_Page SHALL display the response with a simulated typewriter effect completing within 1500ms.
4. IF no matching response is found, THEN THE AskInza_Page SHALL display a predefined fallback message indicating the question is not in the knowledge base.
5. THE AskInza_Page SHALL maintain a scrollable conversation history within the Terminal for the duration of the browser session tab.
6. THE AskInza_Page SHALL operate entirely without external API calls; all responses SHALL be derived solely from ProfileData.
7. WHEN the visitor presses the up-arrow key in the Terminal input, THE AskInza_Page SHALL recall the previous query in the current session; repeated presses SHALL cycle through earlier queries in reverse chronological order; when the oldest entry is reached, further up-arrow presses SHALL retain that entry without change.
8. IF a visitor submits an empty or whitespace-only query, THEN THE AskInza_Page SHALL take no action: no history entry SHALL be added and no response SHALL be displayed.

---

### Requirement 7: Quick-Read Mode (Mode Lecture Rapide)

**User Story:** As a visitor who wants a fast overview, I want to toggle a quick-read mode, so that I can scan key information without reading the full page content.

#### Acceptance Criteria

1. THE App SHALL display a QuickReadMode toggle control in a fixed position in the viewport so that it remains visible without scrolling, regardless of the visitor's scroll depth or current page.
2. WHEN a visitor activates QuickReadMode, THE App SHALL replace each page's full content with its corresponding QuickSummary within 300ms.
3. THE QuickSummary for each page SHALL contain only the following items: name and tagline (Cover), three key career facts (Architect), top five skills (Superpowers), two featured projects (Missions), and three suggested questions (AskInza); if fewer items exist than the defined count for a section, THE App SHALL display all available items for that section without padding or placeholder entries.
4. WHEN a visitor deactivates QuickReadMode, THE App SHALL restore the full page content within 300ms.
5. THE QuickReadMode toggle SHALL display the label "Lecture Rapide / Quick Read" and SHALL have a visually distinct active state — indicated by a change in background color and an icon or checkmark — that differs from its inactive state.
6. WHILE QuickReadMode is active, THE App SHALL preserve the visitor's scroll offset in pixels so that, upon deactivation, the page returns to within 10 pixels of the scroll position held at the moment of activation.
7. IF a page has no QuickSummary defined, THEN THE App SHALL display a fallback message indicating that a summary is not available for that page, without hiding or altering the toggle control.

---

### Requirement 8: GSAP Animations — Global Standards

**User Story:** As a visitor, I want smooth, immersive animations throughout the site, so that the portfolio feels alive and polished.

#### Acceptance Criteria

1. THE GSAP_Animator SHALL use ScrollTrigger to initiate animations only when elements enter the viewport, not on initial load for off-screen content.
2. WHEN an entrance animation starts, THE GSAP_Animator SHALL complete it within 1200ms.
3. WHERE the visitor's device has `prefers-reduced-motion` set to `reduce`, THE GSAP_Animator SHALL disable all motion animations and use opacity-only transitions with a maximum duration of 300ms instead.
4. THE GSAP_Animator SHALL apply consistent easing (ease-out or power2.out) across all scroll-triggered animations for visual coherence.
5. THE GSAP_Animator SHALL not degrade Core Web Vitals: Cumulative Layout Shift (CLS) SHALL remain below 0.1 during animation playback.
6. BEFORE any animated element begins its animation, THE App SHALL reserve the element's final layout dimensions in the DOM so that no layout shift occurs when the animation starts.
7. IF a ScrollTrigger targets an element that is not present in the DOM at the time of initialization, THEN THE GSAP_Animator SHALL log a warning and skip that animation without throwing an error or interrupting other animations.

---

### Requirement 9: Responsive Design

**User Story:** As a visitor on any device, I want the portfolio to render correctly, so that I can view it on mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE App SHALL render correctly at viewport widths of 320px, 768px, 1024px, and 1440px, where "render correctly" means no text is truncated, no elements extend outside the viewport boundary, and no content blocks overlap unintentionally.
2. THE App SHALL use Tailwind CSS responsive prefixes with the following pixel thresholds: `sm` (≥ 640px), `md` (≥ 768px), `lg` (≥ 1024px), `xl` (≥ 1280px) to control layout breakpoints.
3. THE App SHALL not produce horizontal scroll at any viewport width between 320px and 1440px inclusive.
4. WHEN the viewport width changes, THE App SHALL reflow layouts within 100ms without requiring a page reload.
5. THE App SHALL constrain all images and media elements so that their rendered width never exceeds their parent container's width at any supported viewport size.
6. THE App SHALL render all navigational and content elements in a single-column stacked layout on viewport widths between 320px and 639px.

---

### Requirement 10: AWS Amplify Deployment Pipeline

**User Story:** As the site owner, I want the portfolio automatically deployed to AWS Amplify on every push to the main branch, so that updates are live without manual steps.

#### Acceptance Criteria

1. THE Amplify_Pipeline SHALL include an `amplify.yml` build specification that installs dependencies, builds the Vite project, and outputs the `dist` directory as the artifact base directory.
2. WHEN a commit is pushed to the main branch, THE Amplify_Pipeline SHALL trigger an automatic build and deployment within 10 minutes of the push event.
3. THE Amplify_Pipeline SHALL serve the application as a single-page app by configuring a rewrite rule that maps all non-asset paths to `index.html` with a 200 status code.
4. IF `npm run build` exits with a non-zero code, THEN THE Amplify_Pipeline SHALL halt the deployment and report the build as failed without updating the live environment.
5. THE App SHALL be accessible over HTTPS via the Amplify-provided domain within 5 minutes of a successful deployment, returning an HTTP 200 response on the root path.
6. IF the Amplify_Pipeline build exceeds 15 minutes, THEN THE Amplify_Pipeline SHALL cancel the build and mark the deployment as failed.

### Requirement 11: Book ↔ Datacenter Mode Switching (Echo Center)

**User Story:** As a visitor, I want to switch between the book view (life journey) and the datacenter view (professional environment) via a terminal, so that the portfolio tells a dual story: the person and the engineer.

#### Acceptance Criteria

1. THE App SHALL render a persistent terminal control fixed at the bottom of every page, labeled "Echo Center", styled as a command-line interface with a monospaced font and an accent color (green or amber).
2. THE Echo Center SHALL accept the following commands: `book` (switch to book view), `rack <number>` (open the corresponding datacenter rack/page), `ask inza` (navigate to AskInza_Page), `help` (list available commands), and `mode quick` (toggle QuickReadMode).
3. WHEN a visitor types `book`, THE App SHALL navigate to the Cover_Page and set the global view mode to "book".
4. WHEN a visitor types `rack 1`, `rack 2`, `rack 3`, or `rack 4`, THE App SHALL navigate respectively to Architect_Page, Superpowers_Page, Missions_Page, or AskInza_Page, and set the global view mode to "datacenter".
5. WHEN a visitor types an unrecognized command, THE Echo Center SHALL display an error message listing the available commands.
6. THE Echo Center SHALL maintain a scrollable command history of the last 10 commands entered during the browser session tab.
7. WHEN the visitor presses the up-arrow key in the Echo Center input, THE Echo Center SHALL recall the previous command; repeated presses SHALL cycle through earlier commands in reverse chronological order.
8. THE Echo Center SHALL be collapsible (minimized to a single-line bar) and expanded by clicking on the bar; the collapsed state SHALL persist across page navigations within the same browser tab.
9. THE Echo Center SHALL be accessible: focusable via Tab key, commands submitted via Enter key, and all interactive elements SHALL have visible focus indicators.
10. WHILE QuickReadMode is active, THE Echo Center SHALL remain functional and SHALL NOT be hidden or disabled.

### Requirement 12: Bilingual Support (Français / English)

**User Story:** As a visitor, I want to switch the site language between French and English, so that I can read the portfolio in my preferred language regardless of where I am.

#### Acceptance Criteria

1. THE App SHALL display a language toggle control (FR / EN) in the header, fixed and visible on every page.
2. WHEN a visitor selects a language, THE App SHALL update all visible text content on the current page within 300ms, without requiring a page reload.
3. THE App SHALL store the visitor's language preference in localStorage, so that the preference persists across browser sessions.
4. IF no language preference is stored, THE App SHALL default to French (FR).
5. THE App SHALL source all translatable text from a translation layer, where each text string has both a French and an English version.
6. THE `profil.json` SHALL include bilingual fields for: `biography`, `skills[].category`, `skills[].items[].name`, `projects[].title`, `projects[].description`, and `chatResponses[].response`.
7. THE Echo Center commands (Requirement 11) SHALL remain in English (as is standard for terminal interfaces), but help text and error messages SHALL be bilingual.
8. THE QuickReadMode toggle label SHALL display "Lecture Rapide / Quick Read" in both languages (as specified in Requirement 7).
9. WHEN a visitor switches language while QuickReadMode is active, THE App SHALL update the QuickSummary content to the selected language within 300ms.
10. THE language toggle SHALL be accessible: focusable via Tab key, with visible focus indicator, and SHALL indicate the currently active language visually.