import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { MemberMatch } from '../../shared/matches/match-profile.model';
import memberMatchesData from '../../../assets/data/member-matches.json';

export interface ChatLine {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
}

export interface Conversation {
  memberId: string;
  name: string;
  imageSrc: string;
  lastText: string;
  time: string;
  unread: number;
  messages: ChatLine[];
}

const INBOX_KEY = 'gathbandhan.inbox.v4';

const REPLIES = [
  'Thank you for writing. Our family will look at the profile and reply soon.',
  'Noted. Would a call this weekend suit your parents?',
  'We are glad you reached out. Could you share your biodata once?',
  'Thank you. We will discuss at home and get back to you.',
];

/** Inbox of family messages, stored per member so replies stay on this browser. */
@Injectable({ providedIn: 'root' })
export class InboxService {
  private readonly auth = inject(AuthService);
  private readonly members = memberMatchesData as MemberMatch[];

  private readonly replyTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  readonly conversations = signal<Conversation[]>(this.read());
  readonly open = signal(false);
  readonly activeId = signal('');
  readonly unreadCount = computed(() => this.conversations().reduce((sum, item) => sum + item.unread, 0));
  readonly active = computed(() => this.conversations().find((item) => item.memberId === this.activeId()) ?? null);

  openInbox(memberId?: string): void {
    if (memberId) {
      this.ensureThread(memberId);
      this.activeId.set(memberId);
      this.markRead(memberId);
    } else if (!this.activeId() && this.conversations().length) {
      this.activeId.set(this.conversations()[0].memberId);
    }
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  select(memberId: string): void {
    this.ensureThread(memberId);
    this.activeId.set(memberId);
    this.markRead(memberId);
  }

  send(text: string): void {
    const memberId = this.activeId();
    const trimmed = text.trim();
    if (!memberId || !trimmed) {
      return;
    }
    this.ensureThread(memberId);
    const line: ChatLine = {
      id: `${Date.now()}`,
      fromMe: true,
      text: trimmed,
      time: 'Just now',
    };
    this.conversations.update((list) =>
      list.map((item) =>
        item.memberId === memberId
          ? { ...item, lastText: trimmed, time: 'Just now', messages: [...item.messages, line] }
          : item,
      ),
    );
    this.write();
    this.scheduleReply(memberId);
  }

  /** A family writes back a little later, so the navbar badge shows a new message. */
  private scheduleReply(memberId: string): void {
    clearTimeout(this.replyTimers[memberId]);
    this.replyTimers[memberId] = setTimeout(() => {
      const reply: ChatLine = {
        id: `${Date.now()}-reply`,
        fromMe: false,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        time: 'Just now',
      };
      const reading = this.open() && this.activeId() === memberId;
      this.conversations.update((list) =>
        list.map((item) =>
          item.memberId === memberId
            ? {
                ...item,
                lastText: reply.text,
                time: 'Just now',
                unread: reading ? 0 : item.unread + 1,
                messages: [...item.messages, reply],
              }
            : item,
        ),
      );
      this.write();
    }, 8000);
  }

  markRead(memberId: string): void {
    this.conversations.update((list) =>
      list.map((item) => (item.memberId === memberId ? { ...item, unread: 0 } : item)),
    );
    this.write();
  }

  markAllRead(): void {
    this.conversations.update((list) => list.map((item) => ({ ...item, unread: 0 })));
    this.write();
  }

  private ensureThread(memberId: string): void {
    if (this.conversations().some((item) => item.memberId === memberId)) {
      return;
    }
    const member = this.members.find((item) => item.id === memberId);
    if (!member) {
      return;
    }
    const conversation: Conversation = {
      memberId: member.id,
      name: member.name,
      imageSrc: member.imageSrc,
      lastText: 'Start a message with this family.',
      time: 'Now',
      unread: 0,
      messages: [],
    };
    this.conversations.update((list) => [conversation, ...list]);
    this.write();
  }

  private read(): Conversation[] {
    try {
      const raw = localStorage.getItem(this.scoped());
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Private browsing can block storage.
    }
    return [];
  }

  private write(): void {
    try {
      localStorage.setItem(this.scoped(), JSON.stringify(this.conversations()));
    } catch {
      // Private browsing can block storage.
    }
  }

  private scoped(): string {
    return `${INBOX_KEY}.${this.auth.user()?.id ?? 'guest'}`;
  }
}
