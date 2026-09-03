import { Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { LucideSearch, LucideX } from '@lucide/angular';
import { matchQueryParams, isPrimarySearchComplete } from '../../core/data/match-query';
import {
  AGE_OPTIONS,
  LOOKING_FOR_OPTIONS,
  MARITAL_OPTIONS,
  RELIGION_OPTIONS,
  profilesTypeForLookingFor,
} from '../../core/data/partner-search-options';
import { AuthService } from '../../core/services/auth.service';
import { MatchSearchService } from '../../core/services/match-search.service';
import { SearchDialogService } from '../../core/services/search-dialog.service';
import { SearchSelectComponent } from './search-select.component';

@Component({
  selector: 'app-search-dialog',
  imports: [SearchSelectComponent, LucideSearch, LucideX],
  templateUrl: './search-dialog.component.html',
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class SearchDialogComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly searchDialog = inject(SearchDialogService);
  private readonly matchSearch = inject(MatchSearchService);

  lookingFor = '';
  age = '';
  religion = '';
  maritalStatus = '';
  readonly fieldError = signal({
    lookingFor: false,
    age: false,
    religion: false,
    maritalStatus: false,
  });

  readonly lookingForOptions = LOOKING_FOR_OPTIONS;
  readonly ageOptions = AGE_OPTIONS;
  readonly religionOptions = RELIGION_OPTIONS;
  readonly maritalOptions = MARITAL_OPTIONS;
  readonly open = this.searchDialog.open;

  profilesHint(): string {
    const type = profilesTypeForLookingFor(this.lookingFor);
    return type ? `Shows ${type} profiles` : '';
  }

  constructor() {
    const previous = document.body.style.overflow;
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previous;
    });

    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen) {
          this.fieldError.set({
            lookingFor: false,
            age: false,
            religion: false,
            maritalStatus: false,
          });
          if (this.searchDialog.fresh()) {
            this.lookingFor = '';
            this.age = '';
            this.religion = '';
            this.maritalStatus = '';
            this.searchDialog.fresh.set(false);
          } else {
            this.syncFromQuery();
          }
          document.body.style.overflow = 'hidden';
          return;
        }
        document.body.style.overflow = previous;
      });
    });
  }

  close(): void {
    document.body.style.overflow = '';
    this.searchDialog.hide();
  }

  search(): void {
    const missing = {
      lookingFor: !this.lookingFor,
      age: !this.age,
      religion: !this.religion,
      maritalStatus: !this.maritalStatus,
    };
    this.fieldError.set(missing);
    if (!isPrimarySearchComplete({ lookingFor: this.lookingFor, age: this.age, religion: this.religion, maritalStatus: this.maritalStatus })) {
      return;
    }

    const queryParams = matchQueryParams({
      lookingFor: this.lookingFor,
      age: this.age,
      religion: this.religion,
      maritalStatus: this.maritalStatus,
    });

    this.close();

    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/dashboard' },
      });
      return;
    }

    this.matchSearch.remember(queryParams, { primary: true });
    void this.router.navigate(['/matches'], { queryParams });
  }

  private syncFromQuery(): void {
    let snapshot = this.router.routerState.snapshot.root;
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }
    const params = snapshot.queryParamMap;
    this.lookingFor = params.get('lookingFor') ?? '';
    this.age = params.get('age') ?? params.get('ageFrom') ?? '';
    this.religion = params.get('religion') ?? '';
    this.maritalStatus = params.get('maritalStatus') ?? '';
  }
}
