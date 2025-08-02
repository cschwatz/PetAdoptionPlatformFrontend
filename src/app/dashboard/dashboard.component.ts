import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="logo">Animal Adoption Platform</h1>
          <nav class="navigation">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
              Home
            </a>
            <a routerLink="/adoption" routerLinkActive="active" class="nav-link">
              Adopt
            </a>
            <a routerLink="/sponsorship" routerLinkActive="active" class="nav-link">
              Sponsorship
            </a>
            <a routerLink="/ong-events" routerLinkActive="active" class="nav-link">
              Events
            </a>
            <!-- Show ONG link only for Person users -->
            <a *ngIf="isPerson" routerLink="/ong" routerLinkActive="active" class="nav-link">
              ONGs
            </a>
            <!-- Show My Animals link only for ONG users -->
            <a *ngIf="isOng" routerLink="/my-animals" routerLinkActive="active" class="nav-link">
              My Animals
            </a>
            <a routerLink="/my-account" routerLinkActive="active" class="nav-link">
              My Account
            </a>
          </nav>
          <div class="user-actions">
            <span class="user-greeting">Welcome, {{ userType }}!</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <main class="dashboard-content">
        <div class="welcome-section">
          <h2>Welcome to Your Dashboard</h2>
          <p *ngIf="isPerson">As a registered user, you can adopt animals, sponsor pets, and discover local ONGs working for animal welfare.</p>
          <p *ngIf="isOng">As an ONG, you can manage your animals, organize events, and connect with potential adopters.</p>
        </div>
        
        <div class="quick-actions">
          <div class="action-card" (click)="navigateTo('/adopt')">
            <h3>🐕 Find Animals to Adopt</h3>
            <p>Browse available animals looking for their forever home</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('/sponsorship')">
            <h3>💝 Sponsor a Pet</h3>
            <p>Support animals in need through sponsorship programs</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('/events')">
            <h3>📅 Upcoming Events</h3>
            <p>Join adoption events and animal welfare activities</p>
          </div>
          
          <div *ngIf="isPerson" class="action-card" (click)="navigateTo('/ong')">
            <h3>🏠 Local ONGs</h3>
            <p>Discover organizations working for animal welfare</p>
          </div>
          
          <div *ngIf="isOng" class="action-card" (click)="navigateTo('/my-animals')">
            <h3>🐾 My Animals</h3>
            <p>Manage animals under your care</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
    }

    .logout-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .logout-btn:hover {
      background-color: #c82333;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .welcome-section {
      margin-bottom: 2rem;
    }

    .welcome-section h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .welcome-section p {
      color: #666;
      font-size: 1.1rem;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .action-card h3 {
      margin: 0 0 0.5rem 0;
      color: #007bff;
      font-size: 1.2rem;
    }

    .action-card p {
      margin: 0;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  userType: string = '';
  isPerson: boolean = false;
  isOng: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user type from auth service
    // This assumes your AuthService has a method to get user info
    this.userType = this.authService.getUserType() || 'User';
    this.isPerson = this.userType === 'Person';
    this.isOng = this.userType === 'ONG';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}