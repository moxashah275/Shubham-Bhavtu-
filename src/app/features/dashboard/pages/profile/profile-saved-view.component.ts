import { Component, computed, inject, output } from '@angular/core';
import {
  LucideBriefcase,
  LucideGraduationCap,
  LucideMapPin,
  LucidePencil,
  LucideUser,
  LucideUsers,
  LucideUtensils,
} from '@lucide/angular';
import { formatWorkExperienceLabel } from '../../../../core/profile/profile-data';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-saved-view',
  imports: [
    LucideBriefcase,
    LucideGraduationCap,
    LucideMapPin,
    LucidePencil,
    LucideUser,
    LucideUsers,
    LucideUtensils,
  ],
  templateUrl: './profile-saved-view.component.html',
})
export class ProfileSavedViewComponent {
  private readonly auth = inject(AuthService);

  readonly editRequested = output<void>();
  readonly user = this.auth.user;
  readonly profilePhotoUrl = computed(() => this.user()?.profilePhoto?.trim() || '');

  heroFullName(): string {
    return this.user()?.fullName?.trim() || '';
  }

  heroInitials(): string {
    const parts = this.heroFullName().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'G';
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
    return `${first}${second}`.toUpperCase();
  }

  display(value: string | undefined | boolean): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    const text = value?.trim() ?? '';
    return text || '—';
  }

  displayMultiline(value: string | undefined | null): string {
    const text = value?.trim() ?? '';
    return text || '—';
  }

  displayMobile(): string {
    const user = this.user();
    const mobile = user?.mobile?.trim() ?? '';
    if (!mobile) {
      return '—';
    }
    const code = user?.countryCode?.trim() || '+91';
    return `${code} ${mobile}`;
  }

  displayDateOfBirth(): string {
    const value = this.user()?.dateOfBirth?.trim() ?? '';
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  displayBirthTime(): string {
    const value = this.user()?.birthTime?.trim() ?? '';
    if (!value) {
      return '—';
    }
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
      return value;
    }
    const hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  displayWorkExperience(): string {
    const formatted = formatWorkExperienceLabel(this.user()?.workExperience);
    return formatted || '—';
  }

  displayAge(): string {
    const dob = this.user()?.dateOfBirth?.trim();
    const fromDob = this.ageTextFromDob(dob);
    if (fromDob) {
      return fromDob;
    }
    return this.ageTextFromStoredAge(this.user()?.age) || '—';
  }

  displayPartnerAge(): string {
    const from = this.user()?.partnerAgeFrom?.trim() ?? '';
    const to = this.user()?.partnerAgeTo?.trim() ?? '';
    if (from && to) {
      return `${from} – ${to} yrs`;
    }
    return this.display(from || to);
  }

  displayPartnerHeight(): string {
    const from = this.user()?.partnerHeightFrom?.trim() ?? '';
    const to = this.user()?.partnerHeightTo?.trim() ?? '';
    if (from && to) {
      return `${from} to ${to}`;
    }
    return this.display(from || to);
  }

  displayLanguageList(): string[] {
    return (this.user()?.languagesKnown ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  viewSubline(): string {
    const parts: string[] = [];
    const age = this.displayAge();
    const height = this.display(this.user()?.height);
    if (age !== '—' && height !== '—') {
      parts.push(`${age.replace(/\s*yrs$/i, ' Years')}, ${height}`);
    } else if (age !== '—') {
      parts.push(age.replace(/\s*yrs$/i, ' Years'));
    } else if (height !== '—') {
      parts.push(height);
    }
    const location = [this.user()?.city, this.user()?.state].filter(Boolean).join(', ');
    if (location) {
      parts.push(location);
    }
    return parts.join(' • ');
  }

  viewJainChip(): string {
    const religion = this.user()?.religion?.trim() ?? '';
    const sect = this.user()?.jainSect?.trim() ?? '';
    if (religion && sect) {
      return `${religion} - ${sect}`;
    }
    return religion || sect;
  }

  viewMaritalChip(): string {
    return this.user()?.maritalStatus?.trim() ?? '';
  }

  viewEducationLine(): string {
    const education = this.user()?.educationSpec?.trim() ?? '';
    const degree = this.user()?.degree?.trim() ?? '';
    if (education && degree) {
      return `${education} (${degree})`;
    }
    return education || degree;
  }

  viewOccupationLine(): string {
    const occupation = this.user()?.occupation?.trim() ?? '';
    const company = this.user()?.companyName?.trim() ?? '';
    if (occupation && company) {
      return `${occupation} (${company})`;
    }
    return occupation || company;
  }

  viewLocationFullLine(): string {
    const user = this.user();
    return [user?.city, user?.state, user?.country || (user?.city || user?.state ? 'India' : '')]
      .filter(Boolean)
      .join(', ');
  }

  viewDietLine(): string {
    const diet = this.user()?.diet?.trim() ?? '';
    return diet ? `${diet} Diet` : '';
  }

  private ageTextFromDob(dob: string | undefined | null): string {
    const value = dob?.trim();
    if (!value) {
      return '';
    }
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) {
      return '';
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return `${age} yrs`;
  }

  private ageTextFromStoredAge(age: string | undefined | null): string {
    const value = age?.trim();
    if (!value) {
      return '';
    }
    if (value === 'below-18') {
      return 'Below 18';
    }
    return `${value} yrs`;
  }
}
