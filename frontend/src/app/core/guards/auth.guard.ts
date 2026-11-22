import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  if (auth.isLoggedIn()) {
    router.navigate(['/student/dashboard']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};

export const studentGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isStudent()) return true;

  if (auth.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  if (auth.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/student/dashboard']);
  }
  return false;
};
