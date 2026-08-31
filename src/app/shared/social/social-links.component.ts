import { Component, input } from '@angular/core';

@Component({
  selector: 'app-social-links',
  templateUrl: './social-links.component.html',
})
export class SocialLinksComponent {
  readonly align = input<'center' | 'start'>('center');
}
