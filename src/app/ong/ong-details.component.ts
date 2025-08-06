import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OngService } from './ong.service';
import { Ong } from './ong.model';


@Component({
  selector: 'app-ong-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ong-details-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading organization details...</p>
      </div>


      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button (click)="loadOng()" class="retry-btn">Try Again</button>
        <button (click)="goBack()" class="back-btn">Go Back</button>
      </div>


      <!-- ONG Details -->
      <div *ngIf="ong && !loading && !error" class="ong-details">
        <!-- Header -->
        <div class="ong-header">
          <button (click)="goBack()" class="back-button">
            ← Back to Organizations
          </button>
          <div class="header-content">
            <div class="ong-icon">🏢</div>
            <div class="header-info">
              <h1 class="ong-name">{{ ong.name }}</h1>
              <p class="ong-cnpj">CNPJ: {{ formatCnpj(ong.cnpj) }}</p>
            </div>
          </div>
        </div>


        <!-- Main Content -->
        <div class="content-grid">
          <!-- Contact Information Card -->
          <div class="info-card">
            <h2 class="card-title">📞 Contact Information</h2>
            <div class="info-content">
              <div class="info-row" *ngIf="ong.email">
                <span class="info-icon">📧</span>
                <div class="info-details">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ ong.email }}</span>
                </div>
              </div>
             
              <div class="info-row" *ngIf="ong.phone">
                <span class="info-icon">📞</span>
                <div class="info-details">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{{ formatPhone(ong.phone) }}</span>
                </div>
              </div>


              <div class="info-row" *ngIf="ong.login">
                <span class="info-icon">👤</span>
                <div class="info-details">
                  <span class="info-label">Login/Username</span>
                  <span class="info-value">{{ ong.login }}</span>
                </div>
              </div>
            </div>
          </div>


          <!-- Address Information Card -->
          <div class="info-card" *ngIf="ong.address">
            <h2 class="card-title">📍 Address Information</h2>
            <div class="info-content">
              <div class="address-details">
                <div class="address-row" *ngIf="ong.address.street || ong.address.number">
                  <span class="address-label">Street:</span>
                  <span class="address-value">
                    {{ ong.address.street }}{{ ong.address.number ? ', ' + ong.address.number : '' }}
                  </span>
                </div>
               
                <div class="address-row" *ngIf="ong.address.neighborhood">
                  <span class="address-label">Neighborhood:</span>
                  <span class="address-value">{{ ong.address.neighborhood }}</span>
                </div>
               
                <div class="address-row" *ngIf="ong.address.city">
                  <span class="address-label">City:</span>
                  <span class="address-value">{{ ong.address.city }}</span>
                </div>
               
                <div class="address-row" *ngIf="ong.address.state">
                  <span class="address-label">State:</span>
                  <span class="address-value">{{ ong.address.state }}</span>
                </div>
               
                <div class="address-row" *ngIf="ong.address.cep">
                  <span class="address-label">CEP:</span>
                  <span class="address-value">{{ ong.address.cep }}</span>
                </div>
              </div>
            </div>
          </div>


          <!-- Organization Information Card -->
          <div class="info-card full-width">
            <h2 class="card-title">🏢 Organization Information</h2>
            <div class="info-content">
              <div class="org-stats">
                <div class="stat-item">
                  <span class="stat-icon">📋</span>
                  <div class="stat-details">
                    <span class="stat-label">CNPJ</span>
                    <span class="stat-value">{{ formatCnpj(ong.cnpj) }}</span>
                  </div>
                </div>
               
                <div class="stat-item">
                  <span class="stat-icon">🆔</span>
                  <div class="stat-details">
                    <span class="stat-label">Organization ID</span>
                    <span class="stat-value">{{ ong.id }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- Actions Card -->
          <div class="info-card full-width">
            <h2 class="card-title">💬 Get in Touch</h2>
            <div class="actions-content">
              <button class="action-btn primary" (click)="contactOng()" *ngIf="ong.phone || ong.email">
                📞 Contact Organization
              </button>
              <button class="action-btn secondary" (click)="shareOng()">
                📤 Share Organization
              </button>
              <button class="action-btn secondary" (click)="viewAnimals()" *ngIf="ong.id">
                🐾 View Animals from this Organization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ong-details-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }


    .loading-container {
      text-align: center;
      padding: 4rem 0;
    }


    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }


    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }


    .error-container {
      text-align: center;
      padding: 4rem 0;
      color: #dc3545;
    }


    .retry-btn, .back-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem;
    }


    .retry-btn:hover, .back-btn:hover {
      background-color: #0056b3;
    }


    .ong-header {
      margin-bottom: 2rem;
    }


    .back-button {
      background: none;
      border: none;
      color: #007bff;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.5rem 0;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      transition: color 0.3s;
    }


    .back-button:hover {
      color: #0056b3;
      text-decoration: underline;
    }


    .header-content {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }


    .ong-icon {
      font-size: 4rem;
      margin-right: 1.5rem;
    }


    .header-info {
      flex: 1;
    }


    .ong-name {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: bold;
    }


    .ong-cnpj {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }


    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }


    .info-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }


    .full-width {
      grid-column: 1 / -1;
    }


    .card-title {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      margin: 0;
      padding: 1.5rem;
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #dee2e6;
    }


    .info-content {
      padding: 1.5rem;
    }


    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }


    .info-row:last-child {
      margin-bottom: 0;
    }


    .info-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
      width: 30px;
      text-align: center;
    }


    .info-details {
      flex: 1;
    }


    .info-label {
      display: block;
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }


    .info-value {
      display: block;
      color: #333;
      font-size: 1.1rem;
    }


    .address-details {
      space-y: 0.75rem;
    }


    .address-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }


    .address-row:last-child {
      margin-bottom: 0;
    }


    .address-label {
      font-weight: 600;
      color: #666;
      min-width: 120px;
    }


    .address-value {
      color: #333;
      text-align: right;
    }


    .org-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }


    .stat-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }


    .stat-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }


    .stat-details {
      flex: 1;
    }


    .stat-label {
      display: block;
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }


    .stat-value {
      display: block;
      color: #333;
      font-size: 1rem;
      word-break: break-all;
    }


    .actions-content {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }


    .action-btn {
      flex: 1;
      min-width: 200px;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
    }


    .action-btn.primary {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }


    .action-btn.primary:hover {
      background: linear-gradient(135deg, #218838 0%, #1dd1a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }


    .action-btn.secondary {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
    }


    .action-btn.secondary:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }


    @media (max-width: 768px) {
      .ong-details-container {
        padding: 1rem;
      }


      .content-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }


      .header-content {
        flex-direction: column;
        text-align: center;
      }


      .ong-icon {
        margin-right: 0;
        margin-bottom: 1rem;
      }


      .ong-name {
        font-size: 2rem;
      }


      .org-stats {
        grid-template-columns: 1fr;
      }


      .actions-content {
        flex-direction: column;
      }


      .action-btn {
        min-width: auto;
      }


      .info-row {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }


      .info-icon {
        margin-bottom: 0.5rem;
      }


      .address-row {
        flex-direction: column;
        align-items: flex-start;
      }


      .address-label {
        min-width: auto;
        margin-bottom: 0.25rem;
      }


      .address-value {
        text-align: left;
      }
    }
  `]
})
export class OngDetailsComponent implements OnInit {
  ong: Ong | null = null;
  loading = false;
  error: string | null = null;
  ongId: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ongService: OngService
  ) {}


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ongId = id;
      this.loadOng();
    } else {
      this.error = 'Invalid organization ID';
    }
  }


  loadOng(): void {
    if (!this.ongId) {
      this.error = 'No organization ID provided';
      return;
    }


    console.log('📡 Loading ONG details for ID:', this.ongId);
    this.loading = true;
    this.error = null;


    this.ongService.getOngById(this.ongId).subscribe({
      next: (ong) => {
        console.log('✅ ONG details loaded:', ong);
        this.ong = ong;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading ONG details:', error);
        this.error = error.message || 'Failed to load organization details. Please try again later.';
        this.loading = false;
      }
    });
  }


  formatCnpj(cnpj: string): string {
    if (!cnpj) return '';
    // Format: XX.XXX.XXX/XXXX-XX
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }


  formatPhone(phone: string): string {
    if (!phone) return '';
    // Remove any non-digits and format
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      // Mobile: (XX) XXXXX-XXXX
      return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (digits.length === 10) {
      // Landline: (XX) XXXX-XXXX
      return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone; // Return as-is if format is unexpected
  }


  contactOng(): void {
    if (!this.ong) return;


    const contactInfo = [];
    if (this.ong.phone) contactInfo.push(`Phone: ${this.formatPhone(this.ong.phone)}`);
    if (this.ong.email) contactInfo.push(`Email: ${this.ong.email}`);


    const message = contactInfo.length > 0
      ? `Contact ${this.ong.name}:\n\n${contactInfo.join('\n')}`
      : `Contact information for ${this.ong.name} is not available.`;


    alert(message);
  }


  shareOng(): void {
    if (!this.ong) return;


    const shareText = `Check out ${this.ong.name} - ${window.location.href}`;
   
    if (navigator.share) {
      navigator.share({
        title: this.ong.name,
        text: `Organization: ${this.ong.name}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Organization link copied to clipboard!');
      }).catch(() => {
        alert(`Share this organization:\n\n${shareText}`);
      });
    }
  }


  viewAnimals(): void {
    if (!this.ong?.id) return;
   
    // Navigate to adoption page with filter for this ONG
    // You can implement this based on your adoption component's filtering capabilities
    this.router.navigate(['/adoption'], { queryParams: { ongId: this.ong.id } });
  }


  goBack(): void {
    this.router.navigate(['/ong']);
  }
}