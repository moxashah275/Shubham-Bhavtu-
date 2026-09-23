import {
  LucideCrown,
  LucideHeart,
  LucideSparkles,
  type LucideIcon,
} from '@lucide/angular';

export type PlanId = 'free' | 'gold' | 'premium';

export type PlanFeature = {
  label: string;
  free: boolean;
  gold: boolean;
  premium: boolean;
};

export type MembershipPlan = {
  id: PlanId;
  icon: LucideIcon;
  name: string;
  priceLabel: string;
  amount: number;
  duration: string;
  description: string;
  featured: boolean;
  actionLabel: string;
};

/** Shared feature matrix — tick where available, X where not. */
export const MEMBERSHIP_FEATURES: PlanFeature[] = [
  { label: 'Create and edit your profile', free: true, gold: true, premium: true },
  { label: 'Browse verified Jain members', free: true, gold: true, premium: true },
  { label: 'Save matches to shortlist', free: true, gold: true, premium: true },
  { label: 'Basic interest sending', free: true, gold: true, premium: true },
  { label: 'See who viewed your profile', free: false, gold: true, premium: true },
  { label: 'Send interests with context', free: false, gold: true, premium: true },
  { label: 'Priority profile review', free: false, gold: true, premium: true },
  { label: 'Highlighted in search', free: false, gold: false, premium: true },
  { label: 'Dedicated care support', free: false, gold: false, premium: true },
  { label: 'Guided family introductions', free: false, gold: false, premium: true },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    icon: LucideHeart,
    name: 'Free',
    priceLabel: '₹0',
    amount: 0,
    duration: 'Ongoing',
    description: 'A gentle start with a verified profile and private browsing.',
    featured: false,
    actionLabel: 'Current plan',
  },
  {
    id: 'gold',
    icon: LucideSparkles,
    name: 'Gold',
    priceLabel: '₹2,199',
    amount: 2199,
    duration: '3 months',
    description: 'Everything in Free, plus introductions that move with care.',
    featured: true,
    actionLabel: 'Choose Gold',
  },
  {
    id: 'premium',
    icon: LucideCrown,
    name: 'Premium',
    priceLabel: '₹4,499',
    amount: 4499,
    duration: '6 months',
    description: 'Everything in Gold, with highlighted presence and dedicated care.',
    featured: false,
    actionLabel: 'Choose Premium',
  },
];

export function planById(id: PlanId): MembershipPlan {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === id) ?? MEMBERSHIP_PLANS[0];
}

export function featuresForPlan(planId: PlanId): { label: string; included: boolean }[] {
  return MEMBERSHIP_FEATURES.map((feature) => ({
    label: feature.label,
    included: feature[planId],
  }));
}
