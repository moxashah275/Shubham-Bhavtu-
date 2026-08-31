import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideClock,
  LucideDynamicIcon,
  LucideMail,
  LucideMapPin,
  LucidePhone,
  type LucideIcon,
} from '@lucide/angular';
import { AppImages } from '../../../../core/assets/app-images';
import { emailValidator } from '../../../../core/models/auth.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, PageHeroComponent, LucideDynamicIcon],
  templateUrl: './contact.component.html',
})
export class ContactPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly careImage = AppImages.contact.care;

  readonly facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: LucideMail, label: 'Email', value: 'care@gathbandhan.in' },
    { icon: LucidePhone, label: 'Phone', value: '+91 98765 43210' },
    { icon: LucideClock, label: 'Hours', value: '10:00 am – 7:00 pm IST' },
    { icon: LucideMapPin, label: 'Office', value: 'Navrangpura, Ahmedabad' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, emailValidator]],
    message: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.reset();
    this.toast.show('Thank you. We have received your message.');
  }
}
