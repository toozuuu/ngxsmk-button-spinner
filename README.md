# ngxsmk-button-spinner

A tiny Angular 17+ **directive** that adds a loading spinner to any existing `<button>` — no component swap and **no global stylesheet** required.

* ✅ Drop-in attribute: `[ngxsmkButtonSpinner]="loading"`
* ✅ Two display modes:

  * **Inline** (default): spinner appears **after the text** with a small gap
  * **Overlay** (centered): set `[ngxsmkButtonSpinnerHideLabel]="true"` to hide text and center the spinner
* ✅ Theming via **CSS variables** (bind directly in the template)
* ✅ A11y-friendly (`role="status"`, configurable aria-label)
* ✅ Strict TypeScript & SSR-safe

---

<p align="center">
  <video
    src="https://raw.githubusercontent.com/toozuuu/ngxsmk-button-spinner/master/assest/demo.mp4"
    width="720"
    controls
    muted
    playsinline
  ></video>
</p>

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
    <button [ngxsmkButtonSpinner]="saving()" (click)="save()">
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
>
  Save
</button>
```

| Input                          | Type                     | Default                    | Description                                                              |
| ------------------------------ | ------------------------ | -------------------------- | ------------------------------------------------------------------------ |
| `ngxsmkButtonSpinner`          | `boolean`                | `false`                    | When `true`, disables the button and shows the spinner.                  |
| `ngxsmkButtonSpinnerHideLabel` | `boolean`                | `false`                    | If `true`, hides text and **centers spinner** over the button (overlay). |
| `ngxsmkButtonSpinnerOptions`   | `{ ariaLabel?: string }` | `{ ariaLabel: 'Loading' }` | A11y label for the spinner.                                              |

---

## Theming (recommended): bind CSS variables directly

Customize per button by binding these CSS variables. They update reactively — no restarts, no object cloning.

Supported variables (bind any subset):

* `--ngxsmk-color` (e.g. `#0ea5e9` or `currentColor`)
* `--ngxsmk-track` (spinner trail color, default `transparent`)
* `--ngxsmk-thickness` (e.g. `2px`)
* `--ngxsmk-size` (e.g. `20px`, `1.2em`)
* `--ngxsmk-speed` (e.g. `700ms`)

### Inline example

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [style.--ngxsmk-color]="'#0ea5e9'"
  [style.--ngxsmk-thickness]="'1px'"
  [style.--ngxsmk-size]="'60px'"
  [style.--ngxsmk-speed]="'1500ms'"
>
  Save
</button>
```

### Overlay example (centered, text hidden)

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [ngxsmkButtonSpinnerHideLabel]="true"
  [style.--ngxsmk-color]="'#0ea5e9'"
  [style.--ngxsmk-thickness]="'8px'"
  [style.--ngxsmk-size]="'20px'"
  [style.--ngxsmk-speed]="'500ms'"
>
  Save
</button>
```

> Tip: You can also set these variables in component CSS:
>
> ```css
> .primary-btn {
>   --ngxsmk-color: #2563eb;
>   --ngxsmk-thickness: 3px;
>   --ngxsmk-size: 22px;
>   --ngxsmk-speed: 450ms;
> }
> ```

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

### 3) Custom brand + thicker border + bigger size (via CSS vars)

```html
<button
  [ngxsmkButtonSpinner]="loading"
  class="primary-btn"
  [style.--ngxsmk-color]="'#2563eb'"
  [style.--ngxsmk-thickness]="'3px'"
  [style.--ngxsmk-size]="'22px'"
>
  Publish
</button>
```

### 4) Faster spin + size in `em`

```html
<button
  [ngxsmkButtonSpinner]="loading"
  [style.--ngxsmk-speed]="'450ms'"
  [style.--ngxsmk-size]="'1.4em'"
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
  In overlay mode the label is hidden via a wrapper (`visibility: hidden`) while the spinner is centered in an overlay box. Ensure your button isn’t applying `overflow: hidden` in a way that clips the overlay.

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
