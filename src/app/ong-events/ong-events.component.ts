import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
 
  // Filters
  selectedEventType = '';
  selectedTimeFilter = 'all';


  constructor(
    private eventService: OngEventService,
    private router: Router,
    public authService: AuthService, // Make public for template access
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    console.log('🚀 OngEventsComponent ngOnInit called');
    this.loadEvents();
  }


  loadEvents(): void {
    console.log('📡 loadEvents called');
   
    if (this.loading) {
      console.log('⚠️ Already loading, skipping request');
      return;
    }


    // Check if user is authenticated
    if (!this.authService.isLoggedInSync()) {
      console.log('❌ User not authenticated, redirecting to login');
      this.error = 'You must be logged in to view events.';
      this.router.navigate(['/login']);
      return;
    }


    this.loading = true;
    this.error = null;


    this.eventService.getAllEvents().subscribe({
      next: (events: EventModel[]) => {
        console.log('✅ Events loaded:', events.length);
        this.events = events;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error loading events:', error);
       
        if (error.message.includes('forbidden') || error.message.includes('403')) {
          this.error = 'Access forbidden. You might not have permission to view events.';
        } else if (error.message.includes('401')) {
          this.error = 'Your session has expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = error.message || 'Failed to load events. Please try again later.';
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
    if (this.selectedTimeFilter === 'upcoming') {
      filtered = filtered.filter(event => this.parseBackendDate(event.startDate) >= now);
    } else if (this.selectedTimeFilter === 'past') {
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
    return event.id;
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
      [EventTypeEnum.ADOPTION_FAIR]: 'Adoption Fair',
      [EventTypeEnum.FUNDRAISING]: 'Fundraising',
      [EventTypeEnum.AWARENESS_CAMPAIGN]: 'Awareness Campaign',
      [EventTypeEnum.VETERINARY_CLINIC]: 'Veterinary Clinic',
      [EventTypeEnum.VOLUNTEER_MEETING]: 'Volunteer Meeting',
      [EventTypeEnum.OTHER]: 'Other'
    };
    return labelMap[eventType] || eventType;
  }


  private parseBackendDate(dateStr: string): Date {
    // Convert "dd/MM/yyyy HH:mm" format to Date object
    // Example: "30/08/2025 00:00" -> Date
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
    this.router.navigate(['/event', event.id]);
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


  createNewEvent(): void {
    console.log('🎯 Creating new event...');
    this.router.navigate(['/events/new']);
  }
}





