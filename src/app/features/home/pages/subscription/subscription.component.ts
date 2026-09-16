import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCheck,
  LucideCreditCard,
  LucideDynamicIcon,
  LucideIndianRupee,
  LucideLandmark,
  LucideSmartphone,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  featuresForPlan,
  planById,
  type MembershipPlan,
} from '../../../../shared/membership/membership-plans';
import { MembershipStateService } from '../../../../shared/membership/membership-state.service';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

type PaymentMethodId = 'upi' | 'card' | 'netbanking';

type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  hint: string;
};

@Component({
  selector: 'app-subscription-page',
  imports: [
    FormsModule,
    RouterLink,
    PageHeroComponent,
    LucideCheck,
    LucideCreditCard,
    LucideDynamicIcon,
    LucideIndianRupee,
    LucideLandmark,
    LucideSmartphone,
    LucideX,
  ],
  templateUrl: './subscription.component.html',
})
export class SubscriptionPageComponent {
  private readonly auth = inject(AuthService);
  private readonly membership = inject(MembershipStateService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly isLoggedIn = computed(() => this.auth.isAuthenticated());
  readonly selectedPayment = signal<PaymentMethodId>('card');
  readonly paying = signal(false);

  cardName = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  upiId = '';

  readonly paymentMethods: PaymentMethod[] = [
    { id: 'card', label: 'Card', hint: 'Debit or credit' },
    { id: 'upi', label: 'UPI', hint: 'GPay & PhonePe' },
    { id: 'netbanking', label: 'Net banking', hint: 'All banks' },
  ];

  readonly subscription = computed(() => {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.membership.subscriptionDetails();
  });

  readonly isFreePlan = computed(() => this.subscription()?.planId === 'free');

  readonly planFeatures = computed(() => {
    const planId = this.subscription()?.planId;
    if (!planId) {
      return [];
    }
    return featuresForPlan(planId);
  });

  readonly currentPlan = computed((): MembershipPlan | null => {
    const id = this.subscription()?.planId;
    return id ? planById(id) : null;
  });

  selectPayment(id: PaymentMethodId): void {
    this.selectedPayment.set(id);
  }

  upgrade(): void {
    void this.router.navigateByUrl('/membership');
  }

  renew(): void {
    if (this.isFreePlan()) {
      return;
    }
    this.toast.show('Select a payment method and tap Pay Now to renew.');
  }

  payNow(): void {
    const plan = this.currentPlan();
    if (!plan || plan.id === 'free') {
      return;
    }

    const method = this.selectedPayment();
    if (method === 'card') {
      if (!this.cardName.trim() || !this.cardNumber.trim() || !this.cardExpiry.trim() || !this.cardCvv.trim()) {
        this.toast.show('Please fill all card details to continue.');
        return;
      }
    }
    if (method === 'upi' && !this.upiId.trim()) {
      this.toast.show('Please enter your UPI ID to continue.');
      return;
    }

    const methodLabel = this.paymentMethods.find((item) => item.id === method)?.label ?? 'Card';
    this.paying.set(true);

    window.setTimeout(() => {
      this.membership.setPlan(plan.id);
      this.paying.set(false);
      this.toast.show(`${plan.name} payment of ${plan.priceLabel} via ${methodLabel} is confirmed.`);
    }, 650);
  }
}
