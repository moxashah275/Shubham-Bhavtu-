import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-brand-panel',
  templateUrl: './auth-brand-panel.component.html',
  host: {
    class: 'block h-dvh overflow-hidden',
  },
})
export class AuthBrandPanelComponent {
  readonly imageSrc = input.required<string>();
  readonly imageAlt = input.required<string>();
  readonly wide = input(false);
}
