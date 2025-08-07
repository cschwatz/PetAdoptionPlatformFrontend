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
          <h2>Bem-vindo(a) à Plataforma</h2>
          <p *ngIf="isPerson">Como um usuário, você pode adotar animais e descobrir ONGs locais trabalhando em prol dos animais.</p>
          <p *ngIf="isOng"> Como uma ONG, você pode gerenciar animais para adoção, organizar eventos, e conectar com potenciais adotantes.</p>
        </div>
       
        <div class="quick-actions">
          <div class="action-card" (click)="navigateTo('/adoption')">
            <h3>🐕 Encontre animais para adotar</h3>
            <p>Busque por animais disponíveis e que estão à procura de um lar</p>
          </div>
         
          <div *ngIf="isPerson" class="action-card" (click)="navigateTo('/ong-events')">
            <h3>📅 Eventos Futuros</h3>
            <p>Participe de eventos e atividades em prol dos animais</p>
          </div>
         
          <div *ngIf="isOng" class="action-card" (click)="navigateTo('/my-events')">
            <h3>📅 Meus Eventos</h3>
            <p>Gerencie os eventos e atividades de sua organização</p>
          </div>
         
          <div *ngIf="isPerson" class="action-card" (click)="navigateTo('/ong')">
            <h3>🏠 ONGs Locais</h3>
            <p>Descubra organizações que estão trabalhando em prol dos animais</p>
          </div>
         
          <div *ngIf="isOng" class="action-card" (click)="navigateTo('/my-animals')">
            <h3>🐾 Meus Animais</h3>
            <p>Gerencie os animais que estão sob os cuidados de sua organização</p>
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
    this.userType = this.authService.getUserType() || 'User';
    this.isPerson = this.authService.isPerson();
    this.isOng = this.authService.isOng();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}