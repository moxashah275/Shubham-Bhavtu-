import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-divider',
  template: `
    <div class="flex items-center gap-3" role="separator" [attr.aria-label]="label()">
      <span class="h-px flex-1 bg-stone-200"></span>
      <span class="text-[11px] font-medium tracking-[0.16em] text-stone-400 uppercase">
        {{ label() }}
      </span>
      <span class="h-px flex-1 bg-stone-200"></span>
    </div>
  `,
})
export class AuthDividerComponent {
  readonly label = input('OR CONTINUE WITH');
}
