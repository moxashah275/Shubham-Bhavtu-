import { Component, input, output } from '@angular/core';
import type { SocialProvider } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.component.html',
})
export class SocialLoginComponent {
  readonly disabled = input(false);
  readonly selected = output<SocialProvider>();

  choose(provider: SocialProvider): void {
    if (this.disabled()) {
      return;
    }
    this.selected.emit(provider);
  }
}
