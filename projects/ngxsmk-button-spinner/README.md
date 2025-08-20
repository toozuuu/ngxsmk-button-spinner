# ngxsmk-button-spinner

A tiny Angular 17+ directive that overlays a loading **spinner** on any existing `<button>` — without changing your markup and **without requiring a global stylesheet**.

- ✅ Works with your current buttons (no component swap)
- ✅ Zero CSS imports — styles are injected once by the directive
- ✅ Theming via inputs (color, size, thickness, speed, dim overlay)
- ✅ A11y-friendly (`role="status"`, configurable aria-label)
- ✅ Strict TypeScript compatible

---

## Install

```bash
  npm i ngxsmk-button-spinner
````

Angular peer deps: `@angular/core@>=17`, `@angular/common@>=17`.

---

## Quick start

```ts
// Any standalone component
import { Component, signal } from '@angular/core';
import { NgxSmkButtonSpinnerDirective } from 'ngxsmk-button-spinner';

@Component({
  selector: 'demo',
  standalone: true,
  imports: [NgxSmkButtonSpinnerDirective],
  template: `
    <button [ngxsmkButtonSpinner]="saving" (click)="save()">
      Save
    </button>
  `
})
export class DemoComponent {
  saving = signal(false);
  save() {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}
```

That’s it — no stylesheet import needed.

---

## API

### Directive

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerOptions]="{ ariaLabel: 'Saving' }"
  [ngxsmkButtonSpinnerTheme]="{
    color: '#0ea5e9',
    trackColor: 'rgba(14,165,233,.25)',
    thickness: '3px',
    size: '20px',
    speedMs: 500,
    dimOverlay: 'rgba(0,0,0,.15)',
    keepLabel: true
  }"
>
  Save
</button>
```

#### Inputs

| Input                        | Type                                                                            | Default                    | Description                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------- |
| `ngxsmkButtonSpinner`        | `boolean`                                                                       | `false`                    | When `true`, disables the button and overlays the spinner.      |
| `ngxsmkButtonSpinnerOptions` | `{ ariaLabel?: string; mode?: 'overlay'; }`                                     | `{ ariaLabel: 'Loading' }` | A11y label for the spinner. (Mode reserved for future layouts.) |
| `ngxsmkButtonSpinnerTheme`   | `{ color?, trackColor?, thickness?, size?, speedMs?, dimOverlay?, keepLabel? }` | see below                  | Visual/theme knobs, all optional.                               |

#### Theme defaults

* `color`: `currentColor`
* `trackColor`: `transparent`
* `thickness`: `2px`
* `size`: `1.2em`
* `speedMs`: `700`
* `dimOverlay`: `transparent`
* `keepLabel`: `false` (hides text by setting `color: transparent` while loading)

> You can also override these via inline styles or component CSS using the same variables on the button element:
> `--ngxsmk-color`, `--ngxsmk-track`, `--ngxsmk-thickness`, `--ngxsmk-size`, `--ngxsmk-speed`, `--ngxsmk-dim-overlay`.

---

## Examples

### Minimal

```html
<button [ngxsmkButtonSpinner]="loading">Submit</button>
```

### Custom brand + thicker border + bigger size

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerTheme]="{ color: '#2563eb', thickness: '3px', size: '22px' }"
>
  Publish
</button>
```

### Dim overlay + keep label visible

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerTheme]="{
    color: 'white',
    trackColor: 'rgba(255,255,255,.35)',
    dimOverlay: 'rgba(0,0,0,.25)',
    keepLabel: true
  }"
  style="background:#111827; color:#fff; border-radius:10px"
>
  Processing…
</button>
```

### Faster spin + size in `em`

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerTheme]="{ speedMs: 450, size: '1.4em' }"
>
  Sync
</button>
```

---

## Accessibility

* Spinner element uses `role="status"` and `aria-label` (default `"Loading"`).
* The directive sets `disabled` on the button while loading.
* If you keep the label hidden (default), screen readers still get the status via the spinner’s aria label.
* To always show the label, set `keepLabel: true` in theme.

---

## How it works (no CSS import)

* On first use, the directive injects a small `<style>` tag into `document.head`.
* Visuals are powered by CSS variables applied on the **button** element, so you can theme per-instance.
* Spinner and optional dim overlay are appended as absolutely positioned children of your button.

---

## SSR / hydration

The directive adds DOM nodes on the client when `loading=true`. For SSR/hydration-safe usage, prefer toggling `loading` only after the component is hydrated (e.g., in response to user actions or effects that run in the browser).

---

## Troubleshooting

* **TS2532: Object is possibly 'undefined'**
  The directive is strict-mode safe. If you adapted it, ensure optional fields are null-checked before use.

* **TS5076: `&&` and `??` cannot be mixed**
  Parenthesize or simplify. Example:
  `const keep = theme?.keepLabel ?? false;`

* **Spinner not visible**
  Check that button text color isn’t fully transparent if `keepLabel: true`. Also ensure the button isn’t `overflow: hidden` with small height.

* **Button layout jumps**
  Because we keep layout and overlay the spinner, text is hidden via `color: transparent`. If your button relies on `currentColor` for borders/icons, set `keepLabel: true` or provide explicit colors.

---


### Types

```ts
export interface NgxSmkButtonSpinnerOptions {
  ariaLabel?: string;
  mode?: 'overlay';
}

export interface NgxSmkButtonSpinnerTheme {
  color?: string;
  trackColor?: string;
  thickness?: string;
  size?: string;
  speedMs?: number;
  dimOverlay?: string;
  keepLabel?: boolean;
}
```

---

## Versioning & support

* Supports Angular **17+** (standalone).
* Semantic versioning. Breaking changes (if any) will bump the major.

---

## License

MIT
