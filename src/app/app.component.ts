import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavigationComponent } from './shared/navigation.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './authentication/auth.service';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, CommonModule],
  template: `
    <app-navigation *ngIf="shouldShowNavigation$ | async"></app-navigation>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'plataforma-de-adoção';

  shouldShowNavigation$ = combineLatest([
    this.authService.isLoggedIn(),
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url)
    )
  ]).pipe(
    map(([isLoggedIn, currentUrl]) => {
      const hideNavRoutes = ['/login', '/register'];
      const isHideNavRoute = hideNavRoutes.some(route => currentUrl.startsWith(route));
     
      return isLoggedIn && !isHideNavRoute;
    })
  );

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
}