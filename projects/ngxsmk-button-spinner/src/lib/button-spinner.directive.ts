import {
  AfterViewInit,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {NgxSmkButtonSpinnerOptions, NgxSmkButtonSpinnerTheme} from './types';


@Directive({
  selector: '[ngxsmkButtonSpinner]',
  standalone: true
})
export class NgxSmkButtonSpinnerDirective implements OnChanges, AfterViewInit {
  /** Primary boolean: show/hide spinner */
  @Input('ngxsmkButtonSpinner') loading = false;

  /** NEW: hide label & center spinner while loading */
  @Input() ngxsmkButtonSpinnerHideLabel = false;

  /** Optional a11y/theme */
  @Input() ngxsmkButtonSpinnerOptions?: NgxSmkButtonSpinnerOptions;
  @Input() ngxsmkButtonSpinnerTheme?: NgxSmkButtonSpinnerTheme;

  private spinnerEl: HTMLElement | null = null;
  private readonly isBrowser: boolean;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser =
      isPlatformBrowser(platformId) &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    // Base host setup (SSR-safe)
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) this.ensureGlobalStyle();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ngxsmkButtonSpinnerTheme']) this.applyTheme();

    if (changes['loading'] || changes['ngxsmkButtonSpinnerHideLabel']) {
      if (this.loading) {
        this.applyTheme();
        this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
        this.addSpinner();
        // Hide label visually only when requested
        if (this.ngxsmkButtonSpinnerHideLabel) {
          this.renderer.setStyle(this.el.nativeElement, 'color', 'transparent');
        } else {
          this.renderer.removeStyle(this.el.nativeElement, 'color');
        }
      } else {
        this.removeSpinner();
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        this.renderer.removeStyle(this.el.nativeElement, 'color');
      }
    }
  }

  private addSpinner() {
    if (!this.isBrowser) return;
    if (!this.spinnerEl) {
      const aria = this.ngxsmkButtonSpinnerOptions?.ariaLabel ?? 'Loading';

      const spinner = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(spinner, 'ngxsmk-inline-spinner');
      this.renderer.setAttribute(spinner, 'role', 'status');
      this.renderer.setAttribute(spinner, 'aria-label', aria);

      if (this.ngxsmkButtonSpinnerHideLabel) {
        // CENTER OVERLAY
        this.renderer.setStyle(spinner, 'position', 'absolute');
        this.renderer.setStyle(spinner, 'inset', '0');
        this.renderer.setStyle(spinner, 'display', 'flex');
        this.renderer.setStyle(spinner, 'alignItems', 'center');
        this.renderer.setStyle(spinner, 'justifyContent', 'center');
        this.renderer.setStyle(spinner, 'pointer-events', 'none');
      } else {
        // INLINE AFTER TEXT WITH GAP
        this.renderer.setStyle(spinner, 'display', 'inline-block');
        this.renderer.setStyle(spinner, 'margin-left', '0.5em'); // gap
        this.renderer.setStyle(spinner, 'vertical-align', 'middle');
      }

      this.renderer.appendChild(this.el.nativeElement, spinner);
      this.spinnerEl = spinner;
    }
  }

  private removeSpinner() {
    if (!this.isBrowser) {
      this.spinnerEl = null;
      return;
    }
    if (this.spinnerEl) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerEl);
      this.spinnerEl = null;
    }
  }

  private applyTheme() {
    const host = this.el.nativeElement;
    const t = this.ngxsmkButtonSpinnerTheme ?? {};
    const color = t.color ?? 'currentColor';
    const track = t.trackColor ?? 'transparent';
    const thickness = t.thickness ?? '2px';
    const size = t.size ?? '1.2em';
    const speedMs = t.speedMs ?? 700;

    this.renderer.setStyle(host, '--ngxsmk-color', color);
    this.renderer.setStyle(host, '--ngxsmk-track', track);
    this.renderer.setStyle(host, '--ngxsmk-thickness', thickness);
    this.renderer.setStyle(host, '--ngxsmk-size', size);
    this.renderer.setStyle(host, '--ngxsmk-speed', `${speedMs}ms`);
  }

  private ensureGlobalStyle() {
    if (document.getElementById('ngxsmk-btn-spinner-style')) return;

    const styleEl = this.renderer.createElement('style');
    styleEl.id = 'ngxsmk-btn-spinner-style';
    styleEl.textContent = `
      .ngxsmk-inline-spinner {
        width: var(--ngxsmk-size, 1.2em);
        height: var(--ngxsmk-size, 1.2em);
        border: var(--ngxsmk-thickness, 2px) solid var(--ngxsmk-color, currentColor);
        border-right-color: var(--ngxsmk-track, transparent);
        border-radius: 50%;
        animation: ngxsmk-spin var(--ngxsmk-speed, 700ms) linear infinite;
        opacity: 0.95;
      }
      @keyframes ngxsmk-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(styleEl);
  }
}
