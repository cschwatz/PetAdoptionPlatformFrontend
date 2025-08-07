// adopt.component.ts - DEBUG VERSION
import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdoptionService } from './adoption.service';
import { Animal } from '../animal/animal.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="adopt-container">
      <header class="adopt-header">
        <h1>🐕 Encontre Seu Companheiro Perfeito</h1>
        <p>Navegue pelos nossos incríveis animais procurando por seus lares definitivos</p>
      </header>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando animais adoráveis...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Ops! Algo deu errado</h3>
        <p>{{ error }}</p>
        <button (click)="loadAnimals()" class="retry-btn">Tentar Novamente</button>
      </div>

      <div *ngIf="!loading && !error" class="animals-section">
        <!-- Filter/Search Controls -->
        <div class="filter-section">
          <h3>🔍 Filtrar Animais</h3>
          <form [formGroup]="filterForm" class="filter-form">
            <div class="filter-row">
              <div class="filter-group">
                <label for="searchName">Buscar por Nome</label>
                <input
                  type="text"
                  id="searchName"
                  formControlName="searchName"
                  placeholder="Digite o nome do animal..."
                  class="filter-input">
              </div>
             
              <div class="filter-group">
                <label for="animalType">Tipo de Animal</label>
                <select id="animalType" formControlName="animalType" class="filter-select">
                  <option value="">Todos os Tipos</option>
                  <option value="DOG">Cachorros</option>
                  <option value="CAT">Gatos</option>
                  <option value="BIRD">Pássaros</option>
                  <option value="RABBIT">Coelhos</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="gender">Sexo</label>
                <select id="gender" formControlName="gender" class="filter-select">
                  <option value="">Qualquer Sexo</option>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
            </div>

            <div class="filter-row">
              <div class="filter-group">
                <label for="minAge">Idade Mín (anos)</label>
                <input
                  type="number"
                  id="minAge"
                  formControlName="minAge"
                  placeholder="0"
                  min="0"
                  class="filter-input">
              </div>

              <div class="filter-group">
                <label for="maxAge">Idade Máx (anos)</label>
                <input
                  type="number"
                  id="maxAge"
                  formControlName="maxAge"
                  placeholder="Qualquer"
                  min="0"
                  class="filter-input">
              </div>

              <div class="filter-group">
                <label for="fur">Tipo de Pelagem</label>
                <select id="fur" formControlName="fur" class="filter-select">
                  <option value="">Qualquer Pelagem</option>
                  <option value="SHORT">Curta</option>
                  <option value="MEDIUM">Média</option>
                  <option value="LONG">Longa</option>
                  <option value="NONE">Nenhuma</option>
                </select>
              </div>
            </div>

            <div class="filter-row">
              <div class="filter-group">
                <label for="breed">Raça</label>
                <input
                  type="text"
                  id="breed"
                  formControlName="breed"
                  placeholder="Digite a raça..."
                  class="filter-input">
              </div>

              <div class="filter-group">
                <label for="color">Cor</label>
                <input
                  type="text"
                  id="color"
                  formControlName="color"
                  placeholder="Digite a cor..."
                  class="filter-input">
              </div>

              <div class="filter-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    formControlName="castratedOnly">
                  <span class="checkmark"></span>
                  Apenas Castrados/Esterilizados
                </label>
              </div>
            </div>

            <div class="filter-actions">
              <button type="button" (click)="clearFilters()" class="clear-btn">
                🗑️ Limpar Filtros
              </button>
              <button type="button" (click)="applyFilters()" class="apply-btn">
                ✨ Aplicar Filtros
              </button>
            </div>
          </form>
        </div>

        <div class="controls">
          <div class="animals-count">
            <span>{{ filteredAnimals.length }} animais encontrados</span>
            <span *ngIf="hasActiveFilters()" class="filter-indicator">
              ({{ totalAnimals }} total disponível)
            </span>
          </div>
          <div class="page-size-selector">
            <label for="pageSize">Mostrar:</label>
            <select id="pageSize" [value]="pageSize" (change)="onPageSizeChange($event)" class="page-size-select">
              <option value="6">6 por página</option>
              <option value="12">12 por página</option>
              <option value="24">24 por página</option>
            </select>
          </div>
        </div>        
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
                {{ animal.adopted ? 'Adotado' : 'Disponível' }}
              </div>
            </div>
           
            <div class="card-content">
              <div class="animal-header">
                <h3 class="animal-name">{{ animal.name }}</h3>
                <span class="animal-species">{{ animal.animalType }}</span>
              </div>
             
              <div class="animal-details">
                <div class="detail-row" *ngIf="animal.breed">
                  <span class="label">Raça:</span>
                  <span class="value">{{ animal.breed }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Idade:</span>
                  <span class="value">{{ animal.age }} {{ animal.age === 1 ? 'ano' : 'anos' }}</span>
                </div>
                <div class="detail-row" *ngIf="animal.gender">
                  <span class="label">Sexo:</span>
                  <span class="value">{{ animal.gender === 'M' ? 'Macho' : 'Fêmea' }}</span>
                </div>
                <div class="detail-row" *ngIf="animal.weight">
                  <span class="label">Peso:</span>
                  <span class="value">{{ animal.weight }} kg</span>
                </div>
              </div>

              <p class="animal-description">{{ getShortDescription(animal.obs) }}</p>

              <div class="card-footer">
                <button class="adopt-btn" (click)="showInterest(animal, $event)">
                  ❤️ Mostrar Interesse
                </button>
                <button class="view-btn" (click)="viewAnimalDetails(animal, $event)">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="paginatedAnimals.length === 0 && !loading" class="empty-state">
          <h3>🐾 Nenhum animal disponível no momento</h3>
          <p>Volte em breve para novos amigos peludos procurando por lares!</p>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)">
            ← Anterior
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
            Próxima →
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

    .filter-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .filter-section h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.4rem;
      font-weight: bold;
    }

    .filter-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      font-weight: 600;
      color: #555;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .filter-input,
    .filter-select {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
      background: white;
    }

    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .filter-input::placeholder {
      color: #999;
    }

    .checkbox-group {
      justify-content: center;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 600;
      color: #555;
      margin-top: 1.5rem;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 0.5rem;
      transform: scale(1.2);
    }

    .filter-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .clear-btn,
    .apply-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .clear-btn {
      background: #6c757d;
      color: white;
    }

    .clear-btn:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .apply-btn {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
    }

    .apply-btn:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
    }

    .filter-indicator {
      color: #007bff;
      font-style: italic;
      font-size: 0.9rem;
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

      .filter-section {
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .filter-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .filter-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .clear-btn,
      .apply-btn {
        width: 100%;
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
  filteredAnimals: Animal[] = [];
  paginatedAnimals: Animal[] = [];
  loading = false;
  error: string | null = null;
 
  filterForm!: FormGroup;
 
  currentPage = 1;
  pageSize = 12;
  totalAnimals = 0;
  totalPages = 0;
  pageNumbers: number[] = [];

  constructor(
    private adoptionService: AdoptionService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.filteredAnimals = [...this.animals]; // Initialize filtered animals
    this.loadAnimals();
  }

  loadAnimals(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.adoptionService.getAnimals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (animals) => {
          this.animals = animals as Animal[];
          this.totalAnimals = (animals as Animal[]).length;
          this.filteredAnimals = [...(animals as Animal[])]; // Initialize filtered animals
          this.calculatePagination();
          this.updatePaginatedAnimals();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = error.message || 'Falha ao carregar animais. Tente novamente mais tarde.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAnimals.length / this.pageSize);
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
    this.paginatedAnimals = this.filteredAnimals.slice(startIndex, endIndex);
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

  trackByAnimalId(index: number, animal: Animal): any {
    return animal.id || index;
  }

  getShortDescription(obs: string | undefined): string {
    if (!obs) return '';
    return obs.length > 100 ? obs.slice(0, 100) + '...' : obs;
  }

  getImageSrc(photo: string | undefined): string {
    if (!photo) {
      return '/assets/default-animal.jpg';
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
   
    return '/assets/default-animal.jpg';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/default-animal.jpg';
   
    target.onerror = null;
  }

  showInterest(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent card click from triggering
    }
    alert(`Obrigado pelo seu interesse em ${animal.name}! Informações de contato: ${animal.ong?.phone || 'Por favor, entre em contato com o abrigo.'}`);
  }

  viewAnimalDetails(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent card click from triggering
    }
    this.router.navigate(['/animal', animal.id]);
  }

  onCardClick(animal: Animal): void {
    this.router.navigate(['/animal', animal.id]);
  }

  initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      searchName: [''],
      animalType: [''],
      gender: [''],
      minAge: [null],
      maxAge: [null],
      fur: [''],
      breed: [''],
      color: [''],
      castratedOnly: [false]
    });

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
   
    this.filteredAnimals = this.animals.filter(animal => {
      if (filters.searchName && !animal.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }

      if (filters.animalType && animal.animalType !== filters.animalType) {
        return false;
      }

      if (filters.gender && animal.gender !== filters.gender) {
        return false;
      }

      if (filters.minAge !== null && animal.age < filters.minAge) {
        return false;
      }
      if (filters.maxAge !== null && animal.age > filters.maxAge) {
        return false;
      }

      if (filters.fur && animal.fur !== filters.fur) {
        return false;
      }

      if (filters.breed && !animal.breed?.toLowerCase().includes(filters.breed.toLowerCase())) {
        return false;
      }

      if (filters.color && !animal.color?.toLowerCase().includes(filters.color.toLowerCase())) {
        return false;
      }

      if (filters.castratedOnly && !animal.castrated) {
        return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedAnimals();
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchName: '',
      animalType: '',
      gender: '',
      minAge: null,
      maxAge: null,
      fur: '',
      breed: '',
      color: '',
      castratedOnly: false
    });
   
    this.filteredAnimals = [...this.animals];
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedAnimals();
  }

  hasActiveFilters(): boolean {
    const filters = this.filterForm.value;
    return Object.keys(filters).some(key => {
      const value = filters[key];
      return value !== '' && value !== null && value !== false;
    });
  }
}