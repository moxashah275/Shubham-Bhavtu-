import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-health',
  imports: [RouterLink, LucideArrowRight],
  templateUrl: './profile-health.component.html',
})
export class ProfileHealthComponent {
  private readonly auth = inject(AuthService);

  readonly completion = this.auth.profileCompletion;
  readonly barWidth = signal(0);
  readonly complete = computed(() => this.completion().percent >= 100);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => this.barWidth.set(this.completion().percent));
    });
  }
}
