import { Component } from '@angular/core';
import {
  LucideBadgeCheck,
  LucideDynamicIcon,
  LucideHeartHandshake,
  LucideShieldCheck,
  LucideUsers,
  type LucideIcon,
} from '@lucide/angular';

@Component({
  selector: 'app-site-highlights',
  imports: [LucideDynamicIcon],
  templateUrl: './site-highlights.component.html',
})
export class SiteHighlightsComponent {
  readonly stats = [
    { value: '10.5+', label: 'Years of trust' },
    { value: '10.5 Lakh+', label: 'Verified members' },
    { value: '2 Lakh+', label: 'Matches made' },
    { value: '1000+', label: 'Cities across India' },
  ];

  readonly details: { icon: LucideIcon; title: string; copy: string }[] = [
    {
      icon: LucideBadgeCheck,
      title: 'Verified profiles',
      copy: 'Every member is reviewed so you meet people with real names, real photos, and genuine intent.',
    },
    {
      icon: LucideUsers,
      title: 'Match by what matters',
      copy: 'Search by religion, community, age, and lifestyle — the way Indian families actually choose.',
    },
    {
      icon: LucideHeartHandshake,
      title: 'Family-first introductions',
      copy: 'Profiles are presented with care, so conversations begin with respect for both families.',
    },
    {
      icon: LucideShieldCheck,
      title: 'Private and secure',
      copy: 'Your details stay with you. Contact is shared only when you choose to take the next step.',
    },
  ];
}
