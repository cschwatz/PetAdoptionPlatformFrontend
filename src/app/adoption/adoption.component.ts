// adopt.component.ts - DEBUG VERSION
import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdoptionService } from './adoption.service';
import { Animal } from '../animal/animal.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="adopt-container">
      <header class="adopt-header">
        <h1>🐕 Find Your Perfect Companion</h1>
        <p>Browse our amazing animals looking for their forever homes</p>
      </header>


      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading adorable animals...</p>
      </div>


      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button (click)="loadAnimals()" class="retry-btn">Try Again</button>
      </div>


      <!-- Animals Grid -->
      <div *ngIf="!loading && !error" class="animals-section">
        <!-- Filter/Search Controls -->
        <div class="controls">
          <div class="animals-count">
            <span>{{ totalAnimals }} animals available for adoption</span>
          </div>
          <div class="page-size-selector">
            <label for="pageSize">Show: </label>
            <select id="pageSize" [value]="pageSize" (change)="onPageSizeChange($event)" class="page-size-select">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
            </select>
          </div>
        </div>


        <!-- Animals Cards Grid -->
        <div class="animals-grid" *ngIf="paginatedAnimals.length > 0">
          <div class="animal-card" *ngFor="let animal of paginatedAnimals; trackBy: trackByAnimalId"
               (click)="onCardClick(animal)">
           
            <div class="card-image">
              <img
                [src]="getImageSrc(animal.photo)"
                [alt]="animal.name"
                (error)="onImageError($event)"
                class="animal-image">
              <div class="status-badge" [ngClass]="'status-' + (animal.adopted ? 'adopted' : 'available')">
                {{ animal.adopted ? 'Adopted' : 'Available' }}
              </div>
            </div>
           
            <div class="card-content">
              <div class="animal-header">
                <h3 class="animal-name">{{ animal.name }}</h3>
                <span class="animal-species">{{ animal.animalType }}</span>
              </div>
             
              <div class="animal-details">
                <div class="detail-row" *ngIf="animal.breed">
                  <span class="label">Breed:</span>
                  <span class="value">{{ animal.breed }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Age:</span>
                  <span class="value">{{ animal.age }} {{ animal.age === 1 ? 'year' : 'years' }}</span>
                </div>
                <div class="detail-row" *ngIf="animal.gender">
                  <span class="label">Gender:</span>
                  <span class="value">{{ animal.gender === 'M' ? 'Male' : 'Female' }}</span>
                </div>
                <div class="detail-row" *ngIf="animal.weight">
                  <span class="label">Weight:</span>
                  <span class="value">{{ animal.weight }} kg</span>
                </div>
              </div>


              <p class="animal-description">{{ getShortDescription(animal.obs) }}</p>


              <div class="card-footer">
                <button class="adopt-btn" (click)="showInterest(animal, $event)">
                  ❤️ Show Interest
                </button>
                <button class="view-btn" (click)="viewAnimalDetails(animal, $event)">
                  👁️ View Details
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- Empty State -->
        <div *ngIf="paginatedAnimals.length === 0 && !loading" class="empty-state">
          <h3>🐾 No animals available right now</h3>
          <p>Check back soon for new furry friends looking for homes!</p>
        </div>


        <!-- Pagination -->
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
            Next →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .adopt-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }


    .adopt-header {
      text-align: center;
      margin-bottom: 3rem;
    }


    .adopt-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }


    .adopt-header p {
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


    .animals-count {
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


    .animals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }


    .animal-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      position: relative;
    }


    .animal-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }


    .animal-card.loading {
      pointer-events: none;
      opacity: 0.8;
    }


    .card-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      font-size: 0.9rem;
      color: #666;
    }


    .loading-spinner-small {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 0.5rem;
    }


    .card-image {
      position: relative;
      height: 250px;
      overflow: hidden;
    }


    .animal-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }


    .animal-card:hover .animal-image {
      transform: scale(1.05);
    }


    .status-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }


    .status-available {
      background-color: #28a745;
      color: white;
    }


    .status-pending {
      background-color: #ffc107;
      color: #333;
    }


    .status-adopted {
      background-color: #6c757d;
      color: white;
    }


    .card-content {
      padding: 1.5rem;
    }


    .animal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }


    .animal-name {
      margin: 0;
      color: #333;
      font-size: 1.4rem;
    }


    .animal-species {
      background-color: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
    }


    .animal-details {
      margin-bottom: 1rem;
    }


    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }


    .label {
      color: #666;
      font-weight: 500;
    }


    .value {
      color: #333;
    }


    .animal-description {
      color: #666;
      line-height: 1.5;
      margin-bottom: 1rem;
    }


    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }


    .feature-badge {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
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


    .adoption-fee {
      color: #28a745;
      font-weight: bold;
    }


    .adopt-btn {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
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


    .adopt-btn:hover {
      background: linear-gradient(135deg, #ee5a52 0%, #dd4b4b 100%);
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
      .adopt-container {
        padding: 1rem;
      }


      .animals-grid {
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
    }
  `]
})
export class AdoptionComponent implements OnInit {
  animals: Animal[] = [];
  paginatedAnimals: Animal[] = [];
  loading = false;
  error: string | null = null;
 
  // Pagination
  currentPage = 1;
  pageSize = 8;
  totalAnimals = 0;
  totalPages = 0;
 
  // Cache page numbers to avoid recalculating on every change detection
  pageNumbers: number[] = [];


  constructor(
    private adoptionService: AdoptionService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  ngOnInit(): void {
    console.log('🚀 AdoptionComponent ngOnInit called');
    this.loadAnimals();
  }


  loadAnimals(): void {
    console.log('📡 loadAnimals called');
   
    if (this.loading) {
      console.log('⚠️ Already loading, skipping request');
      return;
    }


    this.loading = true;
    this.error = null;


    this.adoptionService.getAnimals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (animals) => {
          console.log('✅ Animals loaded:', animals.length);
          this.animals = animals;
          this.totalAnimals = animals.length;
          this.calculatePagination();
          this.updatePaginatedAnimals();
          this.loading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (error) => {
          console.error('❌ Error loading animals:', error);
          this.error = error.message || 'Failed to load animals. Please try again later.';
          this.loading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        }
      });
  }


  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalAnimals / this.pageSize);
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


  private updatePaginatedAnimals(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAnimals = this.animals.slice(startIndex, endIndex);
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedAnimals();
      this.updatePageNumbers();
    }
  }


  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedAnimals();
  }


  // TrackBy function to optimize *ngFor performance
  trackByAnimalId(index: number, animal: Animal): any {
    return animal.id || index;
  }


  // Method to avoid inline operations in template
  getShortDescription(obs: string | undefined): string {
    if (!obs) return '';
    return obs.length > 100 ? obs.slice(0, 100) + '...' : obs;
  }


  // Method to handle different image formats
  getImageSrc(photo: string | undefined): string {
    if (!photo) {
      return '/assets/default-animal.jpg';
    }
   
    // If it's already a complete data URL, return as-is
    if (photo.startsWith('data:')) {
      return photo;
    }
   
    // If it's already a complete HTTP URL, return as-is
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
   
    // If it looks like base64 (starts with base64 characters), add data URL prefix
    if (photo.match(/^[A-Za-z0-9+/]/)) {
      return `data:image/jpeg;base64,${photo}`;
    }
   
    // Default fallback
    return '/assets/default-animal.jpg';
  }


  onImageError(event: any): void {
    // Use a data URL for a simple placeholder instead of a missing file
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
   
    // Prevent infinite loops by removing the error handler
    event.target.onerror = null;
  }


  showInterest(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent card click from triggering
    }
    alert(`Thank you for your interest in ${animal.name}! Contact information: ${animal.ong?.phone || 'Please contact the shelter.'}`);
  }


  viewAnimalDetails(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent card click from triggering
    }
    console.log('🔍 Navigating to animal details for:', animal.name, 'ID:', animal.id);
    this.router.navigate(['/animal', animal.id]);
  }


  onCardClick(animal: Animal): void {
    console.log('🐾 Card clicked for animal:', animal.name, 'ID:', animal.id);
    this.router.navigate(['/animal', animal.id]);
  }
}