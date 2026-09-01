import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHeart } from '@lucide/angular';
import { InboxService } from '../../../../core/services/inbox.service';
import { MatchActivityService } from '../../../../core/services/match-activity.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MemberMatch } from '../../../../shared/matches/match-profile.model';
import { MemberProfileCardComponent } from '../../../../shared/matches/member-profile-card.component';

@Component({
  selector: 'app-interest-page',
  imports: [RouterLink, MemberProfileCardComponent, LucideHeart],
  templateUrl: './interest.component.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class InterestPageComponent {
  private readonly toast = inject(ToastService);
  private readonly activity = inject(MatchActivityService);
  private readonly inbox = inject(InboxService);

  readonly selectedId = signal<string | null>(null);
  readonly pendingRemove = signal<MemberMatch | null>(null);
  readonly members = this.activity.interestedMembers;
  readonly selected = computed(() => {
    const items = this.members();
    if (!items.length) {
      return null;
    }
    const id = this.selectedId();
    if (id) {
      const match = items.find((member) => member.id === id);
      if (match) {
        return match;
      }
    }
    return items[0];
  });

  select(member: MemberMatch): void {
    this.selectedId.set(member.id);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      document.getElementById('interest-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onEscape(): void {
    this.pendingRemove.set(null);
  }

  isShortlisted(id: string): boolean {
    return this.activity.isShortlisted(id);
  }

  isInterested(id: string): boolean {
    return this.activity.isInterested(id);
  }

  toggleShortlist(member: MemberMatch): void {
    const { added, name } = this.activity.toggleShortlist(member);
    if (!added) {
      this.toast.show(`${name} removed from shortlist.`);
      return;
    }
    this.toast.show(`${name} added to your shortlist.`);
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
    const { name } = this.activity.withdrawInterest(member);
    this.toast.show(`Interest to ${name} has been removed.`);
  }

  openMessage(member: MemberMatch): void {
    this.inbox.openInbox(member.id);
  }
}
