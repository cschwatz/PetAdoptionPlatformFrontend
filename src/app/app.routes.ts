import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './authentication/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];