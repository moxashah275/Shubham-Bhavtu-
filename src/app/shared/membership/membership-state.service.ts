import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MEMBERSHIP_PLANS, planById, type MembershipPlan, type PlanId } from './membership-plans';

const PLAN_KEY = 'gathbandhan.membership.plan';

type StoredSubscription = {
  planId: PlanId;
  startDate: string;
  expiryDate: string;
};

@Injectable({ providedIn: 'root' })
export class MembershipStateService {
  private readonly auth = inject(AuthService);
  private readonly planId = signal<PlanId>('free');

  readonly currentPlanId = computed(() => {
    if (!this.auth.isAuthenticated()) {
      return null;
    }
    return this.planId();
  });

  readonly currentPlan = computed(() => {
    const id = this.currentPlanId();
    return id ? planById(id) : null;
  });

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user) {
        return;
      }
      untracked(() => this.planId.set(this.readPlanId()));
    });
  }

  setPlan(planId: PlanId): void {
    this.planId.set(planId);
    const start = new Date();
    const expiry = this.expiryFor(planId, start);
    const payload: StoredSubscription = {
      planId,
      startDate: this.formatDate(start),
      expiryDate: expiry,
    };
    try {
      localStorage.setItem(this.scopedKey(), JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  subscriptionDetails() {
    const plan = this.currentPlan();
    if (!plan) {
      return null;
    }

    const stored = this.readStored();
    const isFree = plan.id === 'free';

    return {
      planId: plan.id,
      currentPlan: plan.name,
      duration: plan.duration,
      amountPaid: isFree ? '₹0' : plan.priceLabel,
      startDate: stored?.startDate ?? this.formatDate(new Date()),
      expiryDate: stored?.expiryDate ?? (isFree ? '—' : this.expiryFor(plan.id, new Date())),
      status: 'Active',
      autoRenewal: isFree ? 'Not required' : 'Off',
      plan,
    };
  }

  upgradeOptions(): MembershipPlan[] {
    const current = this.currentPlanId() ?? 'free';
    if (current === 'free') {
      return MEMBERSHIP_PLANS.filter((plan) => plan.id !== 'free');
    }
    if (current === 'gold') {
      return MEMBERSHIP_PLANS.filter((plan) => plan.id === 'premium' || plan.id === 'gold');
    }
    return MEMBERSHIP_PLANS.filter((plan) => plan.id === 'premium');
  }

  private scopedKey(): string {
    const userId = this.auth.user()?.id ?? 'guest';
    return `${PLAN_KEY}.${userId}`;
  }

  private readPlanId(): PlanId {
    const stored = this.readStored();
    return stored?.planId ?? 'free';
  }

  private readStored(): StoredSubscription | null {
    try {
      const raw = localStorage.getItem(this.scopedKey());
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as StoredSubscription;
      if (parsed?.planId === 'free' || parsed?.planId === 'gold' || parsed?.planId === 'premium') {
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private expiryFor(planId: PlanId, start: Date): string {
    if (planId === 'free') {
      return '—';
    }
    const end = new Date(start);
    end.setMonth(end.getMonth() + (planId === 'gold' ? 3 : 6));
    return this.formatDate(end);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
