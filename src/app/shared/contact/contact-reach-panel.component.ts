import { Component, input } from '@angular/core';
import { AppImages } from '../../core/assets/app-images';

export interface ContactDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-contact-reach-panel',
  templateUrl: './contact-reach-panel.component.html',
  host: {
    class: 'block',
  },
})
export class ContactReachPanelComponent {
  readonly imageSrc = input(AppImages.contact.care);
  readonly imageAlt = input('Gathbandhan care team');
  readonly title = input('Reach Gathbandhan');
  readonly copy = input(
    'Prefer a person on the other side? Email or call during working hours and we will come back to you.',
  );
  readonly details = input<ContactDetail[]>([
    { label: 'Email', value: 'care@gathbandhan.in' },
    { label: 'Phone', value: '+91 98765 43210' },
    { label: 'Hours', value: '10:00 am – 7:00 pm IST' },
    { label: 'Office', value: 'Navrangpura, Ahmedabad' },
  ]);
}
