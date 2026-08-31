import { Component, computed, signal } from '@angular/core';
import { AppImages } from '../../../../core/assets/app-images';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';

interface GalleryItem {
  src: string;
  alt: string;
}

const WEDDING_PAGE_SIZE = 6;

@Component({
  selector: 'app-gallery-page',
  imports: [PaginationComponent],
  templateUrl: './gallery.component.html',
})
export class GalleryPageComponent {
  readonly weddings: GalleryItem[] = [
    { src: AppImages.matches.ahmedabad, alt: 'Wedding in Ahmedabad' },
    { src: AppImages.matches.jaipur, alt: 'Wedding in Jaipur' },
    { src: AppImages.matches.mumbai, alt: 'Wedding in Mumbai' },
    { src: AppImages.matches.surat, alt: 'Wedding in Surat' },
    { src: AppImages.matches.vadodara, alt: 'Wedding in Vadodara' },
    { src: AppImages.matches.rajkot, alt: 'Wedding in Rajkot' },
    { src: AppImages.matches.pune, alt: 'Wedding in Pune' },
    { src: AppImages.matches.udaipur, alt: 'Wedding in Udaipur' },
    { src: AppImages.matches.gandhinagar, alt: 'Wedding in Gandhinagar' },
    { src: AppImages.matches.bhavnagar, alt: 'Wedding in Bhavnagar' },
    { src: AppImages.matches.ajmer, alt: 'Wedding in Ajmer' },
    { src: AppImages.matches.nashik, alt: 'Wedding in Nashik' },
  ];

  readonly events: GalleryItem[] = [
    { src: AppImages.events.matrimonyMeet, alt: 'Matrimony meet' },
    { src: AppImages.events.garbaNight, alt: 'Garba night' },
    { src: AppImages.events.familyMeet, alt: 'Family meet' },
    { src: AppImages.events.workshop, alt: 'Guidance session' },
    { src: AppImages.events.templeGathering, alt: 'Temple gathering' },
    { src: AppImages.events.pastGroup, alt: 'Past gathering' },
  ];

  readonly page = signal(1);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.weddings.length / WEDDING_PAGE_SIZE)));
  readonly pageWeddings = computed(() => {
    const start = (this.page() - 1) * WEDDING_PAGE_SIZE;
    return this.weddings.slice(start, start + WEDDING_PAGE_SIZE);
  });

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
