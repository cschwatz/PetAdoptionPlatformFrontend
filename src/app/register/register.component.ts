import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface RegisterRequest {
  cpf: string;
  name: string;
  login: string;
  password: string;
  email: string;
  phone: string;
  address: {
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: number;
    cep: string;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-form">
        <h2>Create Account</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <!-- Personal Information Section -->
          <div class="section-title">Personal Information</div>
          
          <div class="form-row">
            <div class="form-group half-width">
              <label for="name">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name"
                [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
              >
              <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" 
                   class="error-message">
                Name is required
              </div>
            </div>

            <div class="form-group half-width">
              <label for="cpf">CPF *</label>
              <input 
                type="text" 
                id="cpf" 
                formControlName="cpf"
                placeholder="000.000.000-00"
                [class.error]="registerForm.get('cpf')?.invalid && registerForm.get('cpf')?.touched"
              >
              <div *ngIf="registerForm.get('cpf')?.invalid && registerForm.get('cpf')?.touched" 
                   class="error-message">
                CPF is required
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email"
                [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              >
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                   class="error-message">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>

            <div class="form-group half-width">
              <label for="phone">Phone *</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone"
                placeholder="(00) 00000-0000"
                [class.error]="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched"
              >
              <div *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched" 
                   class="error-message">
                Phone is required
              </div>
            </div>
          </div>

          <!-- Account Information Section -->
          <div class="section-title">Account Information</div>
          
          <div class="form-row">
            <div class="form-group half-width">
              <label for="login">Username *</label>
              <input 
                type="text" 
                id="login" 
                formControlName="login"
                [class.error]="registerForm.get('login')?.invalid && registerForm.get('login')?.touched"
              >
              <div *ngIf="registerForm.get('login')?.invalid && registerForm.get('login')?.touched" 
                   class="error-message">
                Username is required
              </div>
            </div>

            <div class="form-group half-width">
              <label for="password">Password *</label>
              <input 
                type="password" 
                id="password" 
                formControlName="password"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              >
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                   class="error-message">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
              </div>
            </div>
          </div>

          <!-- Address Information Section -->
          <div class="section-title">Address Information</div>
          
          <div formGroupName="address">
            <div class="form-row">
              <div class="form-group half-width">
                <label for="cep">CEP *</label>
                <input 
                  type="text" 
                  id="cep" 
                  formControlName="cep"
                  placeholder="00000-000"
                  [class.error]="registerForm.get('address.cep')?.invalid && registerForm.get('address.cep')?.touched"
                >
                <div *ngIf="registerForm.get('address.cep')?.invalid && registerForm.get('address.cep')?.touched" 
                     class="error-message">
                  CEP is required
                </div>
              </div>

              <div class="form-group half-width">
                <label for="state">State *</label>
                <input 
                  type="text" 
                  id="state" 
                  formControlName="state"
                  [class.error]="registerForm.get('address.state')?.invalid && registerForm.get('address.state')?.touched"
                >
                <div *ngIf="registerForm.get('address.state')?.invalid && registerForm.get('address.state')?.touched" 
                     class="error-message">
                  State is required
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label for="city">City *</label>
                <input 
                  type="text" 
                  id="city" 
                  formControlName="city"
                  [class.error]="registerForm.get('address.city')?.invalid && registerForm.get('address.city')?.touched"
                >
                <div *ngIf="registerForm.get('address.city')?.invalid && registerForm.get('address.city')?.touched" 
                     class="error-message">
                  City is required
                </div>
              </div>

              <div class="form-group half-width">
                <label for="neighborhood">Neighborhood *</label>
                <input 
                  type="text" 
                  id="neighborhood" 
                  formControlName="neighborhood"
                  [class.error]="registerForm.get('address.neighborhood')?.invalid && registerForm.get('address.neighborhood')?.touched"
                >
                <div *ngIf="registerForm.get('address.neighborhood')?.invalid && registerForm.get('address.neighborhood')?.touched" 
                     class="error-message">
                  Neighborhood is required
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group three-quarters">
                <label for="street">Street *</label>
                <input 
                  type="text" 
                  id="street" 
                  formControlName="street"
                  [class.error]="registerForm.get('address.street')?.invalid && registerForm.get('address.street')?.touched"
                >
                <div *ngIf="registerForm.get('address.street')?.invalid && registerForm.get('address.street')?.touched" 
                     class="error-message">
                  Street is required
                </div>
              </div>

              <div class="form-group quarter">
                <label for="number">Number *</label>
                <input 
                  type="number" 
                  id="number" 
                  formControlName="number"
                  [class.error]="registerForm.get('address.number')?.invalid && registerForm.get('address.number')?.touched"
                >
                <div *ngIf="registerForm.get('address.number')?.invalid && registerForm.get('address.number')?.touched" 
                     class="error-message">
                  Number is required
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="button-group">
            <button type="submit" [disabled]="registerForm.invalid || isLoading" class="register-btn">
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
            
            <button type="button" (click)="goBackToLogin()" class="back-btn">
              Back to Login
            </button>
          </div>
        </form>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 2rem 1rem;
    }

    .register-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 800px;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #007bff;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      flex: 1;
    }

    .form-group.half-width {
      flex: 1;
    }

    .form-group.three-quarters {
      flex: 3;
    }

    .form-group.quarter {
      flex: 1;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    input.error {
      border-color: #dc3545;
    }

    .button-group {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }

    .register-btn {
      flex: 1;
      padding: 0.75rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .register-btn:hover:not(:disabled) {
      background-color: #218838;
    }

    .register-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .back-btn {
      flex: 1;
      padding: 0.75rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .success-message {
      color: #28a745;
      font-size: 0.875rem;
      margin-top: 1rem;
      text-align: center;
      padding: 0.75rem;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      
      .button-group {
        flex-direction: column;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private apiUrl = 'http://localhost:8080'; // Adjust to match your backend

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      cpf: ['', Validators.required],
      name: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: this.fb.group({
        state: ['', Validators.required],
        city: ['', Validators.required],
        neighborhood: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', [Validators.required, Validators.min(1)]],
        cep: ['', Validators.required]
      })
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerData: RegisterRequest = this.registerForm.value;

      // Make HTTP POST request to your backend register endpoint
      this.http.post(`${this.apiUrl}/api/register/person`, registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Redirecting to login...';
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.registerForm);
    }
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}