import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../authentication/auth.service';


@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navigation-header" *ngIf="isLoggedIn">
      <div class="header-content">
        <h1 class="logo" (click)="navigateTo('/dashboard')">Plataforma de Adoção de Animais</h1>
        <nav class="navigation">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            🏠 Página Inicial
          </a>
          <a routerLink="/adoption" routerLinkActive="active" class="nav-link">
            🐕 Adotar
          </a>
          <a *ngIf="isPerson" routerLink="/ong-events" routerLinkActive="active" class="nav-link">
            📅 Eventos
          </a>
          <a *ngIf="isOng" routerLink="/my-events" routerLinkActive="active" class="nav-link">
            📅 Meus Eventos
          </a>
          <a *ngIf="isPerson" routerLink="/ong" routerLinkActive="active" class="nav-link">
            🏢 ONGs
          </a>
          <a *ngIf="isOng" routerLink="/my-animals" routerLinkActive="active" class="nav-link">
            🐾 Meus Animais
          </a>
          <a routerLink="/my-account" routerLinkActive="active" class="nav-link">
            👤 Minha Conta
          </a>
        </nav>
        <div class="user-actions">
          <span class="user-greeting">Bem-vindo(a)!</span>
          <button (click)="logout()" class="logout-btn">Sair</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navigation-header {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }


    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }


    .logo {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s;
    }


    .logo:hover {
      opacity: 0.8;
    }


    .navigation {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }


    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
      font-weight: 500;
    }


    .nav-link:hover,
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
    }


    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }


    .user-greeting {
      font-weight: 500;
      font-size: 0.9rem;
    }


    .logout-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-weight: 500;
    }


    .logout-btn:hover {
      background-color: #c82333;
    }


    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }


      .navigation {
        order: 3;
        width: 100%;
        justify-content: center;
        gap: 1rem;
      }


      .nav-link {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
      }


      .user-actions {
        order: 2;
      }


      .logo {
        order: 1;
        font-size: 1.3rem;
      }
    }


    @media (max-width: 600px) {
      .header-content {
        padding: 0 1rem;
      }


      .navigation {
        grid-template-columns: repeat(2, 1fr);
        display: grid;
        gap: 0.5rem;
        width: 100%;
      }


      .nav-link {
        text-align: center;
        font-size: 0.8rem;
      }


      .user-greeting {
        font-size: 0.8rem;
      }


      .logout-btn {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }
    }
  `]
})
export class NavigationComponent implements OnInit {
  isLoggedIn = false;
  userType: string = '';
  isPerson: boolean = false;
  isOng: boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn().subscribe(isAuth => {
      this.isLoggedIn = isAuth;
      if (isAuth) {
        this.updateUserInfo();
      }
    });

    this.isLoggedIn = this.authService.isLoggedInSync();
    if (this.isLoggedIn) {
      this.updateUserInfo();
    }
  }


  private updateUserInfo(): void {
    this.userType = this.authService.getUserType() || 'User';
    this.isPerson = this.authService.isPerson();
    this.isOng = this.authService.isOng();   
  }


  navigateTo(route: string): void {
    this.router.navigate([route]);
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}