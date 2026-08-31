import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';
import { SocialLinksComponent } from '../../social/social-links.component';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, BrandMarkComponent, SocialLinksComponent],
  templateUrl: './site-footer.component.html',
})
export class SiteFooterComponent {
  private readonly auth = inject(AuthService);
  readonly homeLink = computed(() => (this.auth.isAuthenticated() ? '/dashboard' : '/'));
  readonly companyLinks = [
    { label: 'Our Story', path: '/about' },
    { label: 'Membership', path: '/membership' },
    { label: 'Careers', path: '/about' },
    { label: 'Partners', path: '/about' },
    { label: 'Media', path: '/about' },
  ];
  readonly resourceLinks = computed(() => [
    { label: 'How It Works', path: this.homeLink() },
    { label: 'Success Stories', path: this.homeLink() },
    { label: 'Safety Center', path: '/about' },
    { label: 'Community', path: '/contact' },
  ]);
  readonly supportLinks: { label: string; path: string; fragment?: string }[] = [
    { label: 'Help Center', path: '/contact' },
    { label: 'FAQ', path: '/contact' },
    { label: 'Report an Issue', path: '/contact' },
    { label: 'Contact Support', path: '/contact' },
  ];
  readonly legalLinks = [
    { label: 'Privacy', path: '/about' },
    { label: 'Terms', path: '/about' },
    { label: 'Cookies', path: '/about' },
    { label: 'Guidelines', path: '/about' },
  ];
}
