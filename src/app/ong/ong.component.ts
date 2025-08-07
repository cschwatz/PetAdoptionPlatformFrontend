import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OngService } from './ong.service';
import { Ong } from './ong.model';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-ong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ongs-container">
      <header class="ongs-header">
        <h1>🏢 Organizações</h1>
        <p>Descubra as organizações que estão trabalhando em prol dos animais</p>
      </header>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando organizações...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Opa! O servidor foi usado de arranhador de novo</h3>
        <p>{{ error }}</p>
        <button (click)="loadOngs()" class="retry-btn">Tentar Novamente</button>
      </div>

      <div *ngIf="!loading && !error" class="ongs-section">
        <div class="controls">
          <div class="ongs-count">
            <span>{{ totalOngs }} organizações ajudando animais</span>
          </div>
          <div class="page-size-selector">
            <label for="pageSize">Mostrar: </label>
            <select id="pageSize" [value]="pageSize" (change)="onPageSizeChange($event)" class="page-size-select">
              <option value="6">6 por página</option>
              <option value="12">12 por página</option>
              <option value="18">18 por página</option>
            </select>
          </div>
        </div>

        <div class="ongs-grid" *ngIf="paginatedOngs.length > 0">
          <div class="ong-card" *ngFor="let ong of paginatedOngs; trackBy: trackByOngId"
               (click)="viewOngDetails(ong)">>
           
            <div class="card-header">
              <div class="ong-icon">🏢</div>
              <div class="ong-info">
                <h3 class="ong-name">{{ ong.name }}</h3>
                <p class="ong-cnpj">CNPJ: {{ formatCnpj(ong.cnpj) }}</p>
              </div>
            </div>
           
            <div class="card-content">
              <div class="contact-info">
                <div class="contact-row" *ngIf="ong.email">
                  <span class="contact-icon">📧</span>
                  <span class="contact-value">{{ ong.email }}</span>
                </div>
                <div class="contact-row" *ngIf="ong.phone">
                  <span class="contact-icon">📞</span>
                  <span class="contact-value">{{ formatPhone(ong.phone) }}</span>
                </div>
                <div class="contact-row" *ngIf="ong.address">
                  <span class="contact-icon">📍</span>
                  <span class="contact-value">{{ getAddressString(ong.address) }}</span>
                </div>
               
                <!-- Social Media Links -->
                <div class="social-media-row" *ngIf="ong.instagram || ong.facebook || ong.tiktok">
                  <span class="contact-icon">🌐</span>
                  <div class="social-links">
                    <a *ngIf="ong.instagram" [href]="ong.instagram" target="_blank" class="social-link instagram" title="Instagram">
                      📸
                    </a>
                    <a *ngIf="ong.facebook" [href]="ong.facebook" target="_blank" class="social-link facebook" title="Facebook">
                      👥
                    </a>
                    <a *ngIf="ong.tiktok" [href]="ong.tiktok" target="_blank" class="social-link tiktok" title="TikTok">
                      🎵
                    </a>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button class="contact-btn" (click)="contactOng(ong, $event)">
                  💬 Contato
                </button>
                <button class="view-btn" (click)="viewOngDetails(ong, $event)">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="paginatedOngs.length === 0 && !loading" class="empty-state">
          <h3>🏢 Nenhuma organização encontrada</h3>
          <p>Atualmente não há organizações cadastradas em nossa plataforma.</p>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)">
            ← Previous
          </button>
         
          <div class="page-numbers">
            <button
              *ngFor="let page of pageNumbers"
              class="page-number"
              [class.active]="page === currentPage"
              (click)="goToPage(page)">
              {{ page }}
            </button>
          </div>
         
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)">
            Próximo →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ongs-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .ongs-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .ongs-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .ongs-header p {
      color: #666;
      font-size: 1.2rem;
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

    .retry-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
    }

    .retry-btn:hover {
      background-color: #0056b3;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .ongs-count {
      color: #666;
      font-weight: 500;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-size-select {
      padding: 0.25rem 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .ongs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .ong-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      position: relative;
    }

    .ong-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .ong-icon {
      font-size: 3rem;
      margin-right: 1rem;
    }

    .ong-info {
      flex: 1;
    }

    .ong-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.4rem;
      font-weight: bold;
    }

    .ong-cnpj {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .card-content {
      padding: 1.5rem;
    }

    .contact-info {
      margin-bottom: 1.5rem;
    }

    .contact-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .contact-icon {
      margin-right: 0.75rem;
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
    }

    .contact-value {
      color: #333;
      flex: 1;
      word-break: break-word;
    }

    .social-media-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .social-links {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }

    .social-link {
      display: inline-block;
      font-size: 1.2rem;
      text-decoration: none;
      padding: 0.25rem;
      border-radius: 4px;
      transition: transform 0.2s ease;
    }

    .social-link:hover {
      transform: scale(1.1);
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      gap: 0.5rem;
    }

    .contact-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 0.6rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.3s;
      flex: 1;
    }

    .contact-btn:hover {
      background: linear-gradient(135deg, #218838 0%, #1dd1a1 100%);
      transform: translateY(-2px);
    }

    .view-btn {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      padding: 0.6rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.3s;
      flex: 1;
    }

    .view-btn:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 0;
      color: #666;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .page-btn:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .page-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;
    }

    .page-number {
      background-color: #f8f9fa;
      color: #007bff;
      border: 1px solid #dee2e6;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .page-number:hover {
      background-color: #e9ecef;
    }

    .page-number.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }

    @media (max-width: 768px) {
      .ongs-container {
        padding: 1rem;
      }

      .ongs-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .controls {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }

      .page-numbers {
        justify-content: center;
      }

      .card-footer {
        flex-direction: column;
        gap: 0.5rem;
      }

      .contact-btn, .view-btn {
        flex: none;
        width: 100%;
      }

      .card-header {
        flex-direction: column;
        text-align: center;
      }

      .ong-icon {
        margin-right: 0;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class OngComponent implements OnInit {
  ongs: Ong[] = [];
  paginatedOngs: Ong[] = [];
  loading = false;
  error: string | null = null;
 
  currentPage = 1;
  pageSize = 6;
  totalOngs = 0;
  totalPages = 0;
 
  pageNumbers: number[] = [];

  constructor(
    private ongService: OngService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOngs();
  }


  loadOngs(): void {
    if (this.loading) {
      return;
    }

    if (!this.authService.isLoggedInSync()) {
      this.error = 'Você precisa estar logado para ver as organizações.';
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.ongService.getAllOngs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ongs: any) => {
          this.ongs = ongs as Ong[];
          this.totalOngs = ongs.length;
          this.calculatePagination();
          this.updatePaginatedOngs();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          if (error.message.includes('forbidden') || error.message.includes('403')) {
            this.error = 'Acesso não permitido. Por favor fale com um administrador.';
          } else if (error.message.includes('401')) {
            this.error = 'Sua sessão expirou. Por favor realize o login novamente.';
            this.router.navigate(['/login']);
          } else {
            this.error = error.message || 'Falha ao carregar as organizações. Por favor tente novamente.';
          }
         
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalOngs / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePageNumbers();
  }

  private updatePageNumbers(): void {
    const pages: number[] = [];
    const maxPagesToShow = 5;
   
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxPagesToShow - 1);
     
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
   
    this.pageNumbers = pages;
  }

  private updatePaginatedOngs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedOngs = this.ongs.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedOngs();
      this.updatePageNumbers();
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedOngs();
  }

  trackByOngId(index: number, ong: Ong): any {
    return ong.id || index;
  }

  formatCnpj(cnpj: string): string {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (digits.length === 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  }

  getAddressString(address: any): string {
    if (!address) return '';
   
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number);
    if (address.neighborhood) parts.push(address.neighborhood);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
   
    return parts.join(', ');
  }

  contactOng(ong: Ong, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
   
    const contactInfo = [];
    if (ong.phone) contactInfo.push(`Phone: ${this.formatPhone(ong.phone)}`);
    if (ong.email) contactInfo.push(`Email: ${ong.email}`);
   
    const message = contactInfo.length > 0
      ? `Contatp ${ong.name}:\n\n${contactInfo.join('\n')}`
      : `Informação de contato de ${ong.name} não está disponível.`;
   
    alert(message);
  }

  viewOngDetails(ong: Ong, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const ongId = ong.id || (ong as any).ongId || (ong as any).uuid || (ong as any).identifier;
   
    if (!ongId) {
      alert('Desculpe, mas os detalhes desta organização não podem ser vistos, pois não há ID disponível.');
      return;
    }
   
    this.router.navigate(['/ong', ongId]);
  }

  private showOngDetails(ong: Ong): void {
    const details = [
      `Organização: ${ong.name}`,
      `CNPJ: ${this.formatCnpj(ong.cnpj)}`,
      ong.email ? `Email: ${ong.email}` : '',
      ong.phone ? `Telefone: ${this.formatPhone(ong.phone)}` : '',
      ong.address ? `Endereço: ${this.getAddressString(ong.address)}` : ''
    ].filter(detail => detail !== '').join('\n');

    alert(`Detalhes da Organização:\n\n${details}`);
  }
}