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
      <main class="dashboard-content">
        <div class="welcome-section">
          <h2>Welcome to Your Dashboard</h2>
          <p *ngIf="isPerson">As a registered user, you can adopt animals and discover local ONGs working for animal welfare.</p>
          <p *ngIf="isOng">As an ONG, you can manage your animals, organize events, and connect with potential adopters.</p>
        </div>
       
        <div class="quick-actions">
          <div class="action-card" (click)="navigateTo('/adoption')">
            <h3>🐕 Find Animals to Adopt</h3>
            <p>Browse available animals looking for their forever home</p>
          </div>
         
          <!-- Show Events for Person users -->
          <div *ngIf="isPerson" class="action-card" (click)="navigateTo('/ong-events')">
            <h3>📅 Upcoming Events</h3>
            <p>Join adoption events and animal welfare activities</p>
          </div>
         
          <!-- Show My Events for ONG users -->
          <div *ngIf="isOng" class="action-card" (click)="navigateTo('/my-events')">
            <h3>📅 My Events</h3>
            <p>Manage your organization's events and activities</p>
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
    this.userType = this.authService.getUserType() || 'User';
    this.isPerson = this.authService.isPerson();
    this.isOng = this.authService.isOng();
   
    // Debug logging to see what's happening
    console.log('Dashboard - User type:', this.userType);
    console.log('Dashboard - Is Person:', this.isPerson);
    console.log('Dashboard - Is ONG:', this.isOng);
   
    // Debug the actual token
    const token = this.authService.getToken();
    console.log('Dashboard - Token:', token);
   
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Dashboard - Token payload:', payload);
      } catch (error) {
        console.error('Dashboard - Error parsing token:', error);
      }
    }
  }


  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}