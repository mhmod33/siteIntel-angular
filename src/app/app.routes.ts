import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing/landing').then(m => m.LandingComponent) },
  { path: 'landing', loadComponent: () => import('./landing/landing').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'chat', loadComponent: () => import('./chat/chat').then(m => m.ChatComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.AdminDashboardComponent), canActivate: [authGuard, adminGuard] },
  { path: 'not-found', loadComponent: () => import('./not-found/not-found').then(m => m.NotFoundComponent) },
  { path: 'unauthorized', loadComponent: () => import('./unauthorized/unauthorized').then(m => m.UnauthorizedComponent) },
  { path: '**', redirectTo: '/not-found' },
];
