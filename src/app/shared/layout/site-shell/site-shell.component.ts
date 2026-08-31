import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InboxService } from '../../../core/services/inbox.service';
import { MatchActivityService } from '../../../core/services/match-activity.service';
import { MemberActivityDialogComponent } from '../../matches/member-activity-dialog.component';
import { InboxDialogComponent } from '../../messages/inbox-dialog.component';
import { SearchDialogComponent } from '../../search/search-dialog.component';
import { ToastComponent } from '../../ui/toast/toast.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { SiteNavbarComponent } from '../site-navbar/site-navbar.component';

@Component({
  selector: 'app-site-shell',
  imports: [
    RouterOutlet,
    SiteNavbarComponent,
    SiteFooterComponent,
    ToastComponent,
    SearchDialogComponent,
    MemberActivityDialogComponent,
    InboxDialogComponent,
  ],
  template: `
    <div class="flex min-h-dvh flex-col bg-ivory">
      <app-site-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-site-footer />
      <app-search-dialog />
      @if (activity.panel(); as kind) {
        <app-member-activity-dialog [kind]="kind" (closed)="activity.closePanel()" />
      }
      @if (inbox.open()) {
        <app-inbox-dialog />
      }
      <app-toast />
    </div>
  `,
})
export class SiteShellComponent {
  readonly activity = inject(MatchActivityService);
  readonly inbox = inject(InboxService);
}
