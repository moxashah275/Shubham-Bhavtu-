import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHeart } from '@lucide/angular';
import { InboxService } from '../../../../core/services/inbox.service';
import { MatchActivityService } from '../../../../core/services/match-activity.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MemberMatch } from '../../../../shared/matches/match-profile.model';
import { MemberProfileCardComponent } from '../../../../shared/matches/member-profile-card.component';

@Component({
  selector: 'app-shortlist-page',
  imports: [RouterLink, MemberProfileCardComponent, LucideHeart],
  templateUrl: './shortlist.component.html',
})
export class ShortlistPageComponent {
  private readonly toast = inject(ToastService);
  private readonly activity = inject(MatchActivityService);
  private readonly inbox = inject(InboxService);

  readonly selectedId = signal<string | null>(null);
  readonly members = this.activity.shortlistedMembers;
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
      document.getElementById('shortlist-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      if (this.selectedId() === member.id) {
        this.selectedId.set(null);
      }
      return;
    }
    this.toast.show(`${name} added to your shortlist.`);
  }

  expressInterest(member: MemberMatch): void {
    const { already, name } = this.activity.expressInterest(member);
    if (already) {
      this.toast.show(`You already sent interest to ${name}.`);
      return;
    }
    this.toast.show(`Interest sent to ${name}.`);
  }

  openMessage(member: MemberMatch): void {
    this.inbox.openInbox(member.id);
  }
}
