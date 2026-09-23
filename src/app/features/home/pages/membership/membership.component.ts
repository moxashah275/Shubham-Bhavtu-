import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCheck, LucideDynamicIcon, LucideIndianRupee, LucideX } from '@lucide/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MembershipPaymentDialogComponent } from '../../../../shared/membership/membership-payment-dialog.component';
import {
  MEMBERSHIP_PLANS,
  featuresForPlan,
  type MembershipPlan,
  type PlanId,
} from '../../../../shared/membership/membership-plans';
import { MembershipStateService } from '../../../../shared/membership/membership-state.service';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-membership-page',
  imports: [
    PageHeroComponent,
    LucideDynamicIcon,
    LucideCheck,
    LucideIndianRupee,
    LucideX,
    MembershipPaymentDialogComponent,
  ],
  templateUrl: './membership.component.html',
})
export class MembershipPageComponent {
  private readonly auth = inject(AuthService);
  private readonly membership = inject(MembershipStateService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly plans = MEMBERSHIP_PLANS;
  readonly checkoutPlan = signal<MembershipPlan | null>(null);

  readonly currentPlanId = computed(() => this.membership.currentPlanId());

  features(planId: PlanId) {
    return featuresForPlan(planId);
  }

  statusFor(planId: PlanId): string {
    return this.currentPlanId() === planId ? 'Current plan' : 'Available';
  }

  isCurrent(planId: PlanId): boolean {
    return this.currentPlanId() === planId;
  }

  /** Free is always "Current plan" and disabled. Gold/Premium stay clickable. */
  isChooseDisabled(plan: MembershipPlan): boolean {
    return plan.id === 'free';
  }

  chooseLabel(plan: MembershipPlan): string {
    return plan.id === 'free' ? 'Current plan' : plan.actionLabel;
  }

  viewSubscription(plan: MembershipPlan): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/login');
      return;
    }
    this.membership.setPlan(plan.id);
    void this.router.navigateByUrl('/subscription');
  }

  choosePlan(plan: MembershipPlan): void {
    if (this.isChooseDisabled(plan)) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }

    if (plan.amount <= 0) {
      this.membership.setPlan('free');
      this.toast.show('Free plan is active on your account.');
      void this.router.navigateByUrl('/subscription');
      return;
    }

    this.checkoutPlan.set(plan);
  }

  closeCheckout(): void {
    this.checkoutPlan.set(null);
  }

  confirmPayment(plan: MembershipPlan): void {
    this.membership.setPlan(plan.id);
    this.checkoutPlan.set(null);
    this.toast.show(`${plan.name} payment of ${plan.priceLabel} is confirmed. Thank you.`);
    void this.router.navigateByUrl('/subscription');
  }
}
