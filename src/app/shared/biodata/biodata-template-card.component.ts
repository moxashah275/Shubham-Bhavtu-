import { Component, input, output } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { BiodataDocumentComponent } from './biodata-document.component';
import type { BiodataContent, BiodataTemplate } from './biodata.model';

/** Gallery tile that shows a live, scaled-down preview of a template with the member's own details. */
@Component({
  selector: 'app-biodata-template-card',
  imports: [BiodataDocumentComponent, LucideCheck],
  templateUrl: './biodata-template-card.component.html',
})
export class BiodataTemplateCardComponent {
  readonly template = input.required<BiodataTemplate>();
  readonly content = input.required<BiodataContent>();
  readonly label = input('01');
  readonly selected = input(false);
  readonly chosen = output<string>();
}
