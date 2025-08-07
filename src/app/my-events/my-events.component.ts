import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyEventsService } from './my-events.service';
import { Event as EventModel, EventTypeEnum } from '../ong-events/event.model';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-events-container">
      <header class="my-events-header">
        <h1>📅 Meus Eventos</h1>
        <p>Gerencie os eventos e atividades da sua organização</p>
        <button class="add-event-btn" (click)="addNewEvent()">
          ➕ Adicionar Novo Evento
        </button>
      </header>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando seus eventos...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Ops! Alguma patinha se enroscou nos cabos</h3>
        <p>{{ error }}</p>
        <button (click)="loadMyEvents()" class="retry-btn">Tentar Novamente</button>
      </div>

      <div *ngIf="!loading && !error" class="events-section">
        <div class="controls">
          <div class="events-count">
            <span>{{ totalEvents }} eventos organizados por você</span>
          </div>
          <div class="page-size-selector">
            <label for="pageSize">Mostrar: </label>
            <select id="pageSize" [value]="pageSize" (change)="onPageSizeChange($event)" class="page-size-select">
              <option value="5">5 por página</option>
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
            </select>
          </div>
        </div>

        <div class="events-grid" *ngIf="paginatedEvents.length > 0">
          <div class="event-card" *ngFor="let event of paginatedEvents; trackBy: trackByEventId">
           
            <div class="card-header">
              <div class="event-icon">{{ getEventIcon(event.eventType) }}</div>
              <div class="event-type">{{ getEventTypeLabel(event.eventType) }}</div>
              <div class="status-badge" [ngClass]="'status-' + getEventStatus(event)">
                {{ getEventStatusLabel(event) }}
              </div>
            </div>
           
            <div class="card-content">
              <div class="event-header">
                <h3 class="event-name">{{ event.name }}</h3>
                <p class="event-location" *ngIf="event.address">
                  📍 {{ getAddressString(event.address) }}
                </p>
              </div>
             
              <div class="event-details">
                <div class="detail-row">
                  <span class="label">Início:</span>
                  <span class="value">{{ formatDateTime(event.startDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Fim:</span>
                  <span class="value">{{ formatDateTime(event.endDate) }}</span>
                </div>
              </div>

              <p class="event-description" *ngIf="event.obs">{{ event.obs.length > 100 ? event.obs.substring(0, 100) + '...' : event.obs }}</p>

              <div class="card-footer">
                <button class="edit-btn" (click)="editEvent(event)">
                  ✏️ Editar
                </button>
                <button class="view-btn" (click)="viewEventDetails(event)">
                  Ver
                </button>
                <button class="delete-btn" (click)="deleteEvent(event)">
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="paginatedEvents.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>Nenhum Evento Ainda</h3>
          <p>Você ainda não criou nenhum evento. Crie seu primeiro evento para começar!</p>
          <button class="add-event-btn-large" (click)="addNewEvent()">
            ➕ Criar Seu Primeiro Evento
          </button>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button
            class="pagination-btn"
            (click)="previousPage()"
            [disabled]="currentPage === 1">
            ← Anterior
          </button>
         
          <div class="pagination-info">
            <span>Página {{ currentPage }} de {{ totalPages }}</span>
          </div>
         
          <button
            class="pagination-btn"
            (click)="nextPage()"
            [disabled]="currentPage === totalPages">
            Próxima →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-events-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Arial', sans-serif;
    }

    .my-events-header {
      text-align: center;
      margin-bottom: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .my-events-header h1 {
      font-size: 2.5em;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .my-events-header p {
      font-size: 1.2em;
      margin: 0 0 30px 0;
      opacity: 0.9;
    }

    .add-event-btn, .add-event-btn-large {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 1.1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
    }

    .add-event-btn:hover, .add-event-btn-large:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4);
    }

    .add-event-btn-large {
      padding: 15px 30px;
      font-size: 1.2em;
    }

    .loading-container {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      text-align: center;
      padding: 60px 20px;
      background: #fff5f5;
      border: 2px solid #fed7d7;
      border-radius: 10px;
      margin: 20px 0;
    }

    .error-container h3 {
      color: #e53e3e;
      margin-bottom: 10px;
    }

    .retry-btn {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 15px;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .events-count {
      font-size: 1.1em;
      font-weight: 600;
      color: #4a5568;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-size-select {
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 5px;
      font-size: 14px;
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }

    .event-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid #e2e8f0;
    }

    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .event-icon {
      font-size: 2em;
    }

    .event-type {
      flex: 1;
      font-weight: 600;
      font-size: 1.1em;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-upcoming {
      background: #48bb78;
      color: white;
    }

    .status-ongoing {
      background: #ed8936;
      color: white;
    }

    .status-past {
      background: #a0aec0;
      color: white;
    }

    .card-content {
      padding: 25px;
    }

    .event-header {
      margin-bottom: 20px;
    }

    .event-name {
      font-size: 1.4em;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 10px 0;
    }

    .event-location {
      color: #718096;
      margin: 0;
      font-size: 0.95em;
    }

    .event-details {
      margin-bottom: 15px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.95em;
    }

    .detail-row .label {
      font-weight: 600;
      color: #4a5568;
    }

    .detail-row .value {
      color: #718096;
    }

    .event-description {
      color: #718096;
      font-size: 0.95em;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .card-footer {
      display: flex;
      gap: 10px;
    }

    .edit-btn, .view-btn, .delete-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9em;
    }

    .edit-btn {
      background: #4299e1;
      color: white;
    }

    .edit-btn:hover {
      background: #3182ce;
    }

    .view-btn {
      background: #48bb78;
      color: white;
    }

    .view-btn:hover {
      background: #38a169;
    }

    .delete-btn {
      background: #e53e3e;
      color: white;
    }

    .delete-btn:hover {
      background: #c53030;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4em;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 1.8em;
      color: #4a5568;
      margin-bottom: 15px;
    }

    .empty-state p {
      color: #718096;
      font-size: 1.1em;
      margin-bottom: 30px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 40px;
    }

    .pagination-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .pagination-btn:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    .pagination-btn:not(:disabled):hover {
      background: #5a67d8;
    }

    .pagination-info {
      font-weight: 600;
      color: #4a5568;
    }

    @media (max-width: 768px) {
      .events-grid {
        grid-template-columns: 1fr;
      }

      .controls {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .my-events-header h1 {
        font-size: 2em;
      }

      .card-footer {
        flex-direction: column;
      }
    }
  `]
})
export class MyEventsComponent implements OnInit {
  events: EventModel[] = [];
  paginatedEvents: EventModel[] = [];
  loading = false;
  error: string | null = null;
 
  currentPage = 1;
  pageSize = 5;
  totalEvents = 0;
  totalPages = 0;

  constructor(
    private myEventsService: MyEventsService,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isOng()) {
      this.error = 'Você deve estar logado como uma ONG para gerenciar eventos.';
      return;
    }

    this.loadMyEvents();
  }

  loadMyEvents(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.myEventsService.getMyEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.events = events as EventModel[];
          this.totalEvents = (events as EventModel[]).length;
          this.calculatePagination();
          this.updatePaginatedEvents();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.error = error.message || 'Falha ao carregar eventos.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalEvents / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  updatePaginatedEvents(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.events.slice(startIndex, endIndex);
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedEvents();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedEvents();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  trackByEventId(index: number, event: EventModel): string {
    return event.id;
  }

  addNewEvent(): void {
    this.router.navigate(['/events/new']);
  }

  editEvent(event: EventModel): void {
    this.router.navigate(['/event/edit', event.id]);
  }

  viewEventDetails(event: EventModel): void {
    this.router.navigate(['/event', event.id]);
  }

  deleteEvent(event: EventModel): void {
    const confirmed = confirm(`Tem certeza de que deseja excluir "${event.name}"? Esta ação não pode ser desfeita.`);
   
    if (confirmed) {
      this.myEventsService.deleteMyEvent(event.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadMyEvents(); // Reload the list
          },
          error: (error: any) => {
            alert('Falha ao excluir evento. Tente novamente.');
          }
        });
    }
  }

  private parseBackendDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
   
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  }

  getEventIcon(eventType: EventTypeEnum): string {
    const iconMap = {
      [EventTypeEnum.ADOPTION_FAIR]: '🏠',
      [EventTypeEnum.FUNDRAISING]: '💰',
      [EventTypeEnum.AWARENESS_CAMPAIGN]: '📢',
      [EventTypeEnum.VETERINARY_CLINIC]: '🏥',
      [EventTypeEnum.VOLUNTEER_MEETING]: '🤝',
      [EventTypeEnum.OTHER]: '📅'
    };
    return iconMap[eventType] || '📅';
  }

  getEventTypeLabel(eventType: EventTypeEnum): string {
    const labelMap = {
      [EventTypeEnum.ADOPTION_FAIR]: 'Feira de Adoção',
      [EventTypeEnum.FUNDRAISING]: 'Arrecadação de Fundos',
      [EventTypeEnum.AWARENESS_CAMPAIGN]: 'Campanha de Conscientização',
      [EventTypeEnum.VETERINARY_CLINIC]: 'Clínica Veterinária',
      [EventTypeEnum.VOLUNTEER_MEETING]: 'Reunião de Voluntários',
      [EventTypeEnum.OTHER]: 'Outro'
    };
    return labelMap[eventType] || eventType;
  }

  getEventStatus(event: EventModel): string {
    const now = new Date();
    const startDate = this.parseBackendDate(event.startDate);
    const endDate = this.parseBackendDate(event.endDate);

    if (endDate < now) return 'past';
    if (startDate <= now && endDate >= now) return 'em_andamento';
    return 'em_breve';
  }

  getEventStatusLabel(event: EventModel): string {
    const status = this.getEventStatus(event);
    const statusMap: { [key: string]: string } = {
      'em_breve': 'Em breve',
      'em_andamento': 'Em Andamento',
      'encerrado': 'Encerrado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  formatDateTime(dateTimeStr: string): string {
    const date = this.parseBackendDate(dateTimeStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
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
}