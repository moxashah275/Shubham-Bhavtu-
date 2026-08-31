import { Component, computed, inject, signal } from '@angular/core';
import { LucideSparkles, LucideX } from '@lucide/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { buildBiodataContent } from '../../../../shared/biodata/biodata-content';
import { BiodataDocumentComponent } from '../../../../shared/biodata/biodata-document.component';
import { BiodataTemplateCardComponent } from '../../../../shared/biodata/biodata-template-card.component';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';
import {
  BIODATA_TEMPLATES,
  biodataTemplateById,
  biodataTemplateNumber,
} from '../../../../shared/biodata/biodata-templates';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-biodata-page',
  imports: [
    BiodataDocumentComponent,
    BiodataTemplateCardComponent,
    PaginationComponent,
    LucideSparkles,
    LucideX,
  ],
  templateUrl: './biodata.component.html',
})
export class BiodataPageComponent {
  private readonly auth = inject(AuthService);

  /** Same content in the gallery and in the opened sheet, so a design never looks different. */
  readonly content = computed(() => buildBiodataContent(this.auth.user()));

  readonly page = signal(1);
  readonly totalPages = Math.max(1, Math.ceil(BIODATA_TEMPLATES.length / PAGE_SIZE));
  readonly pages = Array.from({ length: this.totalPages }, (_, index) => index + 1);
  readonly pageTemplates = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return BIODATA_TEMPLATES.slice(start, start + PAGE_SIZE);
  });

  readonly selectedId = signal('');
  readonly selectedTemplate = computed(() => biodataTemplateById(this.selectedId()));
  readonly previewOpen = computed(() => Boolean(this.selectedId()));

  templateNumber(id: string): string {
    return biodataTemplateNumber(id);
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages));
  }

  select(id: string): void {
    this.selectedId.set(id);
  }

  closePreview(): void {
    this.selectedId.set('');
  }

  keepOpen(event: Event): void {
    event.stopPropagation();
  }
}
