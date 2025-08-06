import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyAnimalsService } from '../my-animals/my-animals.service';
import { AuthService } from '../authentication/auth.service';


@Component({
  selector: 'app-animal-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-animal-container">
      <header class="create-header">
        <button (click)="goBack()" class="back-btn">
          ← Back to My Animals
        </button>
        <h1>🐾 Add New Animal</h1>
        <p>Fill in the details for the new animal</p>
      </header>


      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <h3>⚠️ Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button (click)="error = null" class="retry-btn">Dismiss</button>
      </div>


      <!-- Create Form -->
      <div *ngIf="!error" class="form-container">
        <form [formGroup]="createForm" (ngSubmit)="onSubmit()" class="create-form">
         
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
                  [class.error]="createForm.get('name')?.invalid && createForm.get('name')?.touched">
                <div *ngIf="createForm.get('name')?.invalid && createForm.get('name')?.touched" class="error-message">
                  Name is required
                </div>
              </div>


              <div class="form-group">
                <label for="animalType">Animal Type *</label>
                <select
                  id="animalType"
                  formControlName="animalType"
                  [class.error]="createForm.get('animalType')?.invalid && createForm.get('animalType')?.touched">
                  <option value="">Select animal type</option>
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="RABBIT">Rabbit</option>
                  <option value="OTHER">Other</option>
                </select>
                <div *ngIf="createForm.get('animalType')?.invalid && createForm.get('animalType')?.touched" class="error-message">
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
                  [class.error]="createForm.get('age')?.invalid && createForm.get('age')?.touched">
                <div *ngIf="createForm.get('age')?.invalid && createForm.get('age')?.touched" class="error-message">
                  Age is required and must be 0 or greater
                </div>
              </div>


              <div class="form-group">
                <label for="gender">Gender *</label>
                <select
                  id="gender"
                  formControlName="gender"
                  [class.error]="createForm.get('gender')?.invalid && createForm.get('gender')?.touched">
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <div *ngIf="createForm.get('gender')?.invalid && createForm.get('gender')?.touched" class="error-message">
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
              <div class="form-group">
                <label for="photo">Upload Photo</label>
                <input
                  type="file"
                  id="photo"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  class="file-input">
                <small class="help-text">Upload a photo of the animal (JPG, PNG, GIF)</small>
              </div>


              <div *ngIf="photoPreview" class="photo-preview-container">
                <h4>Photo Preview:</h4>
                <img [src]="photoPreview" alt="Photo preview" class="photo-preview">
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
              [disabled]="createForm.invalid || saving">
              <span *ngIf="saving">Creating...</span>
              <span *ngIf="!saving">🐾 Create Animal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-animal-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }


    .create-header {
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


    .create-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }


    .create-header p {
      color: #666;
      font-size: 1.1rem;
    }


    .error-container {
      text-align: center;
      padding: 2rem;
      margin-bottom: 2rem;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      color: #856404;
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


    .create-form {
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
      border-bottom: 2px solid #28a745;
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
      border-color: #28a745;
      box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
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


    .photo-preview-container {
      text-align: center;
    }


    .photo-preview-container h4 {
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
      .create-animal-container {
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
export class AnimalCreateComponent implements OnInit {
  createForm!: FormGroup;
  saving = false;
  error: string | null = null;
  photoPreview: string | null = null;
  selectedFile: File | null = null;


  constructor(
    private fb: FormBuilder,
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
      this.error = 'You must be logged in as an ONG to create animals.';
      return;
    }
  }


  private initializeForm(): void {
    this.createForm = this.fb.group({
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


  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
   
    if (file) {
      this.selectedFile = file;
     
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  onSubmit(): void {
    if (this.createForm.invalid) return;


    this.saving = true;
    const formData = this.createForm.value;


    // Ensure size is a number or null
    if (formData.size === '' || formData.size === null || formData.size === undefined) {
      formData.size = null;
    } else {
      formData.size = Number(formData.size);
    }


    console.log('📋 Creating new animal with data:', {
      ...formData,
      photo: formData.photo ? '[photo data]' : 'no photo'
    });


    // If a photo was selected, convert it to base64
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64Only = base64.includes(',') ? base64.split(',')[1] : base64;
        formData.photo = base64Only;
        this.createAnimal(formData);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.createAnimal(formData);
    }
  }


  private createAnimal(animalData: any): void {
    console.log('🔍 Sending new animal data:', {
      ...animalData,
      photo: animalData.photo ? `[base64 data ${animalData.photo.length} chars]` : 'no photo'
    });
   
    this.myAnimalsService.createMyAnimal(animalData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdAnimal: any) => {
          console.log('✅ Animal created successfully:', createdAnimal);
          this.saving = false;
          this.router.navigate(['/my-animals']);
        },
        error: (error: any) => {
          console.error('❌ Error creating animal:', error);
          this.error = error.message || 'Failed to create animal.';
          this.saving = false;
        }
      });
  }


  goBack(): void {
    this.router.navigate(['/my-animals']);
  }
}