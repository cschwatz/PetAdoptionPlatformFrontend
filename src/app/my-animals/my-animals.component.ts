import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyAnimalsService } from './my-animals.service';
import { Animal } from '../animal/animal.model';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-my-animals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-animals-container">
      <header class="my-animals-header">
        <h1>🐾 Meus Animais</h1>
        <p>Gerencie seus animais que procuram por lares amorosos</p>
        <button class="add-animal-btn" (click)="addNewAnimal()">
          ➕ Adicionar Novo Animal
        </button>
      </header>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando seus animais...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Opa! Alguém achou que o servidor era um brinquedo</h3>
        <p>{{ error }}</p>
        <button (click)="loadMyAnimals()" class="retry-btn">Tentar Novamente</button>
      </div>

      <div *ngIf="!loading && !error" class="animals-section">
        <div class="controls">
          <div class="animals-count">
            <span>{{ totalAnimals }} animais sob seus cuidados</span>
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

        <div class="animals-grid" *ngIf="paginatedAnimals.length > 0">
          <div class="animal-card" *ngFor="let animal of paginatedAnimals; trackBy: trackByAnimalId">
           
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
                  <span class="label">Gênero:</span>
                  <span class="value">{{ animal.gender === 'M' ? 'Macho' : 'Fêmea' }}</span>
                </div>
                <div class="detail-row" *ngIf="animal.weight">
                  <span class="label">Peso:</span>
                  <span class="value">{{ animal.weight }} kg</span>
                </div>
              </div>

              <p class="animal-description">{{ getShortDescription(animal.obs) }}</p>

              <div class="card-footer">
                <button class="edit-btn" (click)="editAnimal(animal, $event)">
                  ✏️ Editar
                </button>
                <button class="view-btn" (click)="viewAnimalDetails(animal, $event)">
                  Ver Detalhes
                </button>
                <button class="delete-btn" (click)="deleteAnimal(animal, $event)">
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="paginatedAnimals.length === 0 && !loading" class="empty-state">
          <h3>🐾 Nenhum animal ainda</h3>
          <p>Comece adicionando seu primeiro animal para ajudá-los a encontrar lares amorosos!</p>
          <button class="add-first-animal-btn" (click)="addNewAnimal()">
            ➕ Adicionar Seu Primeiro Animal
          </button>
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
    .my-animals-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .my-animals-header {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
    }

    .my-animals-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .my-animals-header p {
      color: #666;
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .add-animal-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .add-animal-btn:hover {
      background: linear-gradient(135deg, #218838 0%, #1dd1a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
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
      position: relative;
    }

    .animal-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      gap: 0.5rem;
    }

    .edit-btn {
      background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
      color: #333;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.3s;
      flex: 1;
    }

    .edit-btn:hover {
      background: linear-gradient(135deg, #ffb300 0%, #ff8f00 100%);
      transform: translateY(-2px);
    }

    .view-btn {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.3s;
      flex: 1;
    }

    .view-btn:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
    }

    .delete-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.3s;
      flex: 1;
    }

    .delete-btn:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 0;
      color: #666;
    }

    .add-first-animal-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      margin-top: 1rem;
      transition: all 0.3s;
    }

    .add-first-animal-btn:hover {
      background: linear-gradient(135deg, #218838 0%, #1dd1a1 100%);
      transform: translateY(-2px);
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
      .my-animals-container {
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

      .card-footer {
        flex-direction: column;
        gap: 0.5rem;
      }

      .edit-btn, .view-btn, .delete-btn {
        flex: none;
        width: 100%;
      }
    }
  `]
})
export class MyAnimalsComponent implements OnInit {
  animals: Animal[] = [];
  paginatedAnimals: Animal[] = [];
  loading = false;
  error: string | null = null;
 
  currentPage = 1;
  pageSize = 8;
  totalAnimals = 0;
  totalPages = 0;
 
  pageNumbers: number[] = [];

  constructor(
    private myAnimalsService: MyAnimalsService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyAnimals();
  }

  loadMyAnimals(): void {
    if (this.loading) {
      return;
    }

    if (!this.authService.isOng()) {
      this.error = 'Você deve estar logado como uma ONG para visualizar esta página.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.myAnimalsService.getMyAnimals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (animals) => {
          this.animals = animals as Animal[];
          this.totalAnimals = (animals as Animal[]).length;
          this.calculatePagination();
          this.updatePaginatedAnimals();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = error.message || 'Falha ao carregar seus animais. Tente novamente mais tarde.';
          this.loading = false;
          this.cdr.detectChanges();
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

  trackByAnimalId(index: number, animal: Animal): any {
    return animal.id || index;
  }

  getShortDescription(obs: string | undefined): string {
    if (!obs) return '';
    return obs.length > 100 ? obs.slice(0, 100) + '...' : obs;
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


  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/default-animal.jpeg';
   
    target.onerror = null;
  }

  addNewAnimal(): void {
    this.router.navigate(['/animals/new']);
  }

  editAnimal(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/animal/edit', animal.id]);
  }

  viewAnimalDetails(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/animal', animal.id]);
  }

  deleteAnimal(animal: Animal, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
   
    const confirmed = confirm(`Tem certeza de que deseja excluir ${animal.name}? Esta ação não pode ser desfeita.`);
    if (confirmed) {
      this.myAnimalsService.deleteMyAnimal(animal.id!.toString())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadMyAnimals();
          },
          error: (error) => {
            alert('Falha ao excluir animal. Tente novamente.');
          }
        });
    }
  }
}