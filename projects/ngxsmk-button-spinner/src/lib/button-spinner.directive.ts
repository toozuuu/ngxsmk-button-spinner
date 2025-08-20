import {Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';
import {NgxSmkButtonSpinnerOptions, NgxSmkButtonSpinnerTheme} from './types';

@Directive({
  selector: '[ngxsmkButtonSpinner]',
  standalone: true
})
export class NgxSmkButtonSpinnerDirective implements OnChanges {
  /** Primary boolean: [ngxsmkButtonSpinner]="isLoading" */
  @Input('ngxsmkButtonSpinner') loading = false;

  /** Optional config (a11y / future) */
  @Input() ngxsmkButtonSpinnerOptions?: NgxSmkButtonSpinnerOptions;

  /** Theme knobs (colors, size, thickness, speed, overlay) */
  @Input() ngxsmkButtonSpinnerTheme?: NgxSmkButtonSpinnerTheme;

  private spinnerEl: HTMLElement | null = null;
  private overlayEl: HTMLElement | null = null;

  constructor(private readonly el: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {
    // host setup once
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.ensureGlobalStyle();
  }

  ngOnChanges(changes: SimpleChanges) {
    // always reflect theme on change
    if (changes['ngxsmkButtonSpinnerTheme'] || changes['ngxsmkButtonSpinnerOptions']) {
      this.applyTheme();
    }

    if (changes['loading']) {
      if (this.loading) {
        this.applyTheme(); // make sure vars exist before injecting spinner
        this.addSpinner();
        this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');

        const keep =
          this.ngxsmkButtonSpinnerTheme?.keepLabel ??
          (this.ngxsmkButtonSpinnerOptions?.mode === 'overlay' && false);

        if (!keep) {
          // visually hide text (but keep layout)
          this.renderer.setStyle(this.el.nativeElement, 'color', 'transparent');
        }
      } else {
        this.removeSpinner();
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        this.renderer.removeStyle(this.el.nativeElement, 'color');
      }
    }
  }

  private addSpinner() {
    if (!this.spinnerEl) {
      const aria = this.ngxsmkButtonSpinnerOptions?.ariaLabel ?? 'Loading';

      const spinner = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(spinner, 'ngxsmk-inline-spinner');
      this.renderer.setAttribute(spinner, 'role', 'status');
      this.renderer.setAttribute(spinner, 'aria-label', aria);

      // overlay centered
      this.renderer.setStyle(spinner, 'position', 'absolute');
      this.renderer.setStyle(spinner, 'inset', '0');
      this.renderer.setStyle(spinner, 'display', 'flex');
      this.renderer.setStyle(spinner, 'alignItems', 'center');
      this.renderer.setStyle(spinner, 'justifyContent', 'center');

      this.renderer.appendChild(this.el.nativeElement, spinner);
      this.spinnerEl = spinner;
    }

    const dim = this.varOrDefault('--ngxsmk-dim-overlay', 'transparent');
    if (dim !== 'transparent' && !this.overlayEl) {
      const overlay = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(overlay, 'ngxsmk-dim');
      // full overlay behind spinner, above content
      this.renderer.setStyle(overlay, 'position', 'absolute');
      this.renderer.setStyle(overlay, 'inset', '0');
      this.renderer.setStyle(overlay, 'pointer-events', 'none');
      this.renderer.appendChild(this.el.nativeElement, overlay);
      this.overlayEl = overlay;
    }
  }

  private removeSpinner() {
    if (this.spinnerEl) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerEl);
      this.spinnerEl = null;
    }
    if (this.overlayEl) {
      this.renderer.removeChild(this.el.nativeElement, this.overlayEl);
      this.overlayEl = null;
    }
  }

  /** Apply CSS variables to host based on provided theme */
  private applyTheme() {
    const host = this.el.nativeElement;
    const t = this.ngxsmkButtonSpinnerTheme ?? {};

    // Defaults
    const color = t.color ?? 'currentColor';
    const track = t.trackColor ?? 'transparent';
    const thickness = t.thickness ?? '2px';
    const size = t.size ?? '1.2em';
    const speedMs = t.speedMs ?? 700;
    const dimOverlay = t.dimOverlay ?? 'transparent';

    this.renderer.setStyle(host, '--ngxsmk-color', color);
    this.renderer.setStyle(host, '--ngxsmk-track', track);
    this.renderer.setStyle(host, '--ngxsmk-thickness', thickness);
    this.renderer.setStyle(host, '--ngxsmk-size', size);
    this.renderer.setStyle(host, '--ngxsmk-speed', `${speedMs}ms`);
    this.renderer.setStyle(host, '--ngxsmk-dim-overlay', dimOverlay);
  }

  /** read current computed var (for dim overlay decision) */
  private varOrDefault(name: string, fallback: string): string {
    const val = getComputedStyle(this.el.nativeElement).getPropertyValue(name);
    return (val && val.trim().length) ? val.trim() : fallback;
  }

  /** Inject a global <style> once per app with CSS variables; no user stylesheet needed */
  private ensureGlobalStyle() {
    if (document.getElementById('ngxsmk-btn-spinner-style')) return;

    const styleEl = this.renderer.createElement('style');
    styleEl.id = 'ngxsmk-btn-spinner-style';
    styleEl.textContent = `
      /* Spinner base uses host CSS variables */
      .ngxsmk-inline-spinner {
        width: var(--ngxsmk-size, 1.2em);
        height: var(--ngxsmk-size, 1.2em);
        border: var(--ngxsmk-thickness, 2px) solid var(--ngxsmk-color, currentColor);
        border-right-color: var(--ngxsmk-track, transparent);
        border-radius: 50%;
        animation: ngxsmk-spin var(--ngxsmk-speed, 700ms) linear infinite;
        opacity: 0.95;
      }
      .ngxsmk-dim {
        background: var(--ngxsmk-dim-overlay, transparent);
        border-radius: inherit;
      }
      @keyframes ngxsmk-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(styleEl);
  }
}
