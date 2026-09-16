import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authenticationRoutes } from './features/authentication/authentication.routes';
import { BiodataPageComponent } from './features/dashboard/pages/biodata/biodata.component';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { InterestPageComponent } from './features/dashboard/pages/interest/interest.component';
import { ShortlistPageComponent } from './features/dashboard/pages/shortlist/shortlist.component';
import { MatchesPageComponent } from './features/dashboard/pages/matches/matches.component';
import { ProfilePageComponent } from './features/dashboard/pages/profile/profile.component';
import { SettingsPageComponent } from './features/dashboard/pages/settings/settings.component';
import { AboutPageComponent } from './features/home/pages/about/about.component';
import { ContactPageComponent } from './features/home/pages/contact/contact.component';
import { EventsPageComponent } from './features/home/pages/events/events.component';
import { GalleryPageComponent } from './features/home/pages/gallery/gallery.component';
import { HomePageComponent } from './features/home/pages/home/home.component';
import { FaqPageComponent } from './features/home/pages/faq/faq.component';
import { MembershipPageComponent } from './features/home/pages/membership/membership.component';
import { SubscriptionPageComponent } from './features/home/pages/subscription/subscription.component';
import { SiteShellComponent } from './shared/layout/site-shell/site-shell.component';

export const routes: Routes = [
  ...authenticationRoutes,
  {
    path: '',
    component: SiteShellComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'about',
        component: AboutPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'contact',
        component: ContactPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'events',
        component: EventsPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'gallery',
        component: GalleryPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'membership',
        component: MembershipPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'subscription',
        component: SubscriptionPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'faq',
        component: FaqPageComponent,
        title: 'Gathbandhan',
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
      {
        path: 'matches',
        component: MatchesPageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
      {
        path: 'interest',
        component: InterestPageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
      {
        path: 'shortlist',
        component: ShortlistPageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
      {
        path: 'biodata',
        component: BiodataPageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        component: ProfilePageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
      {
        path: 'settings',
        component: SettingsPageComponent,
        title: 'Gathbandhan',
        canActivate: [authGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
