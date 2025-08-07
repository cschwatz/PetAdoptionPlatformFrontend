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
    private authService: AuthService, // Made private since no longer needed in template
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


    // Filter by event type
    if (this.selectedEventType) {
      filtered = filtered.filter(event => event.eventType === this.selectedEventType);
    }


    // Filter by time
    const now = new Date();
    if (this.selectedTimeFilter === 'Em breve') {
      filtered = filtered.filter(event => this.parseBackendDate(event.startDate) >= now);
    } else if (this.selectedTimeFilter === 'Encerrado') {
      filtered = filtered.filter(event => this.parseBackendDate(event.endDate) < now);
    }


    // Sort by start date (upcoming first)
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
   
    // Note: Month is 0-indexed in JavaScript Date
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  }


  getEventStatus(event: EventModel): string {
    const now = new Date();
    const startDate = this.parseBackendDate(event.startDate);
    const endDate = this.parseBackendDate(event.endDate);


    if (endDate < now) return 'past';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'upcoming';
  }


  getEventStatusLabel(event: EventModel): string {
    const status = this.getEventStatus(event);
    const statusMap: { [key: string]: string } = {
      'upcoming': 'Upcoming',
      'ongoing': 'Ongoing',
      'past': 'Past'
    };
    return statusMap[status] || 'Unknown';
  }


  isPastEvent(event: EventModel): boolean {
    return this.parseBackendDate(event.endDate) < new Date();
  }


  formatDateTime(dateTimeStr: string): string {
    const date = this.parseBackendDate(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    console.log('🔍 Viewing event details:', event.name);
    console.log('🔍 Event object:', event);
    console.log('🔍 Event ID:', event.id);
    console.log('🔍 Event ID type:', typeof event.id);
    console.log('🔍 Event ID length:', event.id?.length);
   
    if (!event.id) {
      console.error('❌ Event ID is missing!', event);
      alert('Error: Event ID is missing. Cannot view event details.');
      return;
    }
   
    if (event.id === 'my-events' || event.id.includes('my-events')) {
      console.error('❌ Invalid event ID detected:', event.id);
      alert('Error: Invalid event ID. Please refresh the page and try again.');
      return;
    }
   
    console.log('🚀 Navigating to route:', ['/event', event.id]);
    const navigationResult = this.router.navigate(['/event', event.id]);
    console.log('🚀 Navigation result:', navigationResult);
  }


  contactOrganizer(event: EventModel): void {
    if (!event.ong) return;


    const contactInfo = [];
    if (event.ong.phone) contactInfo.push(`Phone: ${event.ong.phone}`);
    if (event.ong.email) contactInfo.push(`Email: ${event.ong.email}`);


    const message = contactInfo.length > 0
      ? `Contact ${event.ong.name} about "${event.name}":\n\n${contactInfo.join('\n')}`
      : `Contact information for ${event.ong.name} is not available.`;


    alert(message);
  }


  shareEvent(event: EventModel): void {
    const shareText = `Check out this event: ${event.name} - ${this.formatDateTime(event.startDate)}`;
   
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Event details copied to clipboard!');
      }).catch(() => {
        alert(`Share this event:\n\n${shareText}`);
      });
    }
  }
}