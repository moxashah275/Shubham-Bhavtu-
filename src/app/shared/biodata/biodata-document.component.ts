import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import type { BiodataContent, BiodataTemplate } from './biodata.model';

/**
 * Prints one biodata sheet. Content is shared by every template — only the
 * layout, heading style and theme change, so new designs need a template
 * entry, not new markup.
 */
@Component({
  selector: 'app-biodata-document',
  imports: [NgTemplateOutlet, LucideDynamicIcon],
  templateUrl: './biodata-document.component.html',
})
export class BiodataDocumentComponent {
  readonly template = input.required<BiodataTemplate>();
  readonly content = input.required<BiodataContent>();

  readonly theme = computed(() => this.template().theme);
  readonly layout = computed(() => this.template().layout);
  readonly heading = computed(() => this.template().heading);
  readonly serif = computed(() => this.template().serif);
  /** Panel sits on the left for every layout except the mirrored one. */
  readonly panelFirst = computed(() => this.layout() !== 'panel-right');
  readonly lightPanel = computed(() => this.layout() === 'light-left');
  readonly frame = computed(() => this.template().frame ?? 'double');
  readonly framed = computed(() => this.layout() === 'framed-center' || this.layout() === 'framed-side');
  /** Only the temple frame draws the saw-tooth band along the top and bottom. */
  readonly templeFrame = computed(() => this.frame() === 'temple');
  readonly cornerOrnaments = computed(() => this.frame() === 'corner' || this.frame() === 'floral');

  /** Framed sheets print the personal details in two columns. */
  readonly profileInfoLeft = computed(() => {
    const fields = this.content().profileInfo;
    return fields.slice(0, Math.ceil(fields.length / 2));
  });
  readonly profileInfoRight = computed(() => {
    const fields = this.content().profileInfo;
    return fields.slice(Math.ceil(fields.length / 2));
  });
}
