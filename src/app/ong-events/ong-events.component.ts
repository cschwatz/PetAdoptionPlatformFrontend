import { Component, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OngEventService } from './ong-event.service';
import { Event as EventModel, EventTypeEnum } from './event.model';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-ong-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ong-events.component.html',
  styleUrls: ['./ong-events.component.scss']
})
export class OngEventsComponent implements OnInit {
  events: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  loading = false;
  error: string | null = null;
 
  selectedEventType = '';
  selectedTimeFilter = 'all';

  constructor(
    private eventService: OngEventService,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    if (this.loading) {
      return;
    }
    if (!this.authService.isLoggedInSync()) {
      this.error = 'Você deve estar logado para ver os eventos disponíveis.';
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.eventService.getAllEvents().subscribe({
      next: (events: EventModel[]) => {
        this.events = events;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        if (error.message.includes('forbidden') || error.message.includes('403')) {
          this.error = 'Acesso não permitido. Você não tem permissão para ver os eventos.';
        } else if (error.message.includes('401')) {
          this.error = 'Sua sessão expirou. Por favor realize o login novamente.';
          this.router.navigate(['/login']);
        } else {
          this.error = error.message || 'Falha ao carregar os eventos. Por favor tente novamente mais tarde.';
        }
       
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.events];

    if (this.selectedEventType) {
      filtered = filtered.filter(event => event.eventType === this.selectedEventType);
    }

    const now = new Date();
    if (this.selectedTimeFilter === 'Em breve') {
      filtered = filtered.filter(event => this.parseBackendDate(event.startDate) >= now);
    } else if (this.selectedTimeFilter === 'Encerrado') {
      filtered = filtered.filter(event => this.parseBackendDate(event.endDate) < now);
    }

    filtered.sort((a, b) => this.parseBackendDate(a.startDate).getTime() - this.parseBackendDate(b.startDate).getTime());

    this.filteredEvents = filtered;
  }

  onEventTypeChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEventType = target.value;
    this.applyFilters();
  }

  onTimeFilterChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    this.selectedTimeFilter = target.value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedEventType = '';
    this.selectedTimeFilter = 'all';
    this.applyFilters();
  }

  trackByEventId(index: number, event: EventModel): string {
    return event.id || `temp-${index}`;
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
      [EventTypeEnum.FUNDRAISING]: 'Angariamento de Fundos',
      [EventTypeEnum.AWARENESS_CAMPAIGN]: 'Campanha de Conscientização',
      [EventTypeEnum.VETERINARY_CLINIC]: 'Clínica Veterinária',
      [EventTypeEnum.VOLUNTEER_MEETING]: 'Encontro de Voluntários',
      [EventTypeEnum.OTHER]: 'Outros'
    };
    return labelMap[eventType] || eventType;
  }

  private parseBackendDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
   
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  }

  getEventStatus(event: EventModel): string {
    const now = new Date();
    const startDate = this.parseBackendDate(event.startDate);
    const endDate = this.parseBackendDate(event.endDate);


    if (endDate < now) return 'encerrado';
    if (startDate <= now && endDate >= now) return 'em_andamento';
    return 'em_breve';
  }

  getEventStatusLabel(event: EventModel): string {
    const status = this.getEventStatus(event);
    const statusMap: { [key: string]: string } = {
      'em_breve': 'Em breve',
      'em_andamento': 'Em andamento',
      'encerrado': 'Encerrado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  isPastEvent(event: EventModel): boolean {
    return this.parseBackendDate(event.endDate) < new Date();
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

  viewEventDetails(event: EventModel): void {
    if (!event.id) {
      alert('Erro: ID do evento não encontrado. Não é possível ver os detalhes do evento.');
      return;
    }
   
    if (event.id === 'my-events' || event.id.includes('my-events')) {
      alert('Erro: ID de evento inválido. Por favor recarregue a página e tente novamente.');
      return;
    }
   
    const navigationResult = this.router.navigate(['/event', event.id]);
  }

  contactOrganizer(event: EventModel): void {
    if (!event.ong) return;

    const contactInfo = [];
    if (event.ong.phone) contactInfo.push(`Telefone: ${event.ong.phone}`);
    if (event.ong.email) contactInfo.push(`Email: ${event.ong.email}`);

    const message = contactInfo.length > 0
      ? `Contato ${event.ong.name} para "${event.name}":\n\n${contactInfo.join('\n')}`
      : `Informações de contato de ${event.ong.name} não estão disponíveis.`;

    alert(message);
  }

  shareEvent(event: EventModel): void {
    const shareText = `Dê uma olhada neste evento: ${event.name} - ${this.formatDateTime(event.startDate)}`;
   
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Detalhes do evento foram copiados para a área de transferência!');
      }).catch(() => {
        alert(`Compartilhe este evento:\n\n${shareText}`);
      });
    }
  }
}