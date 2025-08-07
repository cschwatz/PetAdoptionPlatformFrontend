import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './authentication/auth.guard';
import { RegisterComponent } from './register/register.component';
import { OngComponent } from './ong/ong.component';
import { MyAnimalsComponent } from './my-animals/my-animals.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { OngEventsComponent } from './ong-events/ong-events.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { AnimalComponent } from './animal/animal.component';
import { AdoptionComponent } from './adoption/adoption.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ong', component: OngComponent },
  { path: 'ong/:id',
    loadComponent: () => import('./ong/ong-details.component').then(c => c.OngDetailsComponent)
  },
  { path: 'animal', component: AnimalComponent },
  { path: 'adoption',
    loadComponent: () => import('./adoption/adoption.component').then(c => c.AdoptionComponent)
  },
  { path: 'animal/:id',
    loadComponent: () => import('./animal/animal.component').then(c => c.AnimalComponent)
  },
  { path: 'animal/edit/:id',
    loadComponent: () => import('./animal/animal-edit.component').then(c => c.AnimalEditComponent),
    canActivate: [authGuard]
  },
  { path: 'animals/new',
    loadComponent: () => import('./animal/animal-create.component').then(c => c.AnimalCreateComponent),
    canActivate: [authGuard]
  },
  { path: 'my-animals', component: MyAnimalsComponent },
  { path: 'my-events', component: MyEventsComponent, canActivate: [authGuard] },
  { path: 'ong-events', component: OngEventsComponent },
  { path: 'events/new',
    loadComponent: () => import('./ong-events/event-create.component').then(c => c.EventCreateComponent),
    canActivate: [authGuard]
  },
  { path: 'event/edit/:id',
    loadComponent: () => import('./ong-events/event-edit.component').then(c => c.EventEditComponent),
    canActivate: [authGuard]
  },
  { path: 'event/:id',
    loadComponent: () => import('./ong-events/event-details.component').then(c => c.EventDetailsComponent)
  },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
]