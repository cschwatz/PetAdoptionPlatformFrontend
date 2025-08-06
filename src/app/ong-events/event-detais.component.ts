import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OngEventService } from './ong-event.service';
import { Event as EventModel, EventTypeEnum } from './event.model';


@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-details-container">
      <!-- Header with back button -->
      <header class="event-header">
        <button (click)="goBack()" class="back-btn">
          ← Back to Events
        </button>
        <h1 *ngIf="event">{{ getEventIcon(event.eventType) }} {{ event.name }}</h1>
        <div *ngIf="event" class="event-status-header">
          <span class="status-badge" [ngClass]="getEventStatus(event)">
            {{ getEventStatusLabel(event) }}
          </span>
          <span class="event-type">{{ getEventTypeLabel(event.eventType) }}</span>
        </div>
      </header>


      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>


      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button (click)="loadEvent()" class="retry-btn">Try Again</button>
      </div>


      <!-- Event Details -->
      <div *ngIf="!loading && !error && event" class="event-content">
        <div class="event-details-grid">
         
          <!-- Main Info Card -->
          <div class="detail-card main-info">
            <div class="card-header">
              <h2>📅 Event Information</h2>
            </div>
            <div class="card-content">
              <div class="detail-row">
                <strong>Start Date & Time:</strong>
                <span>{{ formatDateTime(event.startDate) }}</span>
              </div>
              <div class="detail-row">
                <strong>End Date & Time:</strong>
                <span>{{ formatDateTime(event.endDate) }}</span>
              </div>
              <div class="detail-row">
                <strong>Event Type:</strong>
                <span>{{ getEventIcon(event.eventType) }} {{ getEventTypeLabel(event.eventType) }}</span>
              </div>
              <div class="detail-row">
                <strong>Status:</strong>
                <span class="status-badge" [ngClass]="getEventStatus(event)">
                  {{ getEventStatusLabel(event) }}
                </span>
              </div>
            </div>
          </div>


          <!-- Location Card -->
          <div class="detail-card location-info" *ngIf="event.address">
            <div class="card-header">
              <h2>📍 Location</h2>
            </div>
            <div class="card-content">
              <div class="address-details">
                <p><strong>{{ getAddressString(event.address) }}</strong></p>
                <div class="address-components" *ngIf="event.address">
                  <div class="detail-row" *ngIf="event.address.street">
                    <strong>Street:</strong>
                    <span>{{ event.address.street }} {{ event.address.number }}</span>
                  </div>
                  <div class="detail-row" *ngIf="event.address.neighborhood">
                    <strong>Neighborhood:</strong>
                    <span>{{ event.address.neighborhood }}</span>
                  </div>
                  <div class="detail-row" *ngIf="event.address.city">
                    <strong>City:</strong>
                    <span>{{ event.address.city }}, {{ event.address.state }}</span>
                  </div>
                  <div class="detail-row" *ngIf="event.address.cep">
                    <strong>CEP:</strong>
                    <span>{{ formatCep(event.address.cep) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- Organizer Card -->
          <div class="detail-card organizer-info" *ngIf="event.ong">
            <div class="card-header">
              <h2>🏢 Organizer</h2>
            </div>
            <div class="card-content">
              <div class="organizer-details">
                <h3>{{ event.ong.name }}</h3>
                <div class="detail-row" *ngIf="event.ong.email">
                  <strong>Email:</strong>
                  <a [href]="'mailto:' + event.ong.email">{{ event.ong.email }}</a>
                </div>
                <div class="detail-row" *ngIf="event.ong.phone">
                  <strong>Phone:</strong>
                  <a [href]="'tel:' + event.ong.phone">{{ event.ong.phone }}</a>
                </div>
                <div class="detail-row" *ngIf="event.ong.cnpj">
                  <strong>CNPJ:</strong>
                  <span>{{ formatCnpj(event.ong.cnpj) }}</span>
                </div>
                <div class="organizer-actions">
                  <button (click)="contactOrganizer()" class="contact-btn">
                    📞 Contact Organizer
                  </button>
                  <button (click)="viewOngDetails()" class="view-ong-btn">
                    🏢 View ONG Profile
                  </button>
                </div>
              </div>
            </div>
          </div>


          <!-- Description Card -->
          <div class="detail-card description-info" *ngIf="event.obs">
            <div class="card-header">
              <h2>📝 Description</h2>
            </div>
            <div class="card-content">
              <div class="description-text">
                <p>{{ event.obs }}</p>
              </div>
            </div>
          </div>


        </div>


        <!-- Action Buttons -->
        <div class="action-buttons">
          <button (click)="shareEvent()" class="share-btn">
            🔗 Share Event
          </button>
          <button (click)="goBack()" class="back-btn-bottom">
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }


    .event-header {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
    }


    .back-btn {
      position: absolute;
      left: 0;
      top: 0;
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s;
    }


    .back-btn:hover {
      background: #5a6268;
    }


    .event-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }


    .event-status-header {
      display: flex;
      justify-content: center;
      gap: 1rem;
      align-items: center;
    }


    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }


    .status-badge.upcoming {
      background: #e3f2fd;
      color: #1976d2;
    }


    .status-badge.ongoing {
      background: #e8f5e8;
      color: #388e3c;
    }


    .status-badge.past {
      background: #fce4ec;
      color: #c2185b;
    }


    .event-type {
      background: #f3e5f5;
      color: #7b1fa2;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
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


    .event-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }


    .detail-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }


    .detail-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }


    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
    }


    .card-header h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
    }


    .card-content {
      padding: 2rem;
    }


    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }


    .detail-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }


    .detail-row strong {
      color: #333;
      font-weight: 600;
      min-width: 120px;
    }


    .detail-row span, .detail-row a {
      color: #666;
      text-align: right;
      flex: 1;
    }


    .detail-row a {
      color: #007bff;
      text-decoration: none;
    }


    .detail-row a:hover {
      text-decoration: underline;
    }


    .address-details {
      text-align: center;
    }


    .address-details > p {
      font-size: 1.1rem;
      color: #333;
      margin-bottom: 1.5rem;
    }


    .address-components {
      text-align: left;
    }


    .organizer-details h3 {
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 1.4rem;
    }


    .organizer-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }


    .contact-btn, .view-ong-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }


    .contact-btn {
      background: #28a745;
      color: white;
    }


    .contact-btn:hover {
      background: #218838;
    }


    .view-ong-btn {
      background: #6f42c1;
      color: white;
    }


    .view-ong-btn:hover {
      background: #5a32a3;
    }


    .description-text {
      line-height: 1.6;
      color: #555;
    }


    .description-text p {
      margin: 0;
      font-size: 1.1rem;
    }


    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 3rem;
    }


    .share-btn, .back-btn-bottom {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
    }


    .share-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }


    .share-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }


    .back-btn-bottom {
      background: #6c757d;
      color: white;
    }


    .back-btn-bottom:hover {
      background: #5a6268;
    }


    @media (max-width: 768px) {
      .event-details-container {
        padding: 1rem;
      }


      .back-btn {
        position: static;
        margin-bottom: 1rem;
      }


      .event-details-grid {
        grid-template-columns: 1fr;
      }


      .organizer-actions {
        flex-direction: column;
      }


      .action-buttons {
        flex-direction: column;
        align-items: center;
      }


      .share-btn, .back-btn-bottom {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class EventDetailsComponent implements OnInit {
  event: EventModel | null = null;
  loading = false;
  error: string | null = null;
  eventId: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: OngEventService,
    private destroyRef: DestroyRef
  ) {}


  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEvent();
    } else {
      this.error = 'No event ID provided.';
    }
  }


  loadEvent(): void {
    if (!this.eventId) return;


    this.loading = true;
    this.error = null;


    this.eventService.getEventById(this.eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event: EventModel) => {
          console.log('✅ Event details loaded:', event);
          this.event = event;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('❌ Error loading event details:', error);
          this.error = error.message || 'Failed to load event details.';
          this.loading = false;
        }
      });
  }


  private parseBackendDate(dateStr: string): Date {
    // Convert "dd/MM/yyyy HH:mm" format to Date object
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
      [EventTypeEnum.ADOPTION_FAIR]: 'Adoption Fair',
      [EventTypeEnum.FUNDRAISING]: 'Fundraising',
      [EventTypeEnum.AWARENESS_CAMPAIGN]: 'Awareness Campaign',
      [EventTypeEnum.VETERINARY_CLINIC]: 'Veterinary Clinic',
      [EventTypeEnum.VOLUNTEER_MEETING]: 'Volunteer Meeting',
      [EventTypeEnum.OTHER]: 'Other'
    };
    return labelMap[eventType] || eventType;
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


  formatDateTime(dateTimeStr: string): string {
    const date = this.parseBackendDate(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  formatCep(cep: string): string {
    if (!cep) return '';
    // Format CEP as XXXXX-XXX
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }


  formatCnpj(cnpj: string): string {
    if (!cnpj) return '';
    // Format CNPJ as XX.XXX.XXX/XXXX-XX
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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


  contactOrganizer(): void {
    if (!this.event?.ong) return;


    const contactInfo = [];
    if (this.event.ong.phone) contactInfo.push(`Phone: ${this.event.ong.phone}`);
    if (this.event.ong.email) contactInfo.push(`Email: ${this.event.ong.email}`);


    const message = contactInfo.length > 0
      ? `Contact ${this.event.ong.name} about "${this.event.name}":\n\n${contactInfo.join('\n')}`
      : `Contact information for ${this.event.ong.name} is not available.`;


    alert(message);
  }


  viewOngDetails(): void {
    if (this.event?.ong?.id) {
      this.router.navigate(['/ong', this.event.ong.id]);
    }
  }


  shareEvent(): void {
    if (!this.event) return;


    const shareText = `Check out this event: ${this.event.name} - ${this.formatDateTime(this.event.startDate)}`;
   
    if (navigator.share) {
      navigator.share({
        title: this.event.name,
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


  goBack(): void {
    this.router.navigate(['/ong-events']);
  }
}