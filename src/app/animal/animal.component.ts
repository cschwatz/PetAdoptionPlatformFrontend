// animal-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdoptionService } from '../adoption/adoption.service';
import { Animal } from './animal.model';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animal-detail-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading animal details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button (click)="loadAnimal()" class="retry-btn">Try Again</button>
      </div>

      <!-- Animal Details -->
      <div *ngIf="animal && !loading && !error" class="animal-detail">
        <!-- Back Button -->
        <button (click)="goBack()" class="back-btn">
          ← Back to Animals
        </button>

        <div class="animal-content">
          <!-- Animal Image -->
          <div class="animal-image-section">
            <img 
              [src]="getImageSrc(animal.photo)" 
              [alt]="animal.name"
              (error)="onImageError($event)"
              class="animal-main-image">
            
            <div class="status-badge" [ngClass]="'status-' + (animal.adopted ? 'adopted' : 'available')">
              {{ animal.adopted ? 'Adopted' : 'Available' }}
            </div>
          </div>

          <!-- Animal Information -->
          <div class="animal-info-section">
            <div class="animal-header">
              <h1 class="animal-name">{{ animal.name }}</h1>
              <span class="animal-type">{{ animal.animalType }}</span>
            </div>

            <div class="animal-details">
              <div class="detail-group">
                <h3>Basic Information</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Breed:</span>
                    <span class="value">{{ animal.breed || 'Mixed' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Age:</span>
                    <span class="value">{{ animal.age }} {{ animal.age === 1 ? 'year' : 'years' }} old</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Gender:</span>
                    <span class="value">{{ animal.gender === 'M' ? 'Male' : 'Female' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Weight:</span>
                    <span class="value">{{ animal.weight }} kg</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Fur:</span>
                    <span class="value">{{ animal.fur }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Castrated:</span>
                    <span class="value">{{ animal.castrated ? 'Yes' : 'No' }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-group" *ngIf="animal.obs">
                <h3>About {{ animal.name }}</h3>
                <p class="animal-description">{{ animal.obs }}</p>
              </div>

              <div class="detail-group" *ngIf="animal.ong">
                <h3>Contact Information</h3>
                <div class="contact-info">
                  <div class="contact-item">
                    <span class="label">Organization:</span>
                    <span class="value">{{ animal.ong.name }}</span>
                  </div>
                  <div class="contact-item" *ngIf="animal.ong.email">
                    <span class="label">Email:</span>
                    <span class="value">
                      <a [href]="'mailto:' + animal.ong.email">{{ animal.ong.email }}</a>
                    </span>
                  </div>
                  <div class="contact-item" *ngIf="animal.ong.phone">
                    <span class="label">Phone:</span>
                    <span class="value">
                      <a [href]="'tel:' + animal.ong.phone">{{ animal.ong.phone }}</a>
                    </span>
                  </div>
                  <div class="contact-item" *ngIf="animal.ong.address">
                    <span class="label">Address:</span>
                    <span class="value">
                      {{ animal.ong.address.street }}, {{ animal.ong.address.number }}<br>
                      {{ animal.ong.address.neighborhood }}, {{ animal.ong.address.city }} - {{ animal.ong.address.state }}<br>
                      CEP: {{ animal.ong.address.cep }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons" *ngIf="!animal.adopted">
              <button class="adopt-btn primary" (click)="showInterest()">
                ❤️ I'm Interested in {{ animal.name }}
              </button>
              <button class="share-btn" (click)="shareAnimal()">
                📤 Share
              </button>
            </div>

            <div class="adopted-message" *ngIf="animal.adopted">
              <p>{{ animal.name }} has already found a loving home! 🎉</p>
              <button (click)="goBack()" class="back-btn-alt">Browse Other Animals</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animal-detail-container {
      max-width: 1200px;
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

    .back-btn {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      margin-bottom: 2rem;
      transition: background-color 0.3s;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .animal-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .animal-image-section {
      position: relative;
    }

    .animal-main-image {
      width: 100%;
      height: 500px;
      object-fit: cover;
    }

    .status-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-available {
      background-color: #28a745;
      color: white;
    }

    .status-adopted {
      background-color: #6c757d;
      color: white;
    }

    .animal-info-section {
      padding: 2rem;
    }

    .animal-header {
      margin-bottom: 2rem;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 1rem;
    }

    .animal-name {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2.5rem;
    }

    .animal-type {
      background-color: #007bff;
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 15px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .detail-group {
      margin-bottom: 2rem;
    }

    .detail-group h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-item {
      margin-bottom: 1rem;
    }

    .label {
      color: #666;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .value {
      color: #333;
      font-size: 1rem;
    }

    .value a {
      color: #007bff;
      text-decoration: none;
    }

    .value a:hover {
      text-decoration: underline;
    }

    .animal-description {
      color: #555;
      line-height: 1.6;
      font-size: 1.1rem;
    }

    .contact-info {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .adopt-btn {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s;
      flex: 1;
    }

    .adopt-btn:hover {
      background: linear-gradient(135deg, #ee5a52 0%, #dd4b4b 100%);
      transform: translateY(-2px);
    }

    .share-btn {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .share-btn:hover {
      background-color: #138496;
      transform: translateY(-2px);
    }

    .adopted-message {
      text-align: center;
      margin-top: 2rem;
      padding: 2rem;
      background-color: #d4edda;
      border-radius: 8px;
      color: #155724;
    }

    .back-btn-alt {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 1rem;
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

    @media (max-width: 768px) {
      .animal-detail-container {
        padding: 1rem;
      }

      .animal-content {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .animal-main-image {
        height: 300px;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class AnimalComponent implements OnInit {
  animal: Animal | null = null;
  loading = false;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adoptionService = inject(AdoptionService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnimal(id);
    } else {
      this.error = 'Invalid animal ID';
    }
  }

  loadAnimal(id?: string): void {
    const animalId = id;
    
    if (!animalId) {
      this.error = 'Invalid animal ID';
      return;
    }

    this.loading = true;
    this.error = null;

    this.adoptionService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading animal:', error);
        this.error = error.message || 'Failed to load animal details.';
        this.loading = false;
      }
    });
  }

  getImageSrc(photo: string | undefined): string {
    if (!photo) {
      return '/assets/default-animal.jpeg';
    }
    
    if (photo.startsWith('data:')) {
      return photo;
    }
    
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    
    if (photo.match(/^[A-Za-z0-9+/]/)) {
      return `data:image/jpeg;base64,${photo}`;
    }
    
    return '/assets/default-animal.jpeg';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/default-animal.jpeg';
    event.target.onerror = null;
  }

  goBack(): void {
    this.router.navigate(['/adoption']);
  }

  showInterest(): void {
    if (this.animal) {
      const message = `Hi! I'm interested in adopting ${this.animal.name}. Could you please provide more information?`;
      const email = this.animal.ong?.email;
      const phone = this.animal.ong?.phone;
      
      if (email) {
        window.open(`mailto:${email}?subject=Interest in ${this.animal.name}&body=${encodeURIComponent(message)}`);
      } else if (phone) {
        alert(`Please contact us at: ${phone}\n\nMessage: ${message}`);
      } else {
        alert(`Thank you for your interest in ${this.animal.name}! Please contact the organization for more information.`);
      }
    }
  }

  shareAnimal(): void {
    if (this.animal && navigator.share) {
      navigator.share({
        title: `Meet ${this.animal.name}`,
        text: `Check out this adorable ${this.animal.animalType.toLowerCase()} looking for a home!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  }
}