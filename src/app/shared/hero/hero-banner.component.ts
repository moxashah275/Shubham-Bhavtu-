import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHeart } from '@lucide/angular';
import { AppImages } from '../../core/assets/app-images';

@Component({
  selector: 'app-hero-banner',
  imports: [RouterLink, LucideHeart],
  templateUrl: './hero-banner.component.html',
})
export class HeroBannerComponent {
  readonly eyebrow = input("India's most trusted matrimony");
  readonly title = input('Find your someone special');
  readonly subtitle = input(
    'Join genuine members, explore verified profiles, and begin a beautiful journey with someone who feels like home.',
  );
  readonly ctaLabel = input('AI Matches');
  readonly ctaLink = input('/login');
  readonly ctaQuery = input<Record<string, string>>({});
  readonly ctaClick = output<MouseEvent>();
  readonly imageSrc = input(AppImages.home.heroCouple);
  readonly sideImageSrc = input(AppImages.home.heroSide);

  onCta(event: MouseEvent): void {
    this.ctaClick.emit(event);
  }
}
