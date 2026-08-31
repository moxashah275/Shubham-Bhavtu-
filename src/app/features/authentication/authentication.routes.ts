import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';
import { otpGuard } from '../../core/guards/otp.guard';
import { resetGuard } from '../../core/guards/reset.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LoginOtpComponent } from './pages/login-otp/login-otp.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { VerifyOtpComponent } from './pages/verify-otp/verify-otp.component';

export const authenticationRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Gathbandhan',
    canActivate: [guestGuard],
  },
  {
    path: 'login-otp',
    component: LoginOtpComponent,
    title: 'Gathbandhan',
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Gathbandhan',
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Gathbandhan',
    canActivate: [guestGuard],
  },
  {
    path: 'verify-otp',
    component: VerifyOtpComponent,
    title: 'Gathbandhan',
    canActivate: [guestGuard, otpGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Gathbandhan',
    canActivate: [guestGuard, resetGuard],
  },
];
