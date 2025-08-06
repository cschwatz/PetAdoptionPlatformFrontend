import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyAnimalsService } from '../my-animals/my-animals.service';
import { Animal } from '../animal/animal.model';
import { AuthService } from '../authentication/auth.service';


@Component({
  selector: 'app-animal-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="edit-animal-container">
      <header class="edit-header">
        <button (click)="goBack()" class="back-btn">
          ← Back to My Animals
        </button>
        <h1>✏️ Edit Animal</h1>
        <p *ngIf="animal">Editing details for {{ animal.name }}</p>
      </header>


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


      <!-- Edit Form -->
      <div *ngIf="!loading && !error && editForm" class="form-container">
        <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="edit-form">
         
          <!-- Basic Information -->
          <div class="form-section">
            <h3>Basic Information</h3>
           
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  placeholder="Animal's name"
                  [class.error]="editForm.get('name')?.invalid && editForm.get('name')?.touched">
                <div *ngIf="editForm.get('name')?.invalid && editForm.get('name')?.touched" class="error-message">
                  Name is required
                </div>
              </div>


              <div class="form-group">
                <label for="animalType">Animal Type *</label>
                <select
                  id="animalType"
                  formControlName="animalType"
                  [class.error]="editForm.get('animalType')?.invalid && editForm.get('animalType')?.touched">
                  <option value="">Select animal type</option>
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="RABBIT">Rabbit</option>
                  <option value="OTHER">Other</option>
                </select>
                <div *ngIf="editForm.get('animalType')?.invalid && editForm.get('animalType')?.touched" class="error-message">
                  Animal type is required
                </div>
              </div>
            </div>


            <div class="form-row">
              <div class="form-group">
                <label for="breed">Breed</label>
                <input
                  type="text"
                  id="breed"
                  formControlName="breed"
                  placeholder="Animal's breed">
              </div>


              <div class="form-group">
                <label for="color">Color</label>
                <input
                  type="text"
                  id="color"
                  formControlName="color"
                  placeholder="Animal's color">
              </div>
            </div>


            <div class="form-row">
              <div class="form-group">
                <label for="age">Age *</label>
                <input
                  type="number"
                  id="age"
                  formControlName="age"
                  placeholder="Age in years"
                  min="0"
                  [class.error]="editForm.get('age')?.invalid && editForm.get('age')?.touched">
                <div *ngIf="editForm.get('age')?.invalid && editForm.get('age')?.touched" class="error-message">
                  Age is required and must be 0 or greater
                </div>
              </div>


              <div class="form-group">
                <label for="gender">Gender *</label>
                <select
                  id="gender"
                  formControlName="gender"
                  [class.error]="editForm.get('gender')?.invalid && editForm.get('gender')?.touched">
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <div *ngIf="editForm.get('gender')?.invalid && editForm.get('gender')?.touched" class="error-message">
                  Gender is required
                </div>
              </div>
            </div>


            <div class="form-row">
              <div class="form-group">
                <label for="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  formControlName="weight"
                  placeholder="Weight in kilograms"
                  min="0"
                  step="0.1">
              </div>


              <div class="form-group">
                <label for="size">Size (cm)</label>
                <input
                  type="number"
                  id="size"
                  formControlName="size"
                  placeholder="Height in centimeters"
                  min="0"
                  step="1">
              </div>
            </div>


            <div class="form-row">
              <div class="form-group">
                <label for="fur">Fur Type</label>
                <select id="fur" formControlName="fur">
                  <option value="">Select fur type</option>
                  <option value="SHORT">Short</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LONG">Long</option>
                  <option value="NONE">None</option>
                </select>
              </div>


              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    formControlName="castrated">
                  <span class="checkmark"></span>
                  Castrated/Spayed
                </label>
              </div>
            </div>
          </div>


          <!-- Status Section -->
          <div class="form-section">
            <h3>Status</h3>
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  formControlName="adopted">
                <span class="checkmark"></span>
                Adopted
              </label>
            </div>
          </div>


          <!-- Description -->
          <div class="form-section">
            <h3>Description</h3>
            <div class="form-group">
              <label for="obs">Additional Notes</label>
              <textarea
                id="obs"
                formControlName="obs"
                placeholder="Add any additional information about the animal..."
                rows="4"></textarea>
            </div>
          </div>


          <!-- Photo Section -->
          <div class="form-section">
            <h3>Photo</h3>
            <div class="photo-section">
              <div *ngIf="currentPhotoUrl" class="current-photo">
                <h4>Current Photo:</h4>
                <img [src]="currentPhotoUrl" alt="Current animal photo" class="photo-preview">
              </div>
             
              <div class="form-group">
                <label for="photo">Update Photo</label>
                <input
                  type="file"
                  id="photo"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  class="file-input">
                <small class="help-text">Upload a new photo to replace the current one (JPG, PNG, GIF)</small>
              </div>


              <div *ngIf="newPhotoPreview" class="new-photo-preview">
                <h4>New Photo Preview:</h4>
                <img [src]="newPhotoPreview" alt="New photo preview" class="photo-preview">
              </div>
            </div>
          </div>


          <!-- Action Buttons -->
          <div class="form-actions">
            <button
              type="button"
              (click)="goBack()"
              class="cancel-btn"
              [disabled]="saving">
              Cancel
            </button>
            <button
              type="submit"
              class="save-btn"
              [disabled]="editForm.invalid || saving">
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">💾 Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .edit-animal-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }


    .edit-header {
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
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s;
    }


    .back-btn:hover {
      background: #5a6268;
    }


    .edit-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }


    .edit-header p {
      color: #666;
      font-size: 1.1rem;
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


    .form-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }


    .edit-form {
      padding: 2rem;
    }


    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }


    .form-section:last-child {
      border-bottom: none;
    }


    .form-section h3 {
      color: #333;
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #007bff;
    }


    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }


    .form-group {
      display: flex;
      flex-direction: column;
    }


    .form-group label {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }


    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
    }


    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }


    .form-group input.error,
    .form-group select.error {
      border-color: #dc3545;
    }


    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }


    .checkbox-group {
      flex-direction: row !important;
      align-items: center;
    }


    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 600;
      color: #333;
    }


    .checkbox-label input[type="checkbox"] {
      margin-right: 0.5rem;
      transform: scale(1.2);
    }


    .photo-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }


    .current-photo,
    .new-photo-preview {
      text-align: center;
    }


    .current-photo h4,
    .new-photo-preview h4 {
      color: #333;
      margin-bottom: 1rem;
    }


    .photo-preview {
      max-width: 300px;
      max-height: 200px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }


    .file-input {
      padding: 0.5rem !important;
    }


    .help-text {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }


    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }


    .cancel-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }


    .cancel-btn:hover:not(:disabled) {
      background: #5a6268;
    }


    .save-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }


    .save-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #218838 0%, #1dd1a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
    }


    .save-btn:disabled,
    .cancel-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }


    @media (max-width: 768px) {
      .edit-animal-container {
        padding: 1rem;
      }


      .back-btn {
        position: static;
        margin-bottom: 1rem;
      }


      .form-row {
        grid-template-columns: 1fr;
      }


      .form-actions {
        flex-direction: column;
      }


      .cancel-btn,
      .save-btn {
        width: 100%;
      }
    }
  `]
})
export class AnimalEditComponent implements OnInit {
  editForm!: FormGroup;
  animal: Animal | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  animalId: string | null = null;
  currentPhotoUrl: string | null = null;
  newPhotoPreview: string | null = null;
  selectedFile: File | null = null;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private myAnimalsService: MyAnimalsService,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {
    this.initializeForm();
  }


  ngOnInit(): void {
    // Check if user is an ONG
    if (!this.authService.isOng()) {
      this.error = 'You must be logged in as an ONG to edit animals.';
      return;
    }


    this.animalId = this.route.snapshot.paramMap.get('id');
    if (this.animalId) {
      this.loadAnimal();
    } else {
      this.error = 'No animal ID provided.';
    }
  }


  private initializeForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      animalType: ['', [Validators.required]],
      breed: [''],
      color: [''],
      age: [0, [Validators.required, Validators.min(0)]],
      gender: ['', [Validators.required]],
      weight: [0, [Validators.min(0)]],
      size: [0, [Validators.min(0)]],
      fur: [''],
      castrated: [false],
      adopted: [false],
      obs: ['']
    });
  }


  loadAnimal(): void {
    if (!this.animalId) return;


    this.loading = true;
    this.error = null;


    this.myAnimalsService.getMyAnimalById(this.animalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (animal: any) => {
          console.log('✅ Animal loaded for editing:', animal);
          this.animal = animal;
          this.populateForm(animal);
          this.currentPhotoUrl = this.getImageSrc(animal.photo);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('❌ Error loading animal:', error);
          this.error = error.message || 'Failed to load animal details.';
          this.loading = false;
        }
      });
  }


  private populateForm(animal: Animal): void {
    this.editForm.patchValue({
      name: animal.name || '',
      animalType: animal.animalType || '',
      breed: animal.breed || '',
      color: animal.color || '',
      age: animal.age || 0,
      gender: animal.gender || '',
      weight: animal.weight || 0,
      size: animal.size || 0,
      fur: animal.fur || '',
      castrated: animal.castrated || false,
      adopted: animal.adopted || false,
      obs: animal.obs || ''
    });
  }


  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
   
    if (file) {
      this.selectedFile = file;
     
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newPhotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  onSubmit(): void {
    if (this.editForm.invalid || !this.animalId) return;


    this.saving = true;
    const formData = this.editForm.value;


    // Ensure size is a number or null
    if (formData.size === '' || formData.size === null || formData.size === undefined) {
      formData.size = null;
    } else {
      formData.size = Number(formData.size);
    }


    console.log('📋 Form data before sending:', {
      ...formData,
      photo: formData.photo ? '[photo data]' : 'no photo'
    });


    // If a new photo was selected, convert it to base64
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64Only = base64.includes(',') ? base64.split(',')[1] : base64;
        formData.photo = base64Only;
        this.saveAnimal(formData);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      // Keep existing photo - ensure it's only base64 without prefix
      if (this.animal?.photo) {
        let photoData = this.animal.photo;
        // If the existing photo has data URL prefix, remove it
        if (photoData.startsWith('data:')) {
          photoData = photoData.split(',')[1] || photoData;
        }
        formData.photo = photoData;
      }
      this.saveAnimal(formData);
    }
  }


  private saveAnimal(animalData: any): void {
    console.log('🔍 Sending animal data:', {
      ...animalData,
      photo: animalData.photo ? `[base64 data ${animalData.photo.length} chars]` : 'no photo'
    });
   
    this.myAnimalsService.updateMyAnimal(this.animalId!, animalData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedAnimal: any) => {
          console.log('✅ Animal updated successfully:', updatedAnimal);
          this.saving = false;
          this.router.navigate(['/my-animals']);
        },
        error: (error: any) => {
          console.error('❌ Error updating animal:', error);
          this.error = error.message || 'Failed to update animal.';
          this.saving = false;
        }
      });
  }


  getImageSrc(photo: string | undefined): string {
    if (!photo) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
   
    // If it's already a complete data URL, return as-is
    if (photo.startsWith('data:')) {
      return photo;
    }
   
    // If it's already a complete HTTP URL, return as-is
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
   
    // If it looks like base64, add data URL prefix
    if (photo.match(/^[A-Za-z0-9+/]/)) {
      return `data:image/jpeg;base64,${photo}`;
    }
   
    // Default fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }


  goBack(): void {
    this.router.navigate(['/my-animals']);
  }
}