import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface PersonRegisterRequest {
  cpf: string;
  firstName: string;
  middleName?: string;
  familyName: string;
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


export interface OngRegisterRequest {
  cnpj: string;
  name: string;
  login: string;
  password: string;
  email: string;
  phone: string;
  pix?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  address: {
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: number;
    cep: string;
  };
}


export type UserType = 'PERSON' | 'ONG';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="register-container">
      <div class="register-form">
        <h2>Criar conta</h2>
       
        <!-- User Type Selection -->
        <div class="user-type-selection">
          <h3>Tipo de conta</h3>
          <div class="type-options">
            <label class="type-option" [class.selected]="userType === 'PERSON'">
              <input
                type="radio"
                value="PERSON"
                [(ngModel)]="userType"
                (change)="onUserTypeChange()"
                name="userType"
              >
              <span class="option-content">
                <strong>👤 Indivíduo</strong>
                <small>Conta pessoal para adotar animais</small>
              </span>
            </label>
           
            <label class="type-option" [class.selected]="userType === 'ONG'">
              <input
                type="radio"
                value="ONG"
                [(ngModel)]="userType"
                (change)="onUserTypeChange()"
                name="userType"
              >
              <span class="option-content">
                <strong>🏢 Organização</strong>
                <small>Conta de ONG para administrar animais para adoção</small>
              </span>
            </label>
          </div>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
         
          <div class="section-title">
            {{ userType === 'PERSON' ? 'Personal Information' : 'Organization Information' }}
          </div>
         
          <!-- Person Fields -->
          <div *ngIf="userType === 'PERSON'">
            <div class="form-row">
              <div class="form-group half-width">
                <label for="firstName">Primeiro Nome *</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                >
                <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                     class="error-message">
                  Primeiro Nome é obrigatório
                </div>
              </div>


              <div class="form-group half-width">
                <label for="middleName">Nome do Meio</label>
                <input
                  type="text"
                  id="middleName"
                  formControlName="middleName"
                >
              </div>
            </div>


            <div class="form-row">
              <div class="form-group half-width">
                <label for="familyName">Sobrenome *</label>
                <input
                  type="text"
                  id="familyName"
                  formControlName="familyName"
                  [class.error]="registerForm.get('familyName')?.invalid && registerForm.get('familyName')?.touched"
                >
                <div *ngIf="registerForm.get('familyName')?.invalid && registerForm.get('familyName')?.touched"
                     class="error-message">
                  Sobrenome é obrigatório
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
                  CPF é obrigatório
                </div>
              </div>
            </div>
          </div>


          <!-- ONG Fields -->
          <div *ngIf="userType === 'ONG'">
            <div class="form-row">
              <div class="form-group half-width">
                <label for="name">Nome da ONG *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                >
                <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                     class="error-message">
                  Nome da ONG é obrigatório
                </div>
              </div>


              <div class="form-group half-width">
                <label for="cnpj">CNPJ *</label>
                <input
                  type="text"
                  id="cnpj"
                  formControlName="cnpj"
                  placeholder="00.000.000/0000-00"
                  [class.error]="registerForm.get('cnpj')?.invalid && registerForm.get('cnpj')?.touched"
                >
                <div *ngIf="registerForm.get('cnpj')?.invalid && registerForm.get('cnpj')?.touched"
                     class="error-message">
                  CNPJ é obrigatório
                </div>
              </div>
            </div>
          </div>


          <!-- Contact Information (Common) -->
          <div class="section-title">Informações de Contato</div>
         
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
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email é obrigatório</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Por favor insira um Email válido</span>
              </div>
            </div>


            <div class="form-group half-width">
              <label for="phone">Telefone *</label>
              <input
                type="tel"
                id="phone"
                formControlName="phone"
                placeholder="(00) 00000-0000"
                [class.error]="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched"
              >
              <div *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched"
                   class="error-message">
                Telefone é obrigatório
              </div>
            </div>
          </div>


          <!-- PIX and Social Media Information (ONG Only) -->
          <div *ngIf="userType === 'ONG'" class="section-title">Social Media & Donations</div>
          <div *ngIf="userType === 'ONG'">
            <div class="form-row">
              <div class="form-group half-width">
                <label for="pix">Chave PIX</label>
                <input
                  type="text"
                  id="pix"
                  formControlName="pix"
                  placeholder="Enter your PIX key for donations"
                  [class.error]="registerForm.get('pix')?.invalid && registerForm.get('pix')?.touched"
                >
                <small class="help-text">Opcional: Adicione uma chave PIX para recebimento de doações</small>
              </div>


              <div class="form-group half-width">
                <label for="instagram">Instagram</label>
                <input
                  type="url"
                  id="instagram"
                  formControlName="instagram"
                  placeholder="https://instagram.com/yourorganization"
                  [class.error]="registerForm.get('instagram')?.invalid && registerForm.get('instagram')?.touched"
                >
                <small class="help-text">Opcional: Link para o perfil do Instagram</small>
              </div>
            </div>


            <div class="form-row">
              <div class="form-group half-width">
                <label for="facebook">Facebook</label>
                <input
                  type="url"
                  id="facebook"
                  formControlName="facebook"
                  placeholder="https://facebook.com/yourorganization"
                  [class.error]="registerForm.get('facebook')?.invalid && registerForm.get('facebook')?.touched"
                >
                <small class="help-text">Opcional: Link para página do Facebook</small>
              </div>


              <div class="form-group half-width">
                <label for="tiktok">TikTok</label>
                <input
                  type="url"
                  id="tiktok"
                  formControlName="tiktok"
                  placeholder="https://tiktok.com/@yourorganization"
                  [class.error]="registerForm.get('tiktok')?.invalid && registerForm.get('tiktok')?.touched"
                >
                <small class="help-text">Opcional: Link para o perfil no TikTok</small>
              </div>
            </div>
          </div>


          <!-- Account Information Section -->
          <div class="section-title">Informações da Conta</div>
         
          <div class="form-row">
            <div class="form-group half-width">
              <label for="login">Nome de usuário *</label>
              <input
                type="text"
                id="login"
                formControlName="login"
                [class.error]="registerForm.get('login')?.invalid && registerForm.get('login')?.touched"
              >
              <div *ngIf="registerForm.get('login')?.invalid && registerForm.get('login')?.touched"
                   class="error-message">
                Nome de usuário é obrigatório
              </div>
            </div>


            <div class="form-group half-width">
              <label for="password">Senha *</label>
              <input
                type="password"
                id="password"
                formControlName="password"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              >
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                   class="error-message">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Senha é obrigatória</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">A Senha deve ter ao menos 6 caracteres</span>
              </div>
            </div>
          </div>


          <!-- Address Information Section -->
          <div class="section-title">Informações de Endereço</div>
         
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
                  CEP é obrigatório
                </div>
              </div>


              <div class="form-group half-width">
                <label for="state">Estado (UF) *</label>
                <input
                  type="text"
                  id="state"
                  formControlName="state"
                  [class.error]="registerForm.get('address.state')?.invalid && registerForm.get('address.state')?.touched"
                >
                <div *ngIf="registerForm.get('address.state')?.invalid && registerForm.get('address.state')?.touched"
                     class="error-message">
                  Estado é obrigatório
                </div>
              </div>
            </div>


            <div class="form-row">
              <div class="form-group half-width">
                <label for="city">Cidade *</label>
                <input
                  type="text"
                  id="city"
                  formControlName="city"
                  [class.error]="registerForm.get('address.city')?.invalid && registerForm.get('address.city')?.touched"
                >
                <div *ngIf="registerForm.get('address.city')?.invalid && registerForm.get('address.city')?.touched"
                     class="error-message">
                  Cidade é obrigatório
                </div>
              </div>


              <div class="form-group half-width">
                <label for="neighborhood">Bairro *</label>
                <input
                  type="text"
                  id="neighborhood"
                  formControlName="neighborhood"
                  [class.error]="registerForm.get('address.neighborhood')?.invalid && registerForm.get('address.neighborhood')?.touched"
                >
                <div *ngIf="registerForm.get('address.neighborhood')?.invalid && registerForm.get('address.neighborhood')?.touched"
                     class="error-message">
                  Bairro é obrigatório
                </div>
              </div>
            </div>


            <div class="form-row">
              <div class="form-group three-quarters">
                <label for="street">Rua *</label>
                <input
                  type="text"
                  id="street"
                  formControlName="street"
                  [class.error]="registerForm.get('address.street')?.invalid && registerForm.get('address.street')?.touched"
                >
                <div *ngIf="registerForm.get('address.street')?.invalid && registerForm.get('address.street')?.touched"
                     class="error-message">
                    Rua é obrigatório
                </div>
              </div>


              <div class="form-group quarter">
                <label for="number">Número *</label>
                <input
                  type="number"
                  id="number"
                  formControlName="number"
                  [class.error]="registerForm.get('address.number')?.invalid && registerForm.get('address.number')?.touched"
                >
                <div *ngIf="registerForm.get('address.number')?.invalid && registerForm.get('address.number')?.touched"
                     class="error-message">
                  Número é obrigatório
                </div>
              </div>
            </div>
          </div>


          <!-- Buttons -->
          <div class="button-group">
            <button type="submit" [disabled]="registerForm.invalid || isLoading" class="register-btn">
              {{ isLoading ? 'Criando Conta...' : 'Criar Conta' }}
            </button>
           
            <button type="button" (click)="goBackToLogin()" class="back-btn">
              Retornar ao Login
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


    .user-type-selection {
      margin-bottom: 2rem;
    }


    .user-type-selection h3 {
      margin-bottom: 1rem;
      color: #333;
      font-size: 1.1rem;
    }


    .type-options {
      display: flex;
      gap: 1rem;
    }


    .type-option {
      flex: 1;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
    }


    .type-option:hover {
      border-color: #007bff;
      background-color: #f8f9fa;
    }


    .type-option.selected {
      border-color: #007bff;
      background-color: #e3f2fd;
    }


    .type-option input[type="radio"] {
      margin-right: 0.75rem;
      width: auto;
    }


    .option-content {
      display: flex;
      flex-direction: column;
    }


    .option-content strong {
      margin-bottom: 0.25rem;
      color: #333;
    }


    .option-content small {
      color: #666;
      font-size: 0.875rem;
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


      .type-options {
        flex-direction: column;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  userType: UserType = 'PERSON';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.createFormForType('PERSON');
  }

  private createFormForType(type: UserType): FormGroup {
    const baseForm = {
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
    };


    if (type === 'PERSON') {
      return this.fb.group({
        ...baseForm,
        firstName: ['', Validators.required],
        middleName: [''],
        familyName: ['', Validators.required],
        cpf: ['', Validators.required]
      });
    } else {
      return this.fb.group({
        ...baseForm,
        name: ['', Validators.required],
        cnpj: ['', Validators.required],
        pix: [''],
        instagram: [''],
        facebook: [''],
        tiktok: [''] 
      });
    }
  }


  onUserTypeChange(): void {
    this.registerForm = this.createFormForType(this.userType);
    this.errorMessage = '';
    this.successMessage = '';
  }


  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';


      let endpoint: string;
      let registerData: PersonRegisterRequest | OngRegisterRequest;


      if (this.userType === 'PERSON') {
        endpoint = `${this.apiUrl}/person`;
        registerData = {
          firstName: this.registerForm.value.firstName,
          middleName: this.registerForm.value.middleName || '',
          familyName: this.registerForm.value.familyName,
          cpf: this.registerForm.value.cpf,
          login: this.registerForm.value.login,
          password: this.registerForm.value.password,
          email: this.registerForm.value.email,
          phone: this.registerForm.value.phone,
          address: this.registerForm.value.address
        } as PersonRegisterRequest;
      } else {
        endpoint = `${this.apiUrl}/ong`;
        registerData = {
          name: this.registerForm.value.name,
          cnpj: this.registerForm.value.cnpj,
          login: this.registerForm.value.login,
          password: this.registerForm.value.password,
          email: this.registerForm.value.email,
          phone: this.registerForm.value.phone,
          pix: this.registerForm.value.pix || undefined,
          instagram: this.registerForm.value.instagram || undefined,
          facebook: this.registerForm.value.facebook || undefined,
          tiktok: this.registerForm.value.tiktok || undefined,
          address: this.registerForm.value.address
        } as OngRegisterRequest;
      }


      this.http.post(endpoint, registerData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = `${this.userType === 'PERSON' ? 'Pessoal' : 'Organização'} conta criada com sucesso! Redirecionando ao login...`;
         
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Falha ao registrar. Por favor tente novamente.';
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