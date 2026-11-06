# Design Document — Living Datacenter Portfolio

## Overview

The Living Datacenter Portfolio is a single-page React/Vite/TypeScript application that blends two metaphors: a **book** (life journey) and a **datacenter / SOC terminal** (professional identity). Visitors navigate five pages — Cover, Architect, Superpowers, Missions, and AskInza — through either standard React Router navigation or the persistent Echo Center terminal bar at the bottom of every page.

All personal content is sourced from a single `profil.json` file fetched at startup. The app is bilingual (FR/EN), supports a Quick-Read mode that collapses each page to a key-info summary, and is deployed on AWS Amplify with automatic CI/CD.

Key design goals:

- **Zero hardcoded content** — every personal string comes from `profil.json`
- **Datacenter aesthetic** — dark background, green/amber accents, monospaced fonts, isometric racks
- **Progressive enhancement** — `prefers-reduced-motion` disables all motion; all features remain functional
- **Accessibility first** — Tab/Enter navigation, ARIA labels, visible focus indicators throughout
- **CLS < 0.1** — layout dimensions reserved before GSAP animations start

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                            │
│                                                                  │
│  ┌──────────┐   fetch()   ┌──────────────┐                      │
│  │  main.tsx│─────────────▶  profil.json │ (public/)            │
│  └────┬─────┘             └──────────────┘                      │
│       │ mounts                                                   │
│  ┌────▼────────────────────────────────────────────────────┐    │
│  │  App.tsx                                                 │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  AppContext  (language, quickRead, echoState,    │    │    │
│  │  │              profileData, profileError)          │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ┌────────────┐  ┌─────────────────┐  ┌──────────────┐  │    │
│  │  │  Header    │  │  QuickReadToggle│  │  EchoCenter  │  │    │
│  │  │ (LangToggle│  │  (fixed overlay)│  │  (fixed bar) │  │    │
│  │  └────────────┘  └─────────────────┘  └──────────────┘  │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  <Router>  →  <Outlet>                          │    │    │
│  │  │    /          Cover                             │    │    │
│  │  │    /architect  Architect                        │    │    │
│  │  │    /superpowers Superpowers                     │    │    │
│  │  │    /missions   Missions                         │    │    │
│  │  │    /ask        AskInza                          │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    AWS Amplify Hosting
                    (HTTPS, SPA rewrite, CDN)
```

### Component Hierarchy

```
App.tsx
├── AppProvider (context/AppContext.tsx)
│   ├── Header
│   │   └── LanguageToggle
│   ├── QuickReadToggle (fixed overlay)
│   ├── EchoCenter (fixed bottom bar)
│   │   └── EchoCenterInput
│   └── RouterOutlet
│       ├── Cover/
│       │   └── BookCover
│       ├── Architect/
│       │   └── ServerRackViz
│       │       └── ServerUnit (×1–20)
│       ├── Superpowers/
│       │   └── SkillRackCard (×N categories)
│       │       └── SkillItem (×M items)
│       ├── Missions/
│       │   ├── ProjectCard (featured, full-width)
│       │   └── ProjectCard (×N non-featured, grid)
│       └── AskInza/
│           ├── Terminal
│           │   ├── ConversationHistory
│           │   └── TerminalInput
```

### Data Flow

```
profil.json
    │
    │ fetch() on App mount
    ▼
useProfileData() hook
    │  validates schema via profileValidator.ts
    │  emits profileData | profileError
    ▼
AppContext.profileData
    │
    ├──▶ Cover      (name, tagline)
    ├──▶ Architect  (name, role, biography)
    ├──▶ Superpowers (skills[])
    ├──▶ Missions   (projects[])
    └──▶ AskInza    (chatResponses{})
              │
              └──▶ chatMatcher.ts  (keyword matching)
                        │
                        └──▶ Terminal response display

AppContext.language  (fr | en)
    │
    ├──▶ useTranslation(key) — reads bilingual profil.json fields
    └──▶ ui.ts            — static UI strings (nav, errors, help text)

AppContext.quickReadMode (boolean)
    │
    └──▶ each Page — renders <PageContent> or <QuickSummary>

AppContext.echoCollapsed (boolean)
    └──▶ EchoCenter — collapsed or expanded
```

---

## Components and Interfaces

### AppContext Shape

```typescript
// context/AppContext.tsx
interface AppState {
  // Data
  profileData: ProfileData | null;
  profileError: ProfileValidationError | null;

  // Language
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;

  // Quick-read
  quickReadMode: boolean;
  toggleQuickReadMode: () => void;
  savedScrollOffset: number;            // pixel offset at activation

  // Echo Center
  echoCollapsed: boolean;
  toggleEchoCollapsed: () => void;
  echoHistory: string[];                // last 10 commands, chronological
  pushEchoCommand: (cmd: string) => void;
}
```

AppContext is initialised in `AppProvider`, which:
1. Calls `useProfileData()` to fetch and validate `profil.json`
2. Reads `localStorage.getItem('lang')` to restore language preference
3. Reads `sessionStorage.getItem('echoCollapsed')` to restore Echo Center state
4. Reads `sessionStorage.getItem('echoHistory')` to restore command history

### TypeScript Type Definitions — `types/profile.ts`

```typescript
export interface BilingualString {
  fr: string;
  en: string;
}

export interface SkillItem {
  name: BilingualString;
  level: BilingualString;
}

export interface SkillCategory {
  category: BilingualString;
  items: SkillItem[];
}

export interface ProjectMetrics {
  f1?: number;
  recall?: number;
  auc?: number;
  observations?: number;
}

export interface Project {
  id: string;
  featured: boolean;
  title: BilingualString;
  description: BilingualString;
  metrics?: ProjectMetrics;
  technologies: string[];
  link: string;
}

export interface ChatResponse {
  keywords: string[];
  response: BilingualString;
}

export interface ProfileData {
  name: string;                         // 1–100 chars
  role: BilingualString;                // 1–100 chars each
  tagline: BilingualString;             // 1–200 chars each
  biography: BilingualString;           // 1–2000 chars each
  skills: SkillCategory[];              // min 1 item
  projects: Project[];                  // min 1 item
  chatResponses: Record<string, ChatResponse>; // min 1 key
}

export interface ProfileValidationError {
  field: string;
  message: string;
}
```

### Key Component Props Interfaces

```typescript
// components/BookCover/index.tsx
interface BookCoverProps {
  name: string;
  tagline: string;
  onEnter: () => void;
  reducedMotion: boolean;
}

// components/ServerRackViz/index.tsx
interface ServerRackVizProps {
  units: ServerUnit[];                  // 1–20 items
  reducedMotion: boolean;
}

interface ServerUnit {
  id: string;
  label: string;
  milestone?: string;                   // tooltip text; undefined → "No milestone linked"
}

// components/SkillRackCard/index.tsx
interface SkillRackCardProps {
  category: string;                     // already resolved to current language
  items: { name: string; level: string }[];
  reducedMotion: boolean;
}

// components/ProjectCard/index.tsx
interface ProjectCardProps {
  project: Project;
  featured: boolean;
  language: 'fr' | 'en';
  reducedMotion: boolean;
}

// components/EchoCenter/index.tsx
interface EchoCenterProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  history: string[];
  onCommand: (cmd: string) => ParsedCommand;
  language: 'fr' | 'en';
}

// components/QuickReadToggle/index.tsx
interface QuickReadToggleProps {
  active: boolean;
  onToggle: () => void;
  language: 'fr' | 'en';
}
```

### Hook Interfaces

```typescript
// hooks/useProfileData.ts
function useProfileData(): {
  data: ProfileData | null;
  error: ProfileValidationError | null;
  loading: boolean;
}

// hooks/useTranslation.ts
function useTranslation(): {
  t: (key: string) => string;           // static UI strings
  tField: (field: BilingualString) => string; // profil.json bilingual field
}

// hooks/useGSAP.ts
// Re-exports @gsap/react useGSAP with ScrollTrigger pre-registered
function useGSAP(
  scope: React.RefObject<Element>,
  callback: (context: gsap.Context) => void,
  deps?: React.DependencyList
): void
```

---

## Data Models

### profileValidator.ts — Validation Rules

| Field | Type | Constraint | Error key |
|---|---|---|---|
| `name` | string | 1–100 chars | `name` |
| `role` | BilingualString | each 1–100 chars | `role` |
| `biography` | BilingualString | each 1–2000 chars | `biography` |
| `skills` | array | min 1 item | `skills` |
| `projects` | array | min 1 item | `projects` |
| `chatResponses` | object | min 1 key | `chatResponses` |

Validation returns `ProfileValidationError[]`. Each error names exactly the offending field. The App renders a fallback UI per section; other sections are unaffected.

### chatMatcher.ts — Matching Algorithm

```
function matchQuery(
  query: string,
  chatResponses: Record<string, ChatResponse>
): ChatResponse | null

Algorithm:
  normalised ← query.trim().toLowerCase()
  FOR each entry in chatResponses:
    FOR each keyword in entry.keywords:
      IF normalised.includes(keyword.toLowerCase()):
        RETURN entry
  RETURN null
```

Matching is purely functional and free of side effects, making it directly testable as a property-based function.

### i18n Architecture — `i18n/ui.ts`

Static UI strings not present in `profil.json` (navigation labels, error messages, Echo Center help text, QuickRead labels) are stored in a typed map:

```typescript
type UIStringKey =
  | 'nav.cover' | 'nav.architect' | 'nav.superpowers'
  | 'nav.missions' | 'nav.askInza'
  | 'error.profileLoad' | 'error.sectionUnavailable'
  | 'echo.help' | 'echo.error.unknownCommand' | 'echo.error.rackRange'
  | 'quickread.label' | 'quickread.noSummary'
  | 'tooltip.noMilestone'
  | 'lang.fr' | 'lang.en';

const UI_STRINGS: Record<UIStringKey, BilingualString> = { ... };
```

`useTranslation().t(key)` reads from `UI_STRINGS[key][language]` and throws a TypeScript error at compile time if `key` is not a valid `UIStringKey`.

---

## Architecture Diagrams

### State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│  AppProvider                                             │
│                                                          │
│  useState: language          ←─ localStorage.lang        │
│  useState: quickReadMode     ←─ false                    │
│  useState: savedScrollOffset ←─ 0                        │
│  useState: echoCollapsed     ←─ sessionStorage           │
│  useState: echoHistory       ←─ sessionStorage           │
│  useProfileData()            ←─ fetch /profil.json       │
│                                                          │
│  toggleQuickReadMode():                                  │
│    if activating: save window.scrollY → savedScrollOffset│
│    flip quickReadMode                                    │
│    if deactivating: restore window.scrollY ± 10px       │
│                                                          │
│  setLanguage(lang):                                      │
│    localStorage.setItem('lang', lang)                   │
│    set state                                             │
└─────────────────────────────────────────────────────────┘
```

### Echo Center Command Parser — `utils/commandParser.ts`

```typescript
type ParsedCommand =
  | { type: 'navigate'; target: 'cover' | 'architect' | 'superpowers' | 'missions' | 'ask' }
  | { type: 'quickMode' }
  | { type: 'help' }
  | { type: 'unknown'; raw: string };

function parseCommand(input: string): ParsedCommand {
  const cmd = input.trim().toLowerCase();
  if (cmd === 'book')           return { type: 'navigate', target: 'cover' };
  if (cmd === 'rack 1')         return { type: 'navigate', target: 'architect' };
  if (cmd === 'rack 2')         return { type: 'navigate', target: 'superpowers' };
  if (cmd === 'rack 3')         return { type: 'navigate', target: 'missions' };
  if (cmd === 'rack 4')         return { type: 'navigate', target: 'ask' };
  if (cmd === 'ask inza')       return { type: 'navigate', target: 'ask' };
  if (cmd === 'help')           return { type: 'help' };
  if (cmd === 'mode quick')     return { type: 'quickMode' };
  return { type: 'unknown', raw: input };
}
```

The parser is a pure function with no side effects — directly property-testable.

### Echo Center Command History — Bounded Queue

```
echoHistory: string[]  (max length 10, FIFO when full)

pushEchoCommand(cmd):
  newHistory = [...echoHistory, cmd].slice(-10)
  setEchoHistory(newHistory)
  sessionStorage.setItem('echoHistory', JSON.stringify(newHistory))

Up-arrow cycling (local UI state in EchoCenter):
  historyIndex: number (starts at newHistory.length, i.e. past the end)
  on ArrowUp: historyIndex = max(0, historyIndex - 1); input = history[historyIndex]
  on ArrowDown: historyIndex = min(history.length, historyIndex + 1);
               input = historyIndex < history.length ? history[historyIndex] : ''
```

### Animation Choreography

#### Cover Page
```
OnMount (IntersectionObserver fires on root element):
  if reducedMotion:
    immediately: coverEl.opacity=1, nameEl.opacity=1, ctaEl.opacity=1
  else:
    t=0ms      : bookFrontCover rotateY 0° → -180° (duration 800ms, ease power2.inOut)
    t=800ms    : nameEl opacity 0 → 1 (duration 200ms)
    t=900ms    : ctaEl  opacity 0 → 1 (duration 200ms)
  Layout pre-reservation: bookEl min-height set in CSS before GSAP runs (no CLS)
```

#### Architect Page — ServerRack_Viz
```
ScrollTrigger (start: "top 80%"):
  if reducedMotion:
    all server units opacity 0 → 1 (duration 300ms)
  else:
    FOR each unit i (0-indexed):
      translateY: 40px → 0, opacity 0 → 1
      delay: i × staggerInterval  (50ms ≤ staggerInterval ≤ 150ms, default 80ms)
      duration: 400ms, ease power2.out
  Tooltip on hover:
    mousenter → show tooltip within 100ms (CSS transition 80ms + JS 20ms overhead)
```

#### Superpowers Page — SkillRack_Cards
```
Per card (IntersectionObserver, threshold 0.1):
  if reducedMotion:
    opacity 0 → 1 (duration 300ms), triggered once
  else:
    scale 0.8 → 1.0, opacity 0 → 1 (duration 400ms, ease power2.out), triggered once
  Layout: card dimensions reserved via min-height/min-width CSS before GSAP runs

Hover (CSS + JS):
  mouseenter → FOR each skill item i:
    delay: i × 80ms
    opacity 0 → 1, duration 200ms

Click (React state):
  collapsed → expanded: height auto transition 300ms (CSS max-height trick)
  expanded → collapsed: height 0 transition 300ms
```

#### Missions Page — Project Cards
```
ScrollTrigger per card (start: "top 90%"):
  if reducedMotion:
    opacity 0 → 1 (duration 300ms)
  else:
    opacity 0 → 1, translateY 30px → 0 (duration 600ms, ease power2.out)
  Layout: card min-height reserved in CSS; translateY uses transform (no CLS)

Hover (CSS):
  box-shadow: 0 0 16px 2px var(--accent-green) transition 200ms
```

#### AskInza Page — Typewriter Effect
```
On response found:
  chars = response.split('')
  totalDuration = min(chars.length × 30ms, 1500ms)
  perCharDelay = totalDuration / chars.length
  FOR each char i: setTimeout(append, i × perCharDelay)
  After last char: scroll history to bottom
```

---

## AWS Amplify Configuration Design

### `public/amplify.yml`

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### SPA Rewrite Rule (configured in Amplify Console or `amplify.yml` custom headers)

All non-asset paths are rewritten to `index.html` with a 200 status so React Router handles client-side routing:

```
Source:  </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target:  /index.html
Status:  200 (Rewrite)
```

### Build Constraints

- `npm run build` must exit 0; any non-zero exit halts deployment (Amplify default behaviour)
- Build timeout: 15 minutes (configured in Amplify Console → App settings → Build settings → Build timeout)
- HTTPS is provisioned automatically by Amplify via ACM

---

## Error Handling

| Scenario | Detection | Response |
|---|---|---|
| `profil.json` network error | `fetch()` rejects | Full-page error: "Content unavailable. Please reload." |
| `profil.json` parse error | `JSON.parse()` throws | Same full-page error |
| Required field missing/invalid | `profileValidator` returns errors | Per-section fallback UI; other sections render normally; console error logs field name |
| ScrollTrigger targets missing DOM element | GSAP SafeToString or null check before `gsap.to()` | Log warning; skip that animation; others continue |
| No chat match found | `chatMatcher` returns null | Terminal displays: `t(echo.error.unknownCommand)` |
| Page has no QuickSummary | Check in QuickReadMode render path | Display `t('quickread.noSummary')` for that page; toggle remains visible |
| Server unit has no milestone | `milestone === undefined` | Tooltip shows `t('tooltip.noMilestone')` |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: ProfileData content fidelity

*For any* valid ProfileData object, when the application renders with that ProfileData, the rendered output for each page section must contain the corresponding string values from ProfileData (biography, skills category names, project titles) in the currently active language.

**Validates: Requirements 1.4**

---

### Property 2: Profile validation identifies affected field

*For any* ProfileData object where exactly one required field (`name`, `biography`, `skills`, `projects`, or `chatResponses`) is missing or fails its type/length constraint, the validator returns exactly one error that names that field, and the application renders a fallback UI for only the section corresponding to that field while all other sections render normally.

**Validates: Requirements 1.5**

---

### Property 3: Chat keyword matching

*For any* non-empty query string and any chatResponses map, if at least one keyword from any entry is a case-insensitive substring of the query, then `matchQuery` returns a non-null response; if no keyword from any entry is a substring of the query, then `matchQuery` returns null.

**Validates: Requirements 6.2**

---

### Property 4: AskInza conversation history is append-only

*For any* sequence of non-empty query submissions, the conversation history contains all submitted queries in chronological order, with no duplicates omitted and no extra entries added.

**Validates: Requirements 6.5**

---

### Property 5: AskInza up-arrow history cycling

*For any* non-empty query history of length N, pressing up-arrow N times cycles through all N queries in reverse chronological order; pressing up-arrow a further K times (K > 0) retains the oldest entry without change.

**Validates: Requirements 6.7**

---

### Property 6: Empty or whitespace query produces no side effects

*For any* string composed entirely of whitespace characters (including the empty string), submitting it to AskInza leaves the conversation history unchanged and produces no displayed response.

**Validates: Requirements 6.8**

---

### Property 7: Echo Center command parser coverage

*For any* input string that exactly matches one of the defined commands (`book`, `rack 1`, `rack 2`, `rack 3`, `rack 4`, `ask inza`, `help`, `mode quick`), `parseCommand` returns the correct `ParsedCommand` action type; for any string that does not match any defined command, `parseCommand` returns `{ type: 'unknown' }`.

**Validates: Requirements 11.2**

---

### Property 8: Echo Center bounded command history

*For any* sequence of N command submissions (N > 10), the Echo Center history contains exactly the last 10 commands in chronological order; for any sequence of M commands (M ≤ 10), the history contains exactly those M commands.

**Validates: Requirements 11.6**

---

### Property 9: Language preference round-trip

*For any* language value in `{ 'fr', 'en' }`, setting the language stores it in localStorage, and reading it back returns the same value.

**Validates: Requirements 12.3**

---

### Property 10: UI string translation completeness

*For any* key in the `UIStringKey` union type, calling `t(key)` with language `'fr'` returns a non-empty string, and calling `t(key)` with language `'en'` returns a non-empty string.

**Validates: Requirements 12.5**

---

### Property 11: Echo Center help/error text is bilingual, commands are language-invariant

*For any* language setting (`fr` or `en`), the Echo Center help text and error messages (unknown command, rack range error) return non-empty strings in the corresponding language. For any valid command string, `parseCommand` returns the same `ParsedCommand` regardless of the active language.

**Validates: Requirements 12.7**

---

### Property 12: QuickSummary item count is bounded by availability

*For any* ProfileData, the QuickSummary for each section contains exactly `min(available_items, defined_max)` items, where defined maximums are: Cover (1 name + 1 tagline), Architect (3 career facts), Superpowers (5 skills), Missions (2 projects), AskInza (3 questions).

**Validates: Requirements 7.3**

---

### Property 13: QuickReadMode toggle is a round-trip

*For any* page content state, activating QuickReadMode and then immediately deactivating it restores the full page content to its prior state (same rendered text, same component structure).

**Validates: Requirements 7.4**

---

### Property 14: Scroll offset preserved across QuickReadMode toggle

*For any* scroll offset value at the moment QuickReadMode is activated, deactivating QuickReadMode restores `window.scrollY` to within ±10 pixels of that recorded offset.

**Validates: Requirements 7.6**

---

### Property 15: SkillRack_Card count matches ProfileData categories

*For any* ProfileData with N skill categories, the Superpowers_Page renders exactly N SkillRack_Cards.

**Validates: Requirements 4.1**

---

### Property 16: Expanded SkillRack_Card shows all items from ProfileData

*For any* SkillRack_Card with items sourced from ProfileData, after clicking to expand, every skill name and proficiency level from that card's ProfileData entry is visible in the rendered output (resolved to the current language).

**Validates: Requirements 4.4**

---

### Property 17: Featured project is positioned first at full width

*For any* ProfileData where exactly one project has `featured: true`, the Missions_Page renders that project's card before all other project cards, and that card occupies the full available container width (CSS class indicates full-width treatment, distinct from non-featured cards).

**Validates: Requirements 5.1**

---

### Property 18: Non-featured project grid count matches ProfileData

*For any* ProfileData with N projects where exactly one has `featured: true`, the Missions_Page grid contains exactly N − 1 non-featured project cards.

**Validates: Requirements 5.3**

---

## Testing Strategy

### Dual Testing Approach

Both unit/example-based tests and property-based tests are used. They are complementary: unit tests cover specific scenarios and integration points; property tests validate universal invariants across generated inputs.

### Property-Based Testing

The project uses **fast-check** (TypeScript, runs in Vitest) for property-based tests. Minimum **100 iterations** per property test.

Each property test is tagged:

```typescript
// Feature: living-datacenter-portfolio, Property 3: Chat keyword matching
```

**Property tests target pure, side-effect-free functions:**
- `chatMatcher.matchQuery` (Properties 3, 6)
- `profileValidator.validate` (Property 2)
- `commandParser.parseCommand` (Property 7, 11)
- `AppContext` language storage logic (Property 9)
- `useTranslation().t` completeness check (Property 10)
- EchoCenter history queue logic (Property 8)
- QuickSummary item count logic (Property 12)
- Conversation history accumulation (Properties 4, 5)
- Scroll offset restoration logic (Property 14)
- Component render output / data fidelity (Properties 1, 13, 15, 16, 17, 18)
  — rendered with React Testing Library and generated ProfileData

**Property tests that involve React rendering** (Properties 1, 13, 15, 16, 17, 18) use `@testing-library/react` with fast-check arbitraries generating `ProfileData` objects. AWS/external calls are never made in property tests.

### Unit / Example-Based Tests

Vitest + React Testing Library for:
- `profil.json` load failure → full-page error UI (Req 1.2)
- Book cover CSS transform class applied on mount (Req 2.2)
- CTA click navigates to `/architect` (Req 2.4)
- `prefers-reduced-motion: reduce` skips animation (Req 2.6, 8.3)
- Architect_Page biography text rendered (Req 3.1)
- ServerRack_Viz renders correct number of units (Req 3.2)
- Hover on server unit shows tooltip / generic message (Req 3.4)
- Layout breakpoint tests: side-by-side at 768px, stacked at 767px (Req 3.5)
- SkillRack_Card collapse on second click (Req 4.5)
- Layout column count at 639px / 640px / 1024px (Req 4.6, 9.x)
- PFE card renders all required fields within character limits (Req 5.2)
- Hover glow border class applied (Req 5.5)
- Single-column at < 640px (Req 5.6)
- No non-featured projects → no grid rendered (Req 5.7)
- Terminal dark background + monospace font classes (Req 6.1)
- No matching query → fallback message displayed (Req 6.4)
- QuickReadMode toggle visible without scrolling (Req 7.1)
- QuickReadMode toggle label text correct (Req 7.5)
- Page with no QuickSummary → fallback message, toggle still present (Req 7.7)
- Echo Center renders as fixed bottom bar (Req 11.1)
- `book` command navigates to Cover (Req 11.3)
- `rack 1–4` commands navigate to correct pages (Req 11.4)
- Unknown command shows error listing available commands (Req 11.5)
- Echo Center collapsed state persists across page navigations (Req 11.8)
- Echo Center Tab/Enter accessibility (Req 11.9)
- Echo Center remains functional while QuickReadMode active (Req 11.10)
- FR/EN toggle visible in header on all pages (Req 12.1)
- No language preference in localStorage → defaults to FR (Req 12.4)
- Language toggle shows active language visually (Req 12.10)

### Integration Tests

Vitest with mocked IntersectionObserver and GSAP for:
- Book-opening animation fires within 300ms of intersection (Req 2.1)
- ServerRack stagger interval is 50–200ms per unit (Req 3.3)
- SkillRack_Card scale animation fires once per page load (Req 4.2)
- Hover skill reveal uses 80ms stagger (Req 4.3)
- Project card GSAP fade + translateY completes ≤ 600ms (Req 5.4)
- Typewriter effect completes ≤ 1500ms (Req 6.3)
- Language switch updates all text within 300ms (Req 12.2)
- Language switch while QuickReadMode active updates QuickSummary (Req 12.9)

### Smoke / Infrastructure Tests

- `npm run build` exits 0 (CI pipeline check)
- `amplify.yml` present in public directory with correct structure
- Rewrite rule configured (verified post-deploy via curl to a deep route returning 200)
- CLS measurement: Lighthouse CI run in pipeline asserting CLS < 0.1 (Req 8.5)

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  }
});

// src/test/setup.ts
import '@testing-library/jest-dom';
// Mock IntersectionObserver
// Mock matchMedia (for prefers-reduced-motion)
// Mock GSAP (stub gsap.to, gsap.timeline, ScrollTrigger)
```

Property tests use fast-check arbitraries:
```typescript
import fc from 'fast-check';

const profileDataArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: bilingualStringArb,
  tagline: bilingualStringArb,
  biography: bilingualStringArb,
  skills: fc.array(skillCategoryArb, { minLength: 1 }),
  projects: fc.array(projectArb, { minLength: 1 }),
  chatResponses: fc.dictionary(fc.string(), chatResponseArb, { minKeys: 1 }),
});
```
