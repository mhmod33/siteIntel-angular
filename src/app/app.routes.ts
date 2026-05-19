import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing/landing').then(m => m.LandingComponent) },
  { path: 'chat', loadComponent: () => import('./chat/chat').then(m => m.ChatComponent) },
];
