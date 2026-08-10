# FinNexa Design System

This document outlines the core tokens, components, and visual standards for the FinNexa Indian Stock Market platform.

---

## 1. Color Palette

FinNexa uses a premium dark fintech color theme.

| Color Name | Hex Code | Purpose | Tailwind Class | CSS Variable |
| :--- | :--- | :--- | :--- | :--- |
| **Navy Base** | `#05070D` | Base dark background | `bg-navy-950` | `--bg-primary` |
| **Navy Card** | `#0B1220` | Secondary background for cards/modals | `bg-navy-900` | `--bg-secondary` |
| **Gain Green** | `#00E38A` | Profit, upward ticker indicator | `text-gain` / `bg-gain` | `--success` |
| **Loss Red** | `#FF3B5C` | Loss, downward ticker indicator | `text-loss` / `bg-loss` | `--danger` |
| **Amber Neutral**| `#FFB020` | Warnings, pending indicators | `text-amberNeutral` | `--text-warn` |
| **Glow Blue** | `#22D3EE` | Highlights, active underlines, links | `text-glow-blue` | `--glow-blue` |
| **Glow Purple** | `#7C5CFC` | Technical indicators, SMA lines | `text-glow-purple` | `--accent` |

---

## 2. Typography

We enforce dual fonts to separate numerical market data from textual context:

1. **System Font (`Inter`)**: Used for all headings, body texts, inputs, and layout headers.
   - Tailwind Class: `font-sans`
   - Google Font: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800`
2. **Numeric Font (`JetBrains Mono`)**: Used for all rupee values, percentages, volumes, quantities, dates, and order ids. This guarantees tab-spaced columns and tabular figures alignment.
   - Tailwind Class: `font-mono`
   - Google Font: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700`

---

## 3. Glassmorphism Utilities

Standardized pure CSS backdrop filters for floating premium components:

### CSS Glass Card Class
```css
.glass-card {
  background: rgba(11, 18, 32, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
}
```

---

## 4. 3D Tilt Animations

All interactive cards (stock selection tiles, holdings summary, trade tickets, IPOS, mutual funds, auth dialogues) implement the JavaScript-driven 3D tilt effect:

- **Perspective Base**: Containers use `.perspective-container` (`perspective: 1000px`).
- **Preserve 3D**: Rotating elements use `.glass-card-3d` (`transform-style: preserve-3d`).
- **Glow Glare**: Mouse movements trigger a glowing cyan gradient that tracks cursor coordinates.

---

## 5. Reduced Motion Accessibility

To accommodate users with motion sensitivities, the CSS and JS check the system preferences and disable all transforms:

- **CSS Rule**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  }
  ```
- **JS Hook**:
  ```javascript
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ```
