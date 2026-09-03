import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { LucideCheck, LucideHeart, LucideX } from '@lucide/angular';
import { InboxService } from '../../core/services/inbox.service';
import { MatchActivityService, type MemberActivityKind } from '../../core/services/match-activity.service';
import { MemberMatch } from './match-profile.model';
import { MemberProfileDialogComponent } from './member-profile-dialog.component';

/** Saved-list panel: cards with the main details, plus View and Remove. */
@Component({
  selector: 'app-member-activity-dialog',
  imports: [LucideCheck, LucideHeart, LucideX, MemberProfileDialogComponent],
  templateUrl: './member-activity-dialog.component.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class MemberActivityDialogComponent {
  private readonly activity = inject(MatchActivityService);
  private readonly inbox = inject(InboxService);

  readonly kind = input.required<MemberActivityKind>();
  readonly closed = output<void>();

  readonly members = computed(() =>
    this.kind() === 'shortlist' ? this.activity.shortlistedMembers() : this.activity.interestedMembers(),
  );
  readonly title = computed(() => (this.kind() === 'shortlist' ? 'Shortlist' : 'My Interest'));
  readonly caption = computed(() =>
    this.kind() === 'shortlist'
      ? 'Profiles you saved to look at again'
      : 'Families you have reached out to',
  );
  readonly emptyText = computed(() =>
    this.kind() === 'shortlist'
      ? 'Shortlist a profile from Matches and it will wait for you here.'
      : 'Send interest from Matches and the family will appear here.',
  );

  readonly selected = signal<MemberMatch | null>(null);
  readonly pendingRemove = signal<MemberMatch | null>(null);
  readonly notice = signal<string | null>(null);
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previous;
      clearTimeout(this.noticeTimer);
    });
  }

  isShortlisted(id: string): boolean {
    return this.activity.isShortlisted(id);
  }

  isInterested(id: string): boolean {
    return this.activity.isInterested(id);
  }

  openProfile(member: MemberMatch): void {
    this.selected.set(member);
  }

  onToggleShortlist(member: MemberMatch): void {
    if (this.isShortlisted(member.id)) {
      this.askRemove(member);
    }
  }

  onExpressInterest(member: MemberMatch): void {
    const { already, name } = this.activity.expressInterest(member);
    if (already) {
      return;
    }
    this.showNotice(`Interest sent to ${name}.`);
    if (this.selected()?.id === member.id) {
      this.selected.set(null);
    }
  }

  askRemove(member: MemberMatch): void {
    this.pendingRemove.set(member);
  }

  confirmRemove(): void {
    const member = this.pendingRemove();
    if (!member) {
      return;
    }
    this.pendingRemove.set(null);
    if (this.kind() === 'shortlist') {
      this.activity.toggleShortlist(member);
      this.showNotice(`${member.name} has been removed from your shortlist.`);
    } else {
      this.activity.withdrawInterest(member);
      this.showNotice(`Interest to ${member.name} has been removed.`);
    }
    if (this.selected()?.id === member.id) {
      this.selected.set(null);
    }
  }

  openMessage(member: MemberMatch): void {
    this.closed.emit();
    this.inbox.openInbox(member.id);
  }

  onEscape(): void {
    if (this.pendingRemove()) {
      this.pendingRemove.set(null);
      return;
    }
    if (this.selected()) {
      this.selected.set(null);
      return;
    }
    this.closed.emit();
  }

  private showNotice(message: string): void {
    clearTimeout(this.noticeTimer);
    this.notice.set(message);
    this.noticeTimer = setTimeout(() => this.notice.set(null), 3500);
  }
}
