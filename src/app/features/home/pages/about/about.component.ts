import { Component } from '@angular/core';
import {
  LucideHeart,
  LucideLanguages,
  LucideMapPin,
  LucideSparkles,
  type LucideIcon,
} from '@lucide/angular';
import { AppImages } from '../../../../core/assets/app-images';
import { FeatureCardComponent } from '../../../../shared/ui/feature-card/feature-card.component';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-about-page',
  imports: [PageHeroComponent, FeatureCardComponent],
  templateUrl: './about.component.html',
})
export class AboutPageComponent {
  readonly storyImage = AppImages.about.story;

  readonly services: { icon: LucideIcon; title: string; copy: string }[] = [
    {
      icon: LucideHeart,
      title: 'Built for both families',
      copy: 'Parents and the couple stay in the same conversation, so every introduction begins with respect on both sides.',
    },
    {
      icon: LucideSparkles,
      title: 'Tradition, designed for today',
      copy: 'We honour custom without making the search feel old — a calm, modern home for a very Indian occasion.',
    },
    {
      icon: LucideLanguages,
      title: 'Every community, in its own voice',
      copy: 'Faith, language, and lifestyle are treated as part of the person, not as filters to rush past.',
    },
    {
      icon: LucideMapPin,
      title: 'With you after the first hello',
      copy: 'Guidance does not end at an introduction. We remain a quiet presence if families need us.',
    },
  ];
}
