import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCrown,
  LucideDynamicIcon,
  LucideHeart,
  LucideSparkles,
  type LucideIcon,
} from '@lucide/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-membership-page',
  imports: [RouterLink, PageHeroComponent, LucideDynamicIcon],
  templateUrl: './membership.component.html',
})
export class MembershipPageComponent {
  private readonly auth = inject(AuthService);
  readonly startLink = computed(() => (this.auth.isAuthenticated() ? '/contact' : '/register'));
  readonly plans: {
    icon: LucideIcon;
    name: string;
    price: string;
    copy: string;
    features: string[];
    featured: boolean;
  }[] = [
    {
      icon: LucideHeart,
      name: 'Complimentary',
      price: 'Free',
      copy: 'Begin with a verified profile and a calm, private search.',
      features: ['Create and edit your profile', 'Browse verified members', 'Save matches you like'],
      featured: false,
    },
    {
      icon: LucideSparkles,
      name: 'Gold',
      price: '₹2,199 / 3 months',
      copy: 'A subscription for families who want introductions to move with care.',
      features: ['See who viewed your profile', 'Send interests with context', 'Priority profile review'],
      featured: true,
    },
    {
      icon: LucideCrown,
      name: 'Premium',
      price: '₹4,499 / 6 months',
      copy: 'The fullest Gathbandhan membership — highlighted, personal, and unhurried.',
      features: ['Highlighted in search', 'Dedicated care support', 'Guided family introductions'],
      featured: false,
    },
  ];
}
