import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
import { isPrimarySearchComplete, matchQueryParams } from '../../core/data/match-query';
import {
  AGE_OPTIONS,
  LOOKING_FOR_OPTIONS,
  MARITAL_OPTIONS,
  RELIGION_OPTIONS,
  profilesTypeForLookingFor,
} from '../../core/data/partner-search-options';
import { AuthService } from '../../core/services/auth.service';
import { MatchSearchService } from '../../core/services/match-search.service';
import { SearchSelectComponent } from './search-select.component';

@Component({
  selector: 'app-partner-search',
  imports: [LucideSearch, SearchSelectComponent],
  templateUrl: './partner-search.component.html',
})
export class PartnerSearchComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly matchSearch = inject(MatchSearchService);

  readonly overlap = input(true);

  lookingFor = '';
  age = '';
  religion = '';
  maritalStatus = '';
  fieldError = {
    lookingFor: false,
    age: false,
    religion: false,
    maritalStatus: false,
  };

  readonly lookingForOptions = LOOKING_FOR_OPTIONS;
  readonly ageOptions = AGE_OPTIONS;
  readonly religionOptions = RELIGION_OPTIONS;
  readonly maritalOptions = MARITAL_OPTIONS;

  profilesHint(): string {
    const type = profilesTypeForLookingFor(this.lookingFor);
    return type ? `Shows ${type} profiles` : '';
  }

  search(): void {
    this.fieldError = {
      lookingFor: !this.lookingFor,
      age: !this.age,
      religion: !this.religion,
      maritalStatus: !this.maritalStatus,
    };
    if (!isPrimarySearchComplete({ lookingFor: this.lookingFor, age: this.age, religion: this.religion, maritalStatus: this.maritalStatus })) {
      return;
    }

    const queryParams = matchQueryParams({
      lookingFor: this.lookingFor,
      age: this.age,
      religion: this.religion,
      maritalStatus: this.maritalStatus,
    });

    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/dashboard' },
      });
      return;
    }

    this.matchSearch.remember(queryParams, { primary: true });
    void this.router.navigate(['/matches'], { queryParams });
  }
}
