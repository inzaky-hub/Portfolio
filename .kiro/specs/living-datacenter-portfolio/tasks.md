# Implementation Plan: Living Datacenter Portfolio

## Overview

Build a single-page React/Vite/TypeScript portfolio application that blends a book metaphor with a datacenter/SOC terminal aesthetic. All personal content is driven by `profil.json`. The implementation follows a strict bottom-up order: pure utilities first, then static components, then animations, then integration layers (Echo Center, i18n, QuickRead), then tests, and finally deployment configuration.

## Tasks

- [x] 1. Project scaffolding and tooling setup
  - [x] 1.1 Initialise Vite + React + TypeScript project, install all dependencies
    - Run `npm create vite@latest . -- --template react-ts`
    - Install: `tailwindcss@3`, `postcss`, `autoprefixer`, `gsap`, `@gsap/react`, `react-router-dom@6`
    - Install dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check`
    - Initialise Tailwind (`npx tailwindcss init -p`); configure `content` paths in `tailwind.config.js`
    - Add `globals: true`, `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']` to `vitest.config.ts`
    - Create `src/test/setup.ts` with `@testing-library/jest-dom` import and stubs for `IntersectionObserver`, `matchMedia`, and GSAP
    - _Implements: Req 8, Req 9_

  - [x] 1.2 Create the full `src/` directory structure and placeholder index files
    - Create directories: `components/EchoCenter`, `components/QuickReadToggle`, `components/LanguageToggle`, `components/ServerRackViz`, `components/SkillRackCard`, `components/ProjectCard`, `components/BookCover`
    - Create directories: `pages/Cover`, `pages/Architect`, `pages/Superpowers`, `pages/Missions`, `pages/AskInza`
    - Create directories: `context`, `hooks`, `utils`, `i18n`, `types`
    - Place a `index.tsx` stub (exports empty component) in each `components/` and `pages/` directory
    - _Implements: Req 1_

- [x] 2. Data layer — types, validation, and data hook
  - [x] 2.1 Define TypeScript type definitions in `src/types/profile.ts`
    - Implement all interfaces from design: `BilingualString`, `SkillItem`, `SkillCategory`, `ProjectMetrics`, `Project`, `ChatResponse`, `ProfileData`, `ProfileValidationError`
    - _Implements: Req 1.5_

  - [x] 2.2 Implement `src/utils/profileValidator.ts`
    - Validate `name` (string, 1–100 chars), `role` (BilingualString, each 1–100), `biography` (BilingualString, each 1–2000), `skills` (array, min 1), `projects` (array, min 1), `chatResponses` (object, min 1 key)
    - Return `ProfileValidationError[]`; each error names the exact offending field
    - _Implements: Req 1.5_

  - [x] 2.3 Implement `src/hooks/useProfileData.ts`
    - `fetch('/profil.json')` on mount → `JSON.parse()` → run `profileValidator`
    - Expose `{ data: ProfileData | null, error: ProfileValidationError | null, loading: boolean }`
    - On network error or parse error emit `profileError`; on validation error emit per-field errors
    - _Implements: Req 1.1, Req 1.2, Req 1.5_

  - [x] 2.4 Copy `profil.json` into `public/profil.json` (already present; verify it matches `ProfileData` types)
    - _Implements: Req 1.3, Req 1.4_

- [x] 3. i18n foundation
  - [x] 3.1 Implement `src/i18n/ui.ts` with all static UI strings
    - Define `UIStringKey` union type covering all nav, error, echo, quickread, tooltip, and lang keys listed in design
    - Populate `UI_STRINGS: Record<UIStringKey, BilingualString>` with FR and EN values for every key
    - _Implements: Req 12.5, Req 12.7_

  - [x] 3.2 Implement `src/hooks/useTranslation.ts`
    - `t(key: UIStringKey)` reads `UI_STRINGS[key][language]` — TypeScript compile-time error if key invalid
    - `tField(field: BilingualString)` returns `field[language]`
    - Reads `language` from `AppContext` (accept a direct `language` param until AppContext is wired)
    - _Implements: Req 12.2, Req 12.5_

- [x] 4. AppContext and application shell
  - [x] 4.1 Implement `src/context/AppContext.tsx`
    - Define `AppState` interface (from design: `profileData`, `profileError`, `language`, `setLanguage`, `quickReadMode`, `toggleQuickReadMode`, `savedScrollOffset`, `echoCollapsed`, `toggleEchoCollapsed`, `echoHistory`, `pushEchoCommand`)
    - `AppProvider` calls `useProfileData()`, reads `localStorage.getItem('lang')` (default `'fr'`), reads `sessionStorage` for `echoCollapsed` and `echoHistory`
    - `setLanguage` writes to `localStorage`
    - `toggleQuickReadMode` saves `window.scrollY` when activating; restores it on deactivation
    - `pushEchoCommand` implements the bounded FIFO queue (max 10), writes to `sessionStorage`
    - _Implements: Req 1.1, Req 7.6, Req 11.6, Req 11.8, Req 12.3, Req 12.4_

  - [x] 4.2 Implement `src/App.tsx` routing shell and `src/main.tsx` entry point
    - Wrap app in `AppProvider` and `BrowserRouter`
    - Define routes: `/` → Cover, `/architect` → Architect, `/superpowers` → Superpowers, `/missions` → Missions, `/ask` → AskInza
    - Mount `Header`, `QuickReadToggle`, and `EchoCenter` as persistent layout siblings to `<Outlet>`
    - Show full-page error UI when `profileData === null && profileError !== null` (network/parse failure)
    - _Implements: Req 1.2, Req 7.1, Req 11.1_

- [x] 5. QuickReadToggle component
  - [x] 5.1 Implement `src/components/QuickReadToggle/index.tsx`
    - Props: `active`, `onToggle`, `language`
    - Render a fixed-position button labeled "Lecture Rapide / Quick Read"
    - Apply distinct background color and checkmark/icon in the active state (vs inactive)
    - Keyboard accessible: focusable via Tab, activatable via Enter/Space; visible focus indicator
    - _Implements: Req 7.1, Req 7.5_

- [x] 6. Cover page — static BookCover component
  - [x] 6.1 Implement `src/components/BookCover/index.tsx` (static, no animation)
    - Props: `name`, `tagline`, `onEnter`, `reducedMotion`
    - Render book element with CSS 3D perspective styles; front cover positioned at -180° Y (static open state)
    - Render owner name and CTA button at full opacity
    - CTA click calls `onEnter`; focusable via Tab, activatable via Enter
    - Reserve layout dimensions in CSS (min-height for book container) to prevent CLS
    - Responsive: scale from 320px to 2560px; min-height 180px at 320px viewport
    - _Implements: Req 2.2, Req 2.3, Req 2.4, Req 2.5, Req 2.6_

  - [x] 6.2 Implement `src/pages/Cover/index.tsx`
    - Consume `profileData` from `AppContext`; pass `name`, `tagline` to `BookCover`
    - Pass `onEnter` as `() => navigate('/architect')`
    - Render QuickSummary (name + tagline only) when `quickReadMode` is active
    - Show section fallback UI if `profileData` is null
    - _Implements: Req 2.4, Req 7.2, Req 7.3_

- [x] 7. Architect page — static ServerRackViz component
  - [x] 7.1 Implement `src/components/ServerRackViz/index.tsx` (static, no animation)
    - Props: `units` (1–20 items), `reducedMotion`
    - Render isometric CSS/SVG rack containing individually addressable server unit elements
    - Each unit exposes a `data-unit-id` attribute and hover tooltip (show unit `milestone` or `t('tooltip.noMilestone')`)
    - Tooltip appears within 100ms of hover (CSS transition ≤ 80ms + JS 20ms overhead)
    - Reserve final layout dimensions before animation to prevent CLS
    - _Implements: Req 3.2, Req 3.4_

  - [x] 7.2 Implement `src/pages/Architect/index.tsx`
    - Consume `profileData` from `AppContext`; derive `ServerUnit[]` from biography/role milestones
    - Render biography text (`name`, `role`, `biography`) resolved to current language
    - Layout: side-by-side at ≥ 768px, stacked at < 768px (Tailwind `md:` prefix)
    - Show fallback when `profileData` is null (static placeholder rack + error message)
    - Render QuickSummary (3 career facts) when `quickReadMode` is active
    - _Implements: Req 3.1, Req 3.5, Req 3.6, Req 7.3_

- [x] 8. Superpowers page — static SkillRackCard component
  - [x] 8.1 Implement `src/components/SkillRackCard/index.tsx` (static, no animation)
    - Props: `category`, `items`, `reducedMotion`
    - Render server-rack-styled card; collapsed by default
    - Click toggles collapsed ↔ expanded state with 300ms CSS max-height transition
    - Expanded state shows skill `name` and `level` for each item (resolved to current language)
    - Visually distinct expanded vs collapsed states
    - Reserve card dimensions (min-height/min-width) before GSAP targets this component
    - _Implements: Req 4.4, Req 4.5_

  - [x] 8.2 Implement `src/pages/Superpowers/index.tsx`
    - Render one `SkillRackCard` per skill category from `profileData.skills`
    - Layout: 1 col < 640px, 2 cols 640–1023px, 3–4 cols ≥ 1024px (Tailwind `sm:`, `lg:` prefixes)
    - Render QuickSummary (top 5 skills) when `quickReadMode` is active
    - _Implements: Req 4.1, Req 4.6, Req 7.3_

- [x] 9. Missions page — static ProjectCard component
  - [x] 9.1 Implement `src/components/ProjectCard/index.tsx` (static, no animation)
    - Props: `project`, `featured`, `language`, `reducedMotion`
    - Featured card: full available width, distinct background treatment, title ≤ 100 chars, description ≤ 300 chars, up to 10 tech tags ≤ 30 chars each, all links as clickable elements
    - Non-featured card: same fields, standard grid width
    - Hover glow border effect using accent color, CSS transition ≤ 200ms
    - Reserve card min-height in CSS to prevent CLS from GSAP translate
    - _Implements: Req 5.2, Req 5.5_

  - [x] 9.2 Implement `src/pages/Missions/index.tsx`
    - Render featured project card (full-width) first, then non-featured grid below
    - Grid: ≥ 2 cols at ≥ 640px, 1 col at < 640px (Tailwind `sm:` prefix)
    - If no non-featured projects: render only the featured card, no grid section
    - Render QuickSummary (2 projects) when `quickReadMode` is active
    - _Implements: Req 5.1, Req 5.3, Req 5.6, Req 5.7, Req 7.3_

- [x] 10. AskInza page — Terminal, chatMatcher, and command history
  - [x] 10.1 Implement `src/utils/chatMatcher.ts`
    - `matchQuery(query: string, chatResponses: Record<string, ChatResponse>): ChatResponse | null`
    - Normalise query to `trim().toLowerCase()`; iterate entries; return first entry whose keywords include a case-insensitive substring match; return `null` if none found
    - Pure function with no side effects
    - _Implements: Req 6.2_

  - [x] 10.2 Implement `src/pages/AskInza/index.tsx` with Terminal UI
    - Dark background (luminance < 20%), monospace font, green or amber accent text
    - `ConversationHistory` subcomponent: scrollable list of query/response pairs for the session
    - `TerminalInput` subcomponent: text input, submit on Enter; up-arrow cycles history (reverse chronological, clamps at oldest)
    - On non-empty submit: call `matchQuery`; if match → display response with typewriter effect (≤ 1500ms); if no match → show `t('echo.error.unknownCommand')` fallback
    - Empty/whitespace submit: no action, no history entry
    - Session history stored in component state (not sessionStorage); scroll to bottom after each response
    - Operates without external API calls
    - Render QuickSummary (3 suggested questions) when `quickReadMode` is active
    - _Implements: Req 6.1, Req 6.2, Req 6.3, Req 6.4, Req 6.5, Req 6.6, Req 6.7, Req 6.8, Req 7.3_

- [ ] 11. GSAP animations
  - [x] 11.1 Implement `src/hooks/useGSAP.ts`
    - Re-export `@gsap/react`'s `useGSAP` with `ScrollTrigger` pre-registered via `gsap.registerPlugin`
    - Read `prefers-reduced-motion` via `window.matchMedia`; expose it as `reducedMotion: boolean`
    - _Implements: Req 8.1, Req 8.3_

  - [x] 11.2 Add GSAP book-opening animation to `BookCover`
    - On `IntersectionObserver` fire: if `reducedMotion` → set opacity 1 immediately; else → rotate front cover 0° → -180°Y over 800ms (ease `power2.inOut`), then fade name + CTA in over 200ms each
    - Null-check the GSAP target element before calling `gsap.to()`; log warning and skip if missing
    - CLS guaranteed zero: book min-height already reserved from task 6.1
    - _Implements: Req 2.1, Req 2.2, Req 2.3, Req 2.6, Req 8.2, Req 8.3, Req 8.5, Req 8.6, Req 8.7_

  - [x] 11.3 Add GSAP stagger animation to `ServerRackViz`
    - `ScrollTrigger` at `start: "top 80%"`: if `reducedMotion` → opacity 0→1 (300ms); else → each unit `translateY 40px→0`, opacity 0→1, stagger 80ms, duration 400ms (ease `power2.out`)
    - Stagger interval 50–200ms; total ≤ (N × 200ms) + 600ms
    - Null-check each unit element; log warning and skip missing targets
    - _Implements: Req 3.3, Req 8.1, Req 8.2, Req 8.3, Req 8.4, Req 8.7_

  - [x] 11.4 Add GSAP scale-in animation to `SkillRackCard`
    - `IntersectionObserver` at threshold 0.1: if `reducedMotion` → opacity 0→1 (300ms); else → scale 0.8→1.0, opacity 0→1 (400ms, ease `power2.out`); trigger once per card per page load
    - On hover: reveal each skill item with 200ms fade, 80ms stagger between items
    - Null-check card element; log warning and skip if missing
    - _Implements: Req 4.2, Req 4.3, Req 8.1, Req 8.2, Req 8.3, Req 8.4, Req 8.7_

  - [x] 11.5 Add GSAP fade+translate animation to `ProjectCard`
    - `ScrollTrigger` at `start: "top 90%"`: if `reducedMotion` → opacity 0→1 (300ms); else → opacity 0→1, `translateY 30px→0` (600ms, ease `power2.out`)
    - CLS guaranteed zero: card min-height already reserved; translateY uses CSS transform (no layout shift)
    - Null-check card element; log warning and skip if missing
    - _Implements: Req 5.4, Req 8.1, Req 8.2, Req 8.3, Req 8.4, Req 8.5, Req 8.7_

- [ ] 12. Echo Center — commandParser, component, and navigation integration
  - [ ] 12.1 Implement `src/utils/commandParser.ts`
    - `parseCommand(input: string): ParsedCommand` — pure function, no side effects
    - Map exact commands to `ParsedCommand` variants per design: `book`, `rack 1–4`, `ask inza`, `help`, `mode quick` → typed `navigate`/`quickMode`/`help`/`unknown` return values
    - Case-insensitive (`input.trim().toLowerCase()`)
    - _Implements: Req 11.2_

  - [x] 12.2 Implement `src/components/EchoCenter/index.tsx`
    - Props: `collapsed`, `onToggleCollapse`, `history`, `onCommand`, `language`
    - Fixed bottom bar; styled as CLI with monospace font and accent color
    - Collapsed: single-line bar with label "Echo Center"; expanded: shows input field + scrollable command history (last 10)
    - Click bar → toggle collapse; collapsed state already persisted in `AppContext` / `sessionStorage`
    - `EchoCenterInput` subcomponent: text input, submit on Enter; up-arrow cycles history (reverse chronological)
    - On submit: call `onCommand(input)` → receive `ParsedCommand`; execute navigation or `toggleQuickReadMode`; push command to history via `pushEchoCommand`; show help text or error listing available commands for `help`/`unknown` types
    - Tab-focusable, Enter-activatable, visible focus indicators on all interactive elements
    - FR/EN help text and error messages via `useTranslation`; commands remain in English
    - Remains functional when `quickReadMode` is active
    - _Implements: Req 11.1, Req 11.2, Req 11.3, Req 11.4, Req 11.5, Req 11.6, Req 11.7, Req 11.8, Req 11.9, Req 11.10_

- [ ] 13. Language toggle component and full i18n wiring
  - [x] 13.1 Implement `src/components/LanguageToggle/index.tsx`
    - Render FR / EN toggle in the `Header`; fixed and visible on every page
    - Clicking a language calls `setLanguage` from `AppContext` → all text updates within 300ms (no page reload)
    - Visually indicate the active language (distinct style for the active option)
    - Tab-focusable, Enter-activatable, visible focus indicator
    - _Implements: Req 12.1, Req 12.2, Req 12.10_

  - [x] 13.2 Wire language switching across all pages and components
    - Ensure every `tField()` call and `t()` call in all pages and components re-renders when `AppContext.language` changes
    - Verify QuickSummary content updates language within 300ms when `quickReadMode` is active
    - Verify `localStorage` key `'lang'` is written on every `setLanguage` call and read on `AppProvider` init
    - _Implements: Req 12.2, Req 12.3, Req 12.4, Req 12.6, Req 12.9_

- [ ] 14. QuickRead Mode — per-page summaries and scroll offset restoration
  - [x] 14.1 Implement per-page `QuickSummary` content for all five pages
    - Cover: name + tagline (from `profileData`)
    - Architect: 3 career facts (role + 2 biography extracts)
    - Superpowers: top 5 skill names (first 5 items across categories, resolved to current language)
    - Missions: first 2 projects from `profileData.projects` (title + description, current language)
    - AskInza: 3 suggested questions (first 3 keyword sets from `chatResponses`, current language)
    - If fewer items exist than the defined count, display all available items without padding
    - If a page has no QuickSummary, display `t('quickread.noSummary')` fallback
    - _Implements: Req 7.2, Req 7.3, Req 7.7_

  - [x] 14.2 Wire scroll offset preservation in `AppContext.toggleQuickReadMode`
    - On activation: record `window.scrollY` → `savedScrollOffset`
    - On deactivation: `window.scrollTo({ top: savedScrollOffset, behavior: 'instant' })` (within ±10px)
    - Verify `QuickReadToggle` label and active state are correct
    - _Implements: Req 7.4, Req 7.5, Req 7.6_

- [ ] 15. Checkpoint — static build and integration smoke test
  - Verify `npm run build` exits 0 and `dist/` contains `index.html`, `profil.json`, and JS/CSS assets
  - Manually navigate all 5 routes, toggle QuickRead, toggle language, type Echo Center commands, use AskInza terminal
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Property-based tests with fast-check
  - [x] 16.1 Write property test for `profileValidator` (Property 2)
    - Generate `ProfileData` objects with exactly one field missing or violating its constraint
    - Assert validator returns exactly one error naming that field
    - Assert other sections render normally (React Testing Library render with generated data)
    - **Property 2: Profile validation identifies affected field**
    - **Validates: Requirements 1.5**

  - [ ]* 16.2 Write property test for `chatMatcher.matchQuery` (Properties 3 and 6)
    - Generate query strings and `chatResponses` maps; assert match/no-match behaviour per property definition
    - Generate whitespace-only queries; assert `matchQuery` returns null and conversation history is unchanged
    - **Property 3: Chat keyword matching; Property 6: Empty/whitespace query produces no side effects**
    - **Validates: Requirements 6.2, 6.8**

  - [ ]* 16.3 Write property test for `commandParser.parseCommand` (Properties 7 and 11)
    - Generate all defined command strings (exact, upper/lower variants); assert correct `ParsedCommand` type
    - Generate arbitrary non-command strings; assert `{ type: 'unknown' }`
    - Assert result is language-invariant (same output regardless of `AppContext.language`)
    - **Property 7: Echo Center command parser coverage; Property 11: Commands are language-invariant**
    - **Validates: Requirements 11.2, 12.7**

  - [ ]* 16.4 Write property test for Echo Center bounded history queue (Property 8)
    - Generate sequences of N > 10 commands; assert history length is exactly 10 and contains last 10
    - Generate sequences of M ≤ 10 commands; assert history contains exactly those M commands
    - **Property 8: Echo Center bounded command history**
    - **Validates: Requirements 11.6**

  - [ ]* 16.5 Write property test for AskInza conversation history (Properties 4 and 5)
    - Generate sequences of non-empty queries; assert history is append-only, chronological, no omissions
    - Generate non-empty history of length N; assert up-arrow N times cycles all N in reverse order; assert further presses retain oldest
    - **Property 4: AskInza conversation history is append-only; Property 5: Up-arrow history cycling**
    - **Validates: Requirements 6.5, 6.7**

  - [ ]* 16.6 Write property test for language preference round-trip (Property 9)
    - For each value in `{ 'fr', 'en' }`: call `setLanguage`, read `localStorage.getItem('lang')`; assert same value
    - **Property 9: Language preference round-trip**
    - **Validates: Requirements 12.3**

  - [ ]* 16.7 Write property test for `useTranslation().t` completeness (Property 10)
    - For every key in `UIStringKey` union: assert `t(key)` returns non-empty string in both `'fr'` and `'en'`
    - **Property 10: UI string translation completeness**
    - **Validates: Requirements 12.5**

  - [ ]* 16.8 Write property tests for QuickSummary item count bounds (Property 12)
    - Generate `ProfileData` with varying lengths of skills/projects/chatResponses
    - Assert each page's QuickSummary contains `min(available_items, defined_max)` items
    - **Property 12: QuickSummary item count is bounded by availability**
    - **Validates: Requirements 7.3**

  - [ ]* 16.9 Write property tests for QuickReadMode toggle round-trip and SkillRackCard/ProjectCard rendering (Properties 1, 13, 15, 16, 17, 18)
    - Property 1: render each page with generated `ProfileData`; assert displayed text matches `ProfileData` fields in current language
    - Property 13: activate then deactivate QuickReadMode; assert full page content is restored
    - Property 15: render Superpowers with N categories; assert N `SkillRackCard` elements rendered
    - Property 16: expand a `SkillRackCard`; assert all skill names and levels from `ProfileData` are visible
    - Property 17: render Missions with exactly one `featured: true` project; assert it renders first at full width
    - Property 18: render Missions with 1 featured + N−1 non-featured; assert grid contains exactly N−1 cards
    - **Properties 1, 13, 15, 16, 17, 18**
    - **Validates: Requirements 1.4, 4.1, 4.4, 5.1, 5.3, 7.4**

  - [ ]* 16.10 Write property test for scroll offset preservation (Property 14)
    - Mock `window.scrollY`; activate QuickReadMode; deactivate; assert `window.scrollY` restored within ±10px
    - **Property 14: Scroll offset preserved across QuickReadMode toggle**
    - **Validates: Requirements 7.6**

- [ ] 17. Unit and integration tests (Vitest + React Testing Library)
  - [ ] 17.1 Unit tests — data loading and Cover page
    - `profil.json` network failure → full-page error UI displayed (Req 1.2)
    - Book cover CSS 3D class applied on mount (Req 2.2)
    - CTA click navigates to `/architect` (Req 2.4)
    - `prefers-reduced-motion: reduce` → static open-book, no animation (Req 2.6, Req 8.3)
    - _Implements: Req 1.2, Req 2.2, Req 2.4, Req 2.6, Req 8.3_

  - [ ] 17.2 Unit tests — Architect and Superpowers pages
    - Architect biography text rendered (Req 3.1)
    - `ServerRackViz` renders correct number of units (Req 3.2)
    - Hover on unit → tooltip within 100ms; unit with no milestone → generic message (Req 3.4)
    - Layout side-by-side at 768px, stacked at 767px (Req 3.5)
    - `SkillRackCard` collapses on second click (Req 4.5)
    - Layout column count at 639px / 640px / 1024px (Req 4.6, Req 9.x)
    - _Implements: Req 3.1, Req 3.2, Req 3.4, Req 3.5, Req 4.5, Req 4.6_

  - [x] 17.3 Unit tests — Missions and AskInza pages
    - PFE card renders all required fields within character limits (Req 5.2)
    - Hover glow border CSS class applied (Req 5.5)
    - Single-column layout at < 640px (Req 5.6)
    - No non-featured projects → no grid section rendered (Req 5.7)
    - Terminal: dark background + monospace font classes present (Req 6.1)
    - No matching query → fallback message displayed (Req 6.4)
    - _Implements: Req 5.2, Req 5.5, Req 5.6, Req 5.7, Req 6.1, Req 6.4_

  - [x] 17.4 Unit tests — QuickReadMode, EchoCenter, and language toggle
    - QuickReadMode toggle visible without scrolling (Req 7.1)
    - Toggle label text correct (Req 7.5)
    - Page with no QuickSummary → fallback message shown, toggle still visible (Req 7.7)
    - Echo Center renders as fixed bottom bar (Req 11.1)
    - `book` command navigates to Cover (Req 11.3)
    - `rack 1–4` commands navigate to correct pages (Req 11.4)
    - Unknown command → error message listing available commands (Req 11.5)
    - Echo Center collapsed state persists across page navigations (Req 11.8)
    - Echo Center Tab/Enter accessibility (Req 11.9)
    - Echo Center functional while QuickReadMode active (Req 11.10)
    - FR/EN toggle visible in header on all pages (Req 12.1)
    - No language preference in localStorage → defaults to FR (Req 12.4)
    - Language toggle shows active language visually (Req 12.10)
    - _Implements: Req 7.1, Req 7.5, Req 7.7, Req 11.1, Req 11.3, Req 11.4, Req 11.5, Req 11.8, Req 11.9, Req 11.10, Req 12.1, Req 12.4, Req 12.10_

  - [x]* 17.5 Integration tests — animations and language switching
    - Book-opening animation fires within 300ms of intersection (Req 2.1) — mock `IntersectionObserver`
    - ServerRack stagger interval 50–200ms per unit (Req 3.3) — mock GSAP
    - SkillRackCard scale animation fires once per page load (Req 4.2) — mock `IntersectionObserver`
    - Hover skill reveal uses 80ms stagger (Req 4.3) — mock GSAP
    - ProjectCard GSAP fade + translateY completes ≤ 600ms (Req 5.4) — mock GSAP + `ScrollTrigger`
    - Typewriter effect completes ≤ 1500ms (Req 6.3)
    - Language switch updates all text within 300ms (Req 12.2)
    - Language switch while QuickReadMode active updates QuickSummary (Req 12.9)
    - _Implements: Req 2.1, Req 3.3, Req 4.2, Req 4.3, Req 5.4, Req 6.3, Req 12.2, Req 12.9_

- [ ] 18. AWS Amplify deployment configuration
  - [ ] 18.1 Create `public/amplify.yml` with Vite build specification
    - `preBuild`: `npm ci`; `build`: `npm run build`; `artifacts.baseDirectory`: `dist`; cache `node_modules`
    - Verify file is located in `public/` so it appears in `dist/` output
    - _Implements: Req 10.1_

  - [ ] 18.2 Document SPA rewrite rule and Amplify Console configuration
    - Add a `DEPLOYMENT.md` comment (or inline code comment in `amplify.yml`) describing the rewrite rule: source pattern, target `index.html`, status 200 (Rewrite)
    - Document build timeout: 15 minutes in Amplify Console → App settings → Build settings
    - _Implements: Req 10.3, Req 10.6_

  - [ ]* 18.3 Verify build and smoke test the deployment configuration
    - Run `npm run build` locally; assert exit code 0 and `dist/amplify.yml` and `dist/profil.json` present
    - Assert `dist/index.html` exists and is non-empty
    - _Implements: Req 10.1, Req 10.4_

- [ ] 19. Final checkpoint — full test suite and build verification
  - Run `npm run build` and assert exit 0
  - Run `npx vitest --run` and assert all non-optional tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; the core implementation is complete without them
- Pure utility functions (`chatMatcher`, `profileValidator`, `commandParser`) are implemented before the components that consume them, enabling property tests to run against them in isolation
- GSAP animations (tasks 11.x) are strictly layered on top of already-working static components (tasks 6–9), so any animation failure leaves the static fallback functional
- The Echo Center (task 12) is built after all five navigation targets exist (tasks 6–10), preventing broken navigation commands
- All React component tests use the stubs defined in `src/test/setup.ts` for `IntersectionObserver`, `matchMedia`, and GSAP
- `amplify.yml` lives in `public/` so Vite copies it verbatim into `dist/`; the SPA rewrite rule must be configured in the Amplify Console (not in `amplify.yml`) because Amplify reads rewrite rules from the Console or from `customRules` in `amplify.yml` under `frontend.customHeaders`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "3.1"] },
    { "id": 4, "tasks": ["3.2", "4.1"] },
    { "id": 5, "tasks": ["4.2", "5.1"] },
    { "id": 6, "tasks": ["6.1", "7.1", "8.1", "9.1", "10.1"] },
    { "id": 7, "tasks": ["6.2", "7.2", "8.2", "9.2", "10.2"] },
    { "id": 8, "tasks": ["11.1"] },
    { "id": 9, "tasks": ["11.2", "11.3", "11.4", "11.5"] },
    { "id": 10, "tasks": ["12.1"] },
    { "id": 11, "tasks": ["12.2", "13.1"] },
    { "id": 12, "tasks": ["13.2", "14.1"] },
    { "id": 13, "tasks": ["14.2"] },
    { "id": 14, "tasks": ["16.1", "17.1", "17.2", "17.3", "17.4", "18.1"] },
    { "id": 15, "tasks": ["16.2", "16.3", "16.4", "16.5", "16.6", "16.7", "16.8", "16.9", "16.10", "17.5", "18.2"] },
    { "id": 16, "tasks": ["18.3"] }
  ]
}
```
