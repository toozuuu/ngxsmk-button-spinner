# ngxsmk-button-spinner

A tiny Angular 17+ **directive** that adds a loading spinner to any existing `<button>` — no component swap and **no global stylesheet** required.

* ✅ Drop-in attribute: `[ngxsmkButtonSpinner]="loading"`
* ✅ Two display modes:

  * **Inline** (default): spinner appears **after the text** with a small gap
  * **Overlay** (centered): set `[ngxsmkButtonSpinnerHideLabel]="true"` to hide text and center the spinner
* ✅ Theming via inputs (color, size, thickness, speed)
* ✅ A11y-friendly (`role="status"`, configurable aria-label)
* ✅ Strict TypeScript & SSR-safe

---

## Install

```bash
npm i ngxsmk-button-spinner
```

Peer deps: `@angular/core@>=17`, `@angular/common@>=17`.

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

### Directive Inputs

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerHideLabel]="true"           <!-- optional: overlay mode -->
  [ngxsmkButtonSpinnerOptions]="{ ariaLabel: 'Saving' }"
  [ngxsmkButtonSpinnerTheme]="{ color: '#0ea5e9', thickness: '3px', size: '20px', speedMs: 500 }"
>
  Save
</button>
```

| Input                          | Type                                                   | Default                    | Description                                                              |
| ------------------------------ | ------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------ |
| `ngxsmkButtonSpinner`          | `boolean`                                              | `false`                    | When `true`, disables the button and shows the spinner.                  |
| `ngxsmkButtonSpinnerHideLabel` | `boolean`                                              | `false`                    | If `true`, hides text and **centers spinner** over the button (overlay). |
| `ngxsmkButtonSpinnerOptions`   | `{ ariaLabel?: string }`                               | `{ ariaLabel: 'Loading' }` | A11y label for the spinner.                                              |
| `ngxsmkButtonSpinnerTheme`     | `{ color?, trackColor?, thickness?, size?, speedMs? }` | see defaults below         | Visual/theme knobs, all optional.                                        |

#### Theme defaults

* `color`: `currentColor`
* `trackColor`: `transparent`
* `thickness`: `2px`
* `size`: `1.2em`
* `speedMs`: `700`

> You can also override these via inline styles or component CSS using the same variables on the button element: `--ngxsmk-color`, `--ngxsmk-track`, `--ngxsmk-thickness`, `--ngxsmk-size`, `--ngxsmk-speed`.

---

## Examples

### 1) Minimal (inline spinner after text)

```html
<button [ngxsmkButtonSpinner]="loading">Submit</button>
```

### 2) Overlay (centered) spinner, hide text while loading

```html
<button [ngxsmkButtonSpinner]="loading" [ngxsmkButtonSpinnerHideLabel]="true">
  Save
</button>
```

### 3) Custom brand + thicker border + bigger size

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerTheme]="{ color: '#2563eb', thickness: '3px', size: '22px' }"
>
  Publish
</button>
```

### 4) Faster spin + size in `em`

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
* If you hide the label (overlay mode), screen readers still get the status via the spinner’s aria label.

---

## SSR / hydration

This directive avoids DOM APIs on the server. Spinner elements and the small `<style>` tag are injected **only in the browser** after view init. For best UX, toggle `loading` in response to user actions or browser-only effects.

---

## Troubleshooting

* **ReferenceError: document is not defined**
  Ensure you’re using the latest directive: it guards DOM access with `PLATFORM_ID` and only injects styles in the browser.

* **TS2532: Object is possibly 'undefined'**
  The directive is strict-mode safe. If you modified it, null‑check optional fields before use.

* **TS5076: `&&` and `??` cannot be mixed**
  Parenthesize or simplify. Example: `const keep = theme?.keepLabel ?? false;`

* **Spinner not visible**
  In overlay mode the text is hidden via `color: transparent`. If your icon/border relies on `currentColor`, either set explicit colors or use inline mode.

---

## Public API

```ts
// public-api.ts
export * from './lib/button-spinner.directive';
export * from './lib/types';
```

### Types

```ts
export interface NgxSmkButtonSpinnerOptions {
  ariaLabel?: string;
}

export interface NgxSmkButtonSpinnerTheme {
  color?: string;
  trackColor?: string;
  thickness?: string;
  size?: string;
  speedMs?: number;
}
```

---

## Versioning & support

* Supports Angular **17+** (standalone).
* Semantic versioning. Breaking changes (if any) will bump the major.

---

## License

MIT
