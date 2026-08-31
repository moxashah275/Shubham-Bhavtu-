import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppImages } from '../../../core/assets/app-images';

@Component({
  selector: 'app-brand-mark',
  imports: [RouterLink],
  template: `
    <a [routerLink]="homeLink()" class="inline-flex cursor-default items-center gap-1.5 text-white">
      <img
        src="${AppImages.authentication.heartsLogo}"
        alt=""
        width="54"
        height="36"
        class="h-9 w-auto bg-transparent object-contain"
        aria-hidden="true"
      />
      <span class="font-serif text-[22px] leading-none tracking-wide lg:text-[24px]">
        <span class="text-white">Gath</span><span class="text-gold">bandhan</span>
      </span>
    </a>
  `,
})
export class BrandMarkComponent {
  readonly homeLink = input('/');
}
