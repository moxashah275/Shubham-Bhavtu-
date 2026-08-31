import { Component } from '@angular/core';
import { HeroBannerComponent } from '../../../../shared/hero/hero-banner.component';
import { MatchCardComponent } from '../../../../shared/matches/match-card.component';
import { FEATURED_MATCHES } from '../../../../shared/matches/match-profile.model';
import { PartnerSearchComponent } from '../../../../shared/search/partner-search.component';
import { SiteHighlightsComponent } from '../../../../shared/trust/site-highlights.component';

@Component({
  selector: 'app-home-page',
  imports: [HeroBannerComponent, PartnerSearchComponent, SiteHighlightsComponent, MatchCardComponent],
  templateUrl: './home.component.html',
})
export class HomePageComponent {
  readonly matches = FEATURED_MATCHES;
  readonly steps = [
    { number: '01', title: 'Create your profile', copy: 'Share who you are with the same care you would bring to a first meeting.' },
    { number: '02', title: 'Discover matches', copy: 'Browse verified profiles chosen for values, lifestyle, and genuine intent.' },
    { number: '03', title: 'Begin the journey', copy: 'Connect with families and start a story that feels like home.' },
  ];
}
