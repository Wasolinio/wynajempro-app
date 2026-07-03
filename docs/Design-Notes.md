# 🎨 Design Notes

## Audyt UI v2 — 2026-07-03 (agent: `designer`)

Pełny przegląd panelu, stron publicznych i bloga względem identyfikacji v2 i WCAG.
15 pozycji, realizacja partiami; status aktualizowany tutaj. Decyzje właściciela:
partie 1–3 zatwierdzone · mobile = dolny pasek ([[Projects/Roadmap]] X12) ·
kontrast tokenów = minimalna korekta hexów.

**Partia 1 — ✅ 2026-07-03 (`0a7d12b`):** :focus-visible zbiorczo (.wpd/.wpb/.wpc/.wp4/.wp4a,
outline 2px cynober); klasy widmowe → istniejące + definicje `.wpb-body`/`.wpb-mono`;
`.wpd-rotate` dla ikon (artefakt obwódki na sync) + spinnery pod `prefers-reduced-motion`;
kanały spójnie przez `channelTone` (Nocowanie=amber wszędzie); `plural()` → `src/utils/`;
press-scale na landing/login; martwy `App.css` usunięty; tokeny AA: `--faint #716951` (4.76:1),
`--label #746C54` (4.55:1), `--amber-ink #7E6119` (5.17:1 na tint-amber).

**Partia 2 — ✅ 2026-07-03:** hit-area ≥40px przez pseudo-elementy (check 22px, navbtn 30px,
user__out, sync, swatch, breadcrumb — bez zmiany wyglądu); klawiatura dla klikalnych
kart/wierszy przez `utils/a11y.js` (Pulpit ×5, Rezerwacje, Kalendarz, Obiekty, Generator;
guard na Enter z zagnieżdżonych przycisków); modale: `useDialogA11y` — Escape zamyka
najwyższy dialog (z-index-aware), fokus wchodzi przy otwarciu, `role=dialog`/`aria-modal`
(5 modali). Weryfikacja: lint+build, `e2e/panel-v2.spec.js` 3/3 (Escape, klawiatura,
render panelu) — nowy spec, bo stara suita nie testuje panelu v2 (X10).

**Partia 3 — ⬜:** kalendarz (kontrast amber → `--amber-ink`, legenda o Nocowanie, kolizja
pasków back-to-back — najpierw reprodukcja); GuideBuilder: `window.confirm` → DeleteConfirmModal
+ toasty; zwijanie generatora umów i formularza przewodnika <980px; newsletter: stan błędu
w cynobrze + `role=status`.

**Partia 4 — ⬜:** dolny pasek nawigacji mobile → [[Projects/Roadmap]] X12.

**Poniżej progu (świadomie nieplanowane):** panel „Najbliższe przyjazdy i wyjazdy" pokazuje
tylko przyjazdy (`wpd-row__tag--out` nieużywany); tooltip trendu dostępny tylko z hovera.

---

## Landing Page Design

### Vision
Modern, clean landing page targeting property owners. Should feel professional, trustworthy, and easy to use.

### Key Sections
1. **Hero** - Hook, CTA button
2. **Features** - What WynajemPRO offers
3. **Screenshots** - Product showcase
4. **Testimonials** (optional)
5. **Pricing** (optional)
6. **CTA Footer** - Sign up button

### Design Variants
- `landing_apple_copy.md` - Minimal, Apple-style
- `landing_copy.md` - Feature-focused

### Current Status
⚠️ Multiple landing page versions exist, need to decide on final design.

---

## Apple Animation Architecture

**File**: `apple_animation_architecture.md`

### Overview
Implementation of Apple's signature smooth animations:
- Ease-in-out curves
- Staggered element animations
- Fade + scale transitions

### Key Techniques
```
1. CSS Keyframes for smooth motion
2. React framer-motion library (if used)
3. Stagger delays for cascading effects
4. GPU acceleration (transform, opacity)
```

### Performance Considerations
- Animations on transform/opacity only
- Avoid animating layout properties
- Use will-change sparingly
- Test on lower-end devices

### Example Animation
```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## UI Components

### Color Palette
```
Primary: #0066CC (blue)
Secondary: #34C759 (green)
Danger: #FF3B30 (red)
Background: #FFFFFF or #F5F5F5
Text: #000000 or #333333
```

### Typography
```
Headlines: San Francisco, 28px, 700
Body: San Francisco, 16px, 400
Small: San Francisco, 14px, 500
```

### Spacing
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
```

### Components to Check
- [ ] Buttons (primary, secondary, danger)
- [ ] Forms (inputs, selects, checkboxes)
- [ ] Cards (property, guide, etc)
- [ ] Modal dialogs
- [ ] Navigation (header, sidebar)

---

## Responsive Design

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Mobile-First Approach
- Design for mobile first
- Enhance for tablet/desktop
- Test on actual devices

### UI Scaling Test
**File**: `e2e/ui-scaling.spec.js`

Tests responsive behavior across viewport sizes.

---

## Accessibility (WCAG)

### Checklist
- [ ] Color contrast (4.5:1 for text)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators (visible, not removed)
- [ ] Form labels (associated with inputs)
- [ ] Image alt text

### Tools
- axe DevTools (browser extension)
- Lighthouse (Chrome DevTools)
- NVDA (screen reader testing)

---

## Dark Mode (Future)

### Implementation
```javascript
// Check system preference
const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Or user toggle
const [isDark, setIsDark] = useState(darkMode);
```

### Color Scheme
```
Light Mode: #FFFFFF bg, #000000 text
Dark Mode: #1A1A1A bg, #FFFFFF text
```

---

## Animations to Implement

### Page Transitions
- Fade in on load
- Slide out on navigation away

### Button Interactions
- Hover: scale up slightly, shadow increase
- Active: scale down slightly (press effect)

### Loading States
- Skeleton screens
- Spinner animations
- Progress bars

### Micro-interactions
- Hover effects on cards
- Input focus highlights
- Success/error toasts

---

## Design System Maintenance

**How to Update**:
1. Modify base colors/fonts in CSS variables
2. All components inherit automatically
3. Test responsive behavior
4. Document changes here

**Files**:
- `src/styles/global.css` - Base styles
- `src/styles/variables.css` - Design tokens
- `tailwind.config.js` - TailwindCSS config (if used)

---

**Related**: [[Features]], [[Development]], [[Architecture]]
