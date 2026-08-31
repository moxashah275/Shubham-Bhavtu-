import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSend, LucideX } from '@lucide/angular';
import { InboxService } from '../../core/services/inbox.service';

/** Full inbox: who wrote to you, and a place to write back. */
@Component({
  selector: 'app-inbox-dialog',
  imports: [FormsModule, LucideSend, LucideX],
  templateUrl: './inbox-dialog.component.html',
  host: {
    '(document:keydown.escape)': 'inbox.close()',
  },
})
export class InboxDialogComponent {
  readonly inbox = inject(InboxService);
  readonly draft = signal('');
  private readonly chatScroll = viewChild<ElementRef<HTMLElement>>('chatScroll');

  constructor() {
    // Reading a thread here clears its badge.
    effect(() => {
      const thread = this.inbox.active();
      if (thread && thread.unread > 0) {
        this.inbox.markRead(thread.memberId);
      }
    });
    effect(() => {
      const thread = this.inbox.active();
      const box = this.chatScroll()?.nativeElement;
      if (!thread || !box) {
        return;
      }
      // Tracking the count keeps this running whenever a new line arrives.
      const lines = thread.messages.length;
      if (lines >= 0) {
        requestAnimationFrame(() => box.scrollTo({ top: box.scrollHeight }));
      }
    });
  }

  send(): void {
    this.inbox.send(this.draft());
    this.draft.set('');
  }
}
