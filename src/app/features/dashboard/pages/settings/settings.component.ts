import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-settings-page',
  imports: [RouterLink, PageHeroComponent],
  template: `
    <app-page-hero
      align="center"
      eyebrow="Settings"
      title="Account settings"
      [showLine]="false"
    />
    <section class="relative overflow-hidden bg-blush/50 py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">
        <div class="grid gap-5 md:grid-cols-2">
          <article class="rounded-2xl border border-gold/20 bg-white p-6 shadow-[0_22px_50px_rgba(43,36,32,0.08)] sm:p-8">
            <p class="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Privacy</p>
            <div class="w-fit">
              <h2 class="mt-3 font-serif text-2xl text-charcoal">Your details stay yours</h2>
              <span class="mt-1.5 block h-px w-1/2 bg-gold"></span>
            </div>
            <p class="mt-5 text-sm leading-6 text-stone-500">Your profile is visible only to verified members. Passwords are never shown on any page.</p>
          </article>
          <article class="rounded-2xl border border-gold/20 bg-white p-6 shadow-[0_22px_50px_rgba(43,36,32,0.08)] sm:p-8">
            <p class="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Notifications</p>
            <div class="w-fit">
              <h2 class="mt-3 font-serif text-2xl text-charcoal">Quiet updates</h2>
              <span class="mt-1.5 block h-px w-1/2 bg-gold"></span>
            </div>
            <p class="mt-5 text-sm leading-6 text-stone-500">Interest and profile views appear in your bell menu — nothing is sent as a crowd of alerts.</p>
          </article>
        </div>
        <a
          routerLink="/dashboard"
          class="mt-8 inline-flex h-12 cursor-pointer items-center rounded-lg bg-burgundy px-5 text-sm font-semibold text-white transition hover:bg-burgundy-deep"
        >
          Back to Dashboard
        </a>
      </div>
    </section>
  `,
})
export class SettingsPageComponent {}
