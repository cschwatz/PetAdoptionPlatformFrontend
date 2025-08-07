import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService, UserInfo } from './account.service';
import { Person, PersonUpdateRequest } from '../person/person.model';
import { Ong, OngUpdateRequest } from '../ong/ong.model';
import { Address } from '../address/address.model';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="account-container">
      <div class="account-header">
        <h1>Minha Conta</h1>
        <p>Gerencie suas informações de conta e configurações</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando informações da conta...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Erro ao Carregar Conta</h3>
        <p>{{ error }}</p>
        <button (click)="loadUserData()" class="retry-btn">Tentar Novamente</button>
      </div>

      <div *ngIf="!loading && !error && userInfo" class="account-content">
        <div class="user-type-badge" [ngClass]="userInfo.userType.toLowerCase()">
          {{ isPerson() ? '👤 Conta Individual' : '🏢 Conta de Organização' }}
        </div>

        <div class="tab-nav">
          <button
            [class.active]="activeTab === 'profile'"
            (click)="activeTab = 'profile'">
            Informações do Perfil
          </button>
          <button
            [class.active]="activeTab === 'password'"
            (click)="activeTab = 'password'">
            Alterar Senha
          </button>
        </div>

        <div *ngIf="activeTab === 'profile'" class="tab-content">
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div *ngIf="isPerson()" class="form-section">
              <h3>Informações Pessoais</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Nome *</label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    [class.error]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                  >
                  <div *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                       class="error-message">
                    Nome é obrigatório
                  </div>
                </div>

                <div class="form-group">
                  <label for="middleName">Nome do Meio</label>
                  <input
                    type="text"
                    id="middleName"
                    formControlName="middleName"
                  >
                </div>

                <div class="form-group">
                  <label for="familyName">Sobrenome *</label>
                  <input
                    type="text"
                    id="familyName"
                    formControlName="familyName"
                    [class.error]="profileForm.get('familyName')?.invalid && profileForm.get('familyName')?.touched"
                  >
                  <div *ngIf="profileForm.get('familyName')?.invalid && profileForm.get('familyName')?.touched"
                       class="error-message">
                    Sobrenome é obrigatório
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="cpf">CPF *</label>
                  <input
                    type="text"
                    id="cpf"
                    formControlName="cpf"
                    placeholder="000.000.000-00"
                    [class.error]="profileForm.get('cpf')?.invalid && profileForm.get('cpf')?.touched"
                  >
                  <div *ngIf="profileForm.get('cpf')?.invalid && profileForm.get('cpf')?.touched"
                       class="error-message">
                    CPF é obrigatório
                  </div>
                </div>

                <div class="form-group">
                  <label for="login">Nome de Usuário</label>
                  <input
                    type="text"
                    id="login"
                    [value]="getPersonLogin()"
                    readonly
                    class="readonly"
                  >
                  <small>Nome de usuário não pode ser alterado</small>
                </div>
              </div>
            </div>

            <div *ngIf="isOng()" class="form-section">
              <h3>Informações da Organização</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Nome da Organização *</label>
                  <input
                    type="text"
                    id="name"
                    formControlName="name"
                    [class.error]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                  >
                  <div *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                       class="error-message">
                    Nome da organização é obrigatório
                  </div>
                </div>

                <div class="form-group">
                  <label for="cnpj">CNPJ *</label>
                  <input
                    type="text"
                    id="cnpj"
                    formControlName="cnpj"
                    placeholder="00.000.000/0000-00"
                    [class.error]="profileForm.get('cnpj')?.invalid && profileForm.get('cnpj')?.touched"
                  >
                  <div *ngIf="profileForm.get('cnpj')?.invalid && profileForm.get('cnpj')?.touched"
                       class="error-message">
                    CNPJ é obrigatório
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="pix">Chave PIX</label>
                  <input
                    type="text"
                    id="pix"
                    formControlName="pix"
                    placeholder="Digite sua chave PIX para doações"
                  >
                  <small class="help-text">Opcional: Adicione sua chave PIX para receber doações</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="instagram">Instagram</label>
                  <input
                    type="url"
                    id="instagram"
                    formControlName="instagram"
                    placeholder="https://instagram.com/suaorganizacao"
                  >
                  <small class="help-text">Opcional: Link para seu perfil do Instagram</small>
                </div>

                <div class="form-group">
                  <label for="facebook">Facebook</label>
                  <input
                    type="url"
                    id="facebook"
                    formControlName="facebook"
                    placeholder="https://facebook.com/suaorganizacao"
                  >
                  <small class="help-text">Opcional: Link para sua página do Facebook</small>
                </div>

                <div class="form-group">
                  <label for="tiktok">TikTok</label>
                  <input
                    type="url"
                    id="tiktok"
                    formControlName="tiktok"
                    placeholder="https://tiktok.com/@suaorganizacao"
                  >
                  <small class="help-text">Opcional: Link para seu perfil do TikTok</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="login">Nome de Usuário</label>
                  <input
                    type="text"
                    id="login"
                    [value]="getOngLogin()"
                    readonly
                    class="readonly"
                  >
                  <small>Nome de usuário não pode ser alterado</small>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Informações de Contato</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    [class.error]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                  >
                  <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                       class="error-message">
                    <span *ngIf="profileForm.get('email')?.errors?.['required']">Email é obrigatório</span>
                    <span *ngIf="profileForm.get('email')?.errors?.['email']">Por favor, digite um email válido</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="phone">Telefone *</label>
                  <input
                    type="tel"
                    id="phone"
                    formControlName="phone"
                    placeholder="(00) 00000-0000"
                    [class.error]="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched"
                  >
                  <div *ngIf="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched"
                       class="error-message">
                    Telefone é obrigatório
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Informações de Endereço</h3>
              <div formGroupName="address">
                <div class="form-row">
                  <div class="form-group">
                    <label for="cep">CEP *</label>
                    <input
                      type="text"
                      id="cep"
                      formControlName="cep"
                      placeholder="00000-000"
                      [class.error]="profileForm.get('address.cep')?.invalid && profileForm.get('address.cep')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.cep')?.invalid && profileForm.get('address.cep')?.touched"
                         class="error-message">
                      CEP é obrigatório
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="state">Estado *</label>
                    <input
                      type="text"
                      id="state"
                      formControlName="state"
                      [class.error]="profileForm.get('address.state')?.invalid && profileForm.get('address.state')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.state')?.invalid && profileForm.get('address.state')?.touched"
                         class="error-message">
                      Estado é obrigatório
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="city">Cidade *</label>
                    <input
                      type="text"
                      id="city"
                      formControlName="city"
                      [class.error]="profileForm.get('address.city')?.invalid && profileForm.get('address.city')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.city')?.invalid && profileForm.get('address.city')?.touched"
                         class="error-message">
                      Cidade é obrigatória
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="neighborhood">Bairro *</label>
                    <input
                      type="text"
                      id="neighborhood"
                      formControlName="neighborhood"
                      [class.error]="profileForm.get('address.neighborhood')?.invalid && profileForm.get('address.neighborhood')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.neighborhood')?.invalid && profileForm.get('address.neighborhood')?.touched"
                         class="error-message">
                      Bairro é obrigatório
                    </div>
                  </div>

                  <div class="form-group flex-grow">
                    <label for="street">Rua *</label>
                    <input
                      type="text"
                      id="street"
                      formControlName="street"
                      [class.error]="profileForm.get('address.street')?.invalid && profileForm.get('address.street')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.street')?.invalid && profileForm.get('address.street')?.touched"
                         class="error-message">
                      Rua é obrigatória
                    </div>
                  </div>

                  <div class="form-group small">
                    <label for="number">Número *</label>
                    <input
                      type="number"
                      id="number"
                      formControlName="number"
                      [class.error]="profileForm.get('address.number')?.invalid && profileForm.get('address.number')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.number')?.invalid && profileForm.get('address.number')?.touched"
                         class="error-message">
                      Número é obrigatório
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">          
              <button
                type="submit"
                [disabled]="profileForm.invalid || isUpdating"
                class="save-btn">
                {{ isUpdating ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
             
              <button
                type="button"
                (click)="cancelAccountUpdate()"
                class="cancel-btn">
                Cancelar Alterações
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="activeTab === 'password'" class="tab-content">
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-section">
              <h3>Alterar Senha</h3>
             
              <div class="form-group">
                <label for="oldPassword">Senha Atual *</label>
                <input
                  type="password"
                  id="oldPassword"
                  formControlName="oldPassword"
                  [class.error]="passwordForm.get('oldPassword')?.invalid && passwordForm.get('oldPassword')?.touched"
                >
                <div *ngIf="passwordForm.get('oldPassword')?.invalid && passwordForm.get('oldPassword')?.touched"
                     class="error-message">
                  Senha atual é obrigatória
                </div>
              </div>

              <div class="form-group">
                <label for="newPassword">Nova Senha *</label>
                <input
                  type="password"
                  id="newPassword"
                  formControlName="newPassword"
                  [class.error]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                >
                <div *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                     class="error-message">
                  <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">Nova senha é obrigatória</span>
                  <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Senha deve ter pelo menos 6 caracteres</span>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  [class.error]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
                >
                <div *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
                     class="error-message">
                  <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Por favor, confirme sua senha</span>
                  <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Senhas não coincidem</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                [disabled]="passwordForm.invalid || isChangingPassword"
                class="save-btn">
                {{ isChangingPassword ? 'Alterando...' : 'Alterar Senha' }}
              </button>
             
              <button
                type="button"
                (click)="resetPasswordForm()"
                class="cancel-btn">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styleUrl: './my-account.component.scss'
})
export class MyAccountComponent implements OnInit {
  userInfo: UserInfo | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  isUpdating = false;
  isChangingPassword = false;
  error = '';
  successMessage = '';
  errorMessage = '';
  activeTab: 'profile' | 'password' = 'profile';

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private destroyRef: DestroyRef
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      firstName: [''],
      middleName: [''],
      familyName: [''],
      cpf: [''],
     
      name: [''],
      cnpj: [''],
      pix: [''],
      instagram: [''],
      facebook: [''],
      tiktok: [''],
     
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

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
   
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
   
    return null;
  }

  loadUserData(): void {
    this.loading = true;
    this.error = '';
   
    this.accountService.getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (userInfo) => {
          this.userInfo = userInfo as UserInfo;
          this.populateForm(userInfo as UserInfo);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Falha ao carregar informações da conta';
          this.loading = false;
        }
      });
  }

  private populateForm(userInfo: UserInfo): void {
    if (userInfo.userType === 'PERSON') {
      const person = userInfo.user as Person;
     
      this.profileForm.get('name')?.clearValidators();
      this.profileForm.get('name')?.updateValueAndValidity();
      this.profileForm.get('cnpj')?.clearValidators();
      this.profileForm.get('cnpj')?.updateValueAndValidity();
     
      this.profileForm.get('firstName')?.setValidators([Validators.required]);
      this.profileForm.get('firstName')?.updateValueAndValidity();
      this.profileForm.get('familyName')?.setValidators([Validators.required]);
      this.profileForm.get('familyName')?.updateValueAndValidity();
      this.profileForm.get('cpf')?.setValidators([Validators.required]);
      this.profileForm.get('cpf')?.updateValueAndValidity();
     
      this.profileForm.patchValue({
        firstName: person.firstName,
        middleName: person.middleName || '',
        familyName: person.familyName,
        cpf: person.cpf,
        email: person.email,
        phone: person.phone,
        address: person.address
      });
    } else {
      const ong = userInfo.user as Ong;
     
      this.profileForm.get('firstName')?.clearValidators();
      this.profileForm.get('firstName')?.updateValueAndValidity();
      this.profileForm.get('familyName')?.clearValidators();
      this.profileForm.get('familyName')?.updateValueAndValidity();
      this.profileForm.get('cpf')?.clearValidators();
      this.profileForm.get('cpf')?.updateValueAndValidity();

      this.profileForm.get('name')?.setValidators([Validators.required]);
      this.profileForm.get('name')?.updateValueAndValidity();
      this.profileForm.get('cnpj')?.setValidators([Validators.required]);
      this.profileForm.get('cnpj')?.updateValueAndValidity();
     
      this.profileForm.patchValue({
        name: ong.name,
        cnpj: ong.cnpj,
        pix: ong.pix || '',
        instagram: ong.instagram || '',
        facebook: ong.facebook || '',
        tiktok: ong.tiktok || '',
        email: ong.email,
        phone: ong.phone,
        address: ong.address
      });
    }
   
    this.profileForm.updateValueAndValidity();
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.userInfo) {
      this.isUpdating = true;
      this.successMessage = '';
      this.errorMessage = '';

      if (this.userInfo.userType === 'PERSON') {
        const person = this.userInfo.user as Person;
        const updateData: PersonUpdateRequest = {
          firstName: this.profileForm.value.firstName,
          middleName: this.profileForm.value.middleName,
          familyName: this.profileForm.value.familyName,
          cpf: this.profileForm.value.cpf,
          email: this.profileForm.value.email,
          phone: this.profileForm.value.phone,
          address: this.profileForm.value.address
        };

        if (!person.id) {
          this.errorMessage = 'ID da pessoa não encontrado';
          this.isUpdating = false;
          return;
        }

        this.accountService.updatePerson(person.id, updateData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updatedPerson) => {
              this.userInfo!.user = updatedPerson as Person;
              this.successMessage = 'Perfil atualizado com sucesso!';
              this.isUpdating = false;
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Falha ao atualizar perfil';
              this.isUpdating = false;
            }
          });
      } else {
        const ong = this.userInfo.user as Ong;
        const updateData: OngUpdateRequest = {
          name: this.profileForm.value.name,
          cnpj: this.profileForm.value.cnpj,
          pix: this.profileForm.value.pix,
          instagram: this.profileForm.value.instagram,
          facebook: this.profileForm.value.facebook,
          tiktok: this.profileForm.value.tiktok,
          email: this.profileForm.value.email,
          phone: this.profileForm.value.phone,
          address: this.profileForm.value.address
        };

        if (!ong.id) {
          this.errorMessage = 'ID da ONG não encontrado';
          this.isUpdating = false;
          return;
        }

        this.accountService.updateOng(ong.id, updateData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updatedOng) => {
              this.userInfo!.user = updatedOng as Ong;
              this.successMessage = 'Perfil atualizado com sucesso!';
              this.isUpdating = false;
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Falha ao atualizar perfil';
              this.isUpdating = false;
            }
          });
      }
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      this.successMessage = '';
      this.errorMessage = '';

      const { oldPassword, newPassword } = this.passwordForm.value;

      this.accountService.changePassword(oldPassword, newPassword)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.successMessage = 'Senha alterada com sucesso!';
            this.resetPasswordForm();
            this.isChangingPassword = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Falha ao alterar senha';
            this.isChangingPassword = false;
          }
        });
    }
  }

  resetForm(): void {
    if (this.userInfo) {
      this.populateForm(this.userInfo);
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelAccountUpdate(): void {
    this.resetForm();
  }

  getPersonLogin(): string {
    return this.userInfo && this.userInfo.userType === 'PERSON'
      ? (this.userInfo.user as Person).login
      : '';
  }

  getOngLogin(): string {
    return this.userInfo && this.userInfo.userType === 'ONG'
      ? (this.userInfo.user as Ong).login
      : '';
  }

  isPerson(): boolean {
    return this.userInfo?.userType === 'PERSON';
  }

  isOng(): boolean {
    return this.userInfo?.userType === 'ONG';
  }

  getPersonData(): Person | null {
    return this.isPerson() ? (this.userInfo!.user as Person) : null;
  }

  getOngData(): Ong | null {
    return this.isOng() ? (this.userInfo!.user as Ong) : null;
  }
}