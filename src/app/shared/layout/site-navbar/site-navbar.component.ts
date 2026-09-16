import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideBadgeCheck,
  LucideBell,
  LucideCheck,
  LucideChevronDown,
  LucideDynamicIcon,
  LucideHeart,
  LucideLayoutTemplate,
  LucideLogOut,
  LucideMenu,
  LucideMessageCircle,
  LucideSparkles,
  LucideUsers,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { InboxService } from '../../../core/services/inbox.service';
import { MatchActivityService, type MemberActivityKind } from '../../../core/services/match-activity.service';
import { MatchSearchService } from '../../../core/services/match-search.service';
import { ProfileViewService } from '../../../core/services/profile-view.service';
import { BrandMarkComponent } from '../brand-mark/brand-mark.component';

interface NoticeItem {
  id: number;
  title: string;
  text: string;
  time: string;
  icon: LucideIcon;
  read: boolean;
}

@Component({
  selector: 'app-site-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    BrandMarkComponent,
    LucideBell,
    LucideCheck,
    LucideChevronDown,
    LucideDynamicIcon,
    LucideLayoutTemplate,
    LucideLogOut,
    LucideMenu,
    LucideMessageCircle,
    LucideSparkles,
    LucideX,
  ],
  templateUrl: './site-navbar.component.html',
  host: {
    class: 'sticky top-0 z-40 block',
    '(document:click)': 'onDocumentClick()',
  },
})
export class SiteNavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly matchSearch = inject(MatchSearchService);
  private readonly profileView = inject(ProfileViewService);
  readonly activity = inject(MatchActivityService);
  readonly inbox = inject(InboxService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly fullName = this.auth.fullName;
  readonly initials = computed(() => {
    const parts = this.fullName().trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'G';
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
    return `${first}${second}`.toUpperCase();
  });
  readonly profilePhotoUrl = computed(() => this.auth.user()?.profilePhoto?.trim() || '');
  readonly homeLink = computed(() => (this.isAuthenticated() ? '/dashboard' : '/'));
  readonly menuOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly noticesOpen = signal(false);
  readonly messagesOpen = signal(false);
  readonly healthOpen = signal(false);
  readonly biodataOpen = signal(false);
  readonly completion = this.auth.profileCompletion;
  readonly profileComplete = computed(() => this.completion().percent >= 100);
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly unreadMessages = this.inbox.unreadCount;
  /** Name on the newest unread thread, so the dropdown can say who wrote. */
  readonly newMessageFrom = computed(
    () => this.inbox.conversations().find((thread) => thread.unread > 0)?.name ?? '',
  );
  readonly shortlistCount = this.activity.shortlistCount;
  readonly interestCount = this.activity.interestCount;
  readonly notifications = signal<NoticeItem[]>([
    {
      id: 1,
      title: 'Trusted by families',
      text: 'Gathbandhan has been trusted by families for 10.5 years.',
      time: '2 min ago',
      icon: LucideBadgeCheck,
      read: false,
    },
    {
      id: 2,
      title: 'Verified members',
      text: '10.5 lakh+ verified members are looking for a genuine match.',
      time: '1 hour ago',
      icon: LucideUsers,
      read: false,
    },
    {
      id: 3,
      title: 'New matches',
      text: '12 new profiles match your preference this week.',
      time: 'Yesterday',
      icon: LucideHeart,
      read: false,
    },
  ]);

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
    this.closeDropdowns();
  }

  toggleProfile(event: Event): void {
    event.stopPropagation();
    this.profileOpen.update((open) => !open);
    this.noticesOpen.set(false);
    this.messagesOpen.set(false);
    this.healthOpen.set(false);
    this.biodataOpen.set(false);
  }

  toggleNotices(event: Event): void {
    event.stopPropagation();
    this.noticesOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.messagesOpen.set(false);
    this.healthOpen.set(false);
    this.biodataOpen.set(false);
  }

  toggleMessages(event: Event): void {
    event.stopPropagation();
    this.messagesOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.noticesOpen.set(false);
    this.healthOpen.set(false);
    this.biodataOpen.set(false);
  }

  toggleHealth(event: Event): void {
    event.stopPropagation();
    this.healthOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.noticesOpen.set(false);
    this.messagesOpen.set(false);
    this.biodataOpen.set(false);
  }

  toggleBiodata(event: Event): void {
    event.stopPropagation();
    this.biodataOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.noticesOpen.set(false);
    this.messagesOpen.set(false);
    this.healthOpen.set(false);
  }

  openBiodata(event: Event, mode: 'default' | 'ai'): void {
    event.stopPropagation();
    this.closeMenus();
    void this.router.navigate(['/biodata'], { queryParams: { mode } });
  }

  isBiodataActive(): boolean {
    return this.router.url.startsWith('/biodata');
  }

  openInbox(event: Event, memberId?: string): void {
    event.stopPropagation();
    this.closeMenus();
    this.inbox.openInbox(memberId);
  }

  openProfileView(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    this.profileView.showViewMode();
  }

  openActivity(event: Event, kind: MemberActivityKind): void {
    event.stopPropagation();
    this.closeMenus();
    this.activity.openPanel(kind);
  }

  keepOpen(event: Event): void {
    event.stopPropagation();
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }

  markOneRead(event: Event, id: number): void {
    event.stopPropagation();
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  onDocumentClick(): void {
    this.closeMenus();
  }

  closeMenus(): void {
    this.menuOpen.set(false);
    this.closeDropdowns();
  }

  logout(): void {
    this.matchSearch.clear();
    this.auth.logout();
    this.closeMenus();
    void this.router.navigateByUrl('/');
  }

  private closeDropdowns(): void {
    this.profileOpen.set(false);
    this.noticesOpen.set(false);
    this.messagesOpen.set(false);
    this.healthOpen.set(false);
    this.biodataOpen.set(false);
  }
}
