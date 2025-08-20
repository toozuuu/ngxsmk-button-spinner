import {
  AfterViewInit, Directive, ElementRef, Inject, Input,
  PLATFORM_ID, Renderer2, Signal, isSignal, effect
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSmkButtonSpinnerOptions, NgxSmkButtonSpinnerTheme } from './types';

@Directive({
  selector: '[ngxsmkButtonSpinner]',
  standalone: true,
})
export class NgxSmkButtonSpinnerDirective implements AfterViewInit {
  /** loading: boolean | Signal<boolean> */
  @Input('ngxsmkButtonSpinner') set ngxsmkButtonSpinner(v: boolean | Signal<boolean>) {
    this._loadingSrc = v;
    this.setLoading(this.read(v));
  }

  /** true → overlay/centered (hide label), false → inline after text */
  @Input() set ngxsmkButtonSpinnerHideLabel(v: boolean | Signal<boolean>) {
    this._hideSrc = v;
    if (this.read(this._loadingSrc)) {
      this.ensureLabelWrapper();
      this.configureSpinnerLayout();
      this.applyLabelVisibility();
    }
  }

  /** a11y options (setter so we can update aria-label immediately) */
  @Input() set ngxsmkButtonSpinnerOptions(v: NgxSmkButtonSpinnerOptions | undefined) {
    this._opts = v ?? {};
    // if spinner exists, refresh aria
    if (this.spinnerEl) {
      this.renderer.setAttribute(this.spinnerEl, 'aria-label', this._opts.ariaLabel ?? 'Loading');
    }
  }

  /** THEME setter — push CSS vars immediately on every change */
  @Input() set ngxsmkButtonSpinnerTheme(v: NgxSmkButtonSpinnerTheme | undefined) {
    this._theme = v ?? {};
    this.applyTheme(); // <- immediate & reliable
  }

  private spinnerEl: HTMLElement | null = null;     // the ring
  private labelEl: HTMLElement | null = null;       // wraps existing content
  private overlayBoxEl: HTMLElement | null = null;  // grid-centering box (overlay mode)

  private readonly isBrowser: boolean;
  private _loadingSrc: boolean | Signal<boolean> = false;
  private _hideSrc: boolean | Signal<boolean> = false;
  private _theme: NgxSmkButtonSpinnerTheme = {};
  private _opts: NgxSmkButtonSpinnerOptions = {};

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser =
      isPlatformBrowser(platformId) &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    // base host setup
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setAttribute(this.el.nativeElement, 'aria-live', 'polite');

    // react to Signals (only loading/hideLabel; theme handled by setter)
    effect(() => {
      const loading = this.read(this._loadingSrc);
      const hide = this.read(this._hideSrc);
      if (isSignal(this._loadingSrc) || isSignal(this._hideSrc)) {
        this.setLoading(loading);
        if (loading) {
          this.ensureLabelWrapper();
          this.configureSpinnerLayout();
          this.applyLabelVisibility();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) this.ensureGlobalStyle();
    // ensure theme vars exist even if theme was set before view init
    this.applyTheme();
  }

  // ---------- core ----------

  private read(v: boolean | Signal<boolean>): boolean { return isSignal(v) ? !!v() : !!v; }

  private setLoading(isLoading: boolean) {
    const host = this.el.nativeElement;
    this.renderer.setAttribute(host, 'aria-busy', String(isLoading));

    if (isLoading) {
      this.renderer.setAttribute(host, 'disabled', 'true');
      this.ensureLabelWrapper();
      this.addSpinner();
      this.configureSpinnerLayout();
      this.applyLabelVisibility();
    } else {
      this.removeOverlayBox();
      this.removeSpinner();
      this.renderer.removeAttribute(host, 'disabled');
      if (this.labelEl) this.renderer.setStyle(this.labelEl, 'visibility', 'visible');
    }
  }

  /** Wrap all existing nodes so we can hide/show label reliably */
  private ensureLabelWrapper() {
    if (!this.isBrowser || this.labelEl) return;

    const host = this.el.nativeElement;
    const label = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(label, 'ngxsmk-label');
    this.renderer.setStyle(label, 'display', 'inline');

    const nodes = Array.from(host.childNodes);
    for (const node of nodes) {
      if (this.spinnerEl && node === this.spinnerEl) continue;
      this.renderer.appendChild(label, node);
    }
    this.renderer.appendChild(host, label);
    this.labelEl = label;
  }

  private applyLabelVisibility() {
    if (!this.labelEl) return;
    const hide = this.read(this._hideSrc);
    this.renderer.setStyle(this.labelEl, 'visibility', hide ? 'hidden' : 'visible');
  }

  private addSpinner() {
    if (!this.isBrowser || this.spinnerEl) return;
    const aria = this._opts.ariaLabel ?? 'Loading';
    const sp = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(sp, 'ngxsmk-inline-spinner');
    this.renderer.setAttribute(sp, 'role', 'status');
    this.renderer.setAttribute(sp, 'aria-label', aria);
    this.renderer.appendChild(this.el.nativeElement, sp);
    this.spinnerEl = sp;
  }

  private removeSpinner() {
    if (!this.isBrowser) { this.spinnerEl = null; return; }
    if (this.spinnerEl) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerEl);
      this.spinnerEl = null;
    }
  }

  /** Create overlay box (grid centered) and move spinner inside it */
  private ensureOverlayBox() {
    if (!this.isBrowser) return;
    if (!this.overlayBoxEl) {
      const box = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(box, 'ngxsmk-overlay-box');
      this.renderer.setStyle(box, 'position', 'absolute');
      this.renderer.setStyle(box, 'inset', '0');
      this.renderer.setStyle(box, 'display', 'grid');
      this.renderer.setStyle(box, 'alignItems', 'center');
      this.renderer.setStyle(box, 'justifyItems', 'center');
      this.renderer.setStyle(box, 'pointerEvents', 'none');
      this.renderer.setStyle(box, 'zIndex', '1');
      this.renderer.appendChild(this.el.nativeElement, box);
      this.overlayBoxEl = box;
    }
    if (this.spinnerEl && this.spinnerEl.parentElement !== this.overlayBoxEl) {
      this.renderer.appendChild(this.overlayBoxEl, this.spinnerEl);
      this.renderer.setStyle(this.spinnerEl, 'position', 'static');
      this.renderer.removeStyle(this.spinnerEl, 'margin-left');
      this.renderer.removeStyle(this.spinnerEl, 'vertical-align');
      this.renderer.removeStyle(this.spinnerEl, 'top');
      this.renderer.removeStyle(this.spinnerEl, 'left');
      this.renderer.removeStyle(this.spinnerEl, 'transform');
    }
  }

  private removeOverlayBox() {
    if (!this.overlayBoxEl) return;
    if (this.spinnerEl && this.spinnerEl.parentElement === this.overlayBoxEl) {
      this.renderer.appendChild(this.el.nativeElement, this.spinnerEl);
    }
    this.renderer.removeChild(this.el.nativeElement, this.overlayBoxEl);
    this.overlayBoxEl = null;
  }

  /** Position spinner depending on mode */
  private configureSpinnerLayout() {
    if (!this.spinnerEl) return;
    const overlay = this.read(this._hideSrc);

    if (overlay) {
      this.ensureOverlayBox(); // centers via grid box
    } else {
      this.removeOverlayBox();
      this.renderer.setStyle(this.spinnerEl, 'position', 'static');
      this.renderer.setStyle(this.spinnerEl, 'display', 'inline-block');
      this.renderer.setStyle(this.spinnerEl, 'margin-left', '0.5em');
      this.renderer.setStyle(this.spinnerEl, 'vertical-align', 'middle');
    }
  }

  // ---------- theme + styles ----------

  private applyTheme() {
    const host = this.el.nativeElement;
    const t = this._theme;
    this.renderer.setStyle(host, '--ngxsmk-color', t.color ?? 'currentColor');
    this.renderer.setStyle(host, '--ngxsmk-track', t.trackColor ?? 'transparent');
    this.renderer.setStyle(host, '--ngxsmk-thickness', t.thickness ?? '2px');
    this.renderer.setStyle(host, '--ngxsmk-size', t.size ?? '1.2em');
    this.renderer.setStyle(host, '--ngxsmk-speed', `${t.speedMs ?? 700}ms`);
  }

  private ensureGlobalStyle() {
    if (!this.isBrowser) return;
    if (document.getElementById('ngxsmk-btn-spinner-style')) return;

    const styleEl = this.renderer.createElement('style');
    styleEl.id = 'ngxsmk-btn-spinner-style';
    styleEl.textContent = `
      .ngxsmk-inline-spinner {
        width: var(--ngxsmk-size, 1.2em);
        height: var(--ngxsmk-size, 1.2em);
        box-sizing: border-box;
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
