import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService, UserInfo } from './account.service';
import { Person, PersonUpdateRequest } from '../person/person.model';
import { Ong, OngUpdateRequest } from '../ong/ong.model';
import { Router } from '@angular/router';
import { Address } from '../address/address.model';


@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="account-container">
      <div class="account-header">
        <h1>My Account</h1>
        <p>Manage your account information and settings</p>
      </div>


      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading account information...</p>
      </div>


      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Error Loading Account</h3>
        <p>{{ error }}</p>
        <button (click)="loadUserData()" class="retry-btn">Try Again</button>
      </div>


      <!-- Account Content -->
      <div *ngIf="!loading && !error && userInfo" class="account-content">
       
        <!-- User Type Badge -->
        <div class="user-type-badge" [ngClass]="userInfo.userType.toLowerCase()">
          {{ isPerson() ? '👤 Individual Account' : '🏢 Organization Account' }}
        </div>


        <!-- Tab Navigation -->
        <div class="tab-nav">
          <button
            [class.active]="activeTab === 'profile'"
            (click)="activeTab = 'profile'">
            Profile Information
          </button>
          <button
            [class.active]="activeTab === 'password'"
            (click)="activeTab = 'password'">
            Change Password
          </button>
        </div>


        <!-- Profile Tab -->
        <div *ngIf="activeTab === 'profile'" class="tab-content">
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
           
            <!-- Person Form -->
            <div *ngIf="isPerson()" class="form-section">
              <h3>Personal Information</h3>
             
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    [class.error]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                  >
                  <div *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                       class="error-message">
                    First name is required
                  </div>
                </div>


                <div class="form-group">
                  <label for="middleName">Middle Name</label>
                  <input
                    type="text"
                    id="middleName"
                    formControlName="middleName"
                  >
                </div>


                <div class="form-group">
                  <label for="familyName">Family Name *</label>
                  <input
                    type="text"
                    id="familyName"
                    formControlName="familyName"
                    [class.error]="profileForm.get('familyName')?.invalid && profileForm.get('familyName')?.touched"
                  >
                  <div *ngIf="profileForm.get('familyName')?.invalid && profileForm.get('familyName')?.touched"
                       class="error-message">
                    Family name is required
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
                    CPF is required
                  </div>
                </div>


                <div class="form-group">
                  <label for="login">Username</label>
                  <input
                    type="text"
                    id="login"
                    [value]="getPersonLogin()"
                    readonly
                    class="readonly"
                  >
                  <small>Username cannot be changed</small>
                </div>
              </div>
            </div>


            <!-- ONG Form -->
            <div *ngIf="isOng()" class="form-section">
              <h3>Organization Information</h3>
             
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Organization Name *</label>
                  <input
                    type="text"
                    id="name"
                    formControlName="name"
                    [class.error]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                  >
                  <div *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                       class="error-message">
                    Organization name is required
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
                    CNPJ is required
                  </div>
                </div>
              </div>


              <div class="form-row">
                <div class="form-group">
                  <label for="login">Username</label>
                  <input
                    type="text"
                    id="login"
                    [value]="getOngLogin()"
                    readonly
                    class="readonly"
                  >
                  <small>Username cannot be changed</small>
                </div>
              </div>
            </div>


            <!-- Contact Information (Common) -->
            <div class="form-section">
              <h3>Contact Information</h3>
             
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
                    <span *ngIf="profileForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="profileForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                  </div>
                </div>


                <div class="form-group">
                  <label for="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    formControlName="phone"
                    placeholder="(00) 00000-0000"
                    [class.error]="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched"
                  >
                  <div *ngIf="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched"
                       class="error-message">
                    Phone is required
                  </div>
                </div>
              </div>
            </div>


            <!-- Address Information (Common) -->
            <div class="form-section">
              <h3>Address Information</h3>
             
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
                      CEP is required
                    </div>
                  </div>


                  <div class="form-group">
                    <label for="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      formControlName="state"
                      [class.error]="profileForm.get('address.state')?.invalid && profileForm.get('address.state')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.state')?.invalid && profileForm.get('address.state')?.touched"
                         class="error-message">
                      State is required
                    </div>
                  </div>


                  <div class="form-group">
                    <label for="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      formControlName="city"
                      [class.error]="profileForm.get('address.city')?.invalid && profileForm.get('address.city')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.city')?.invalid && profileForm.get('address.city')?.touched"
                         class="error-message">
                      City is required
                    </div>
                  </div>
                </div>


                <div class="form-row">
                  <div class="form-group">
                    <label for="neighborhood">Neighborhood *</label>
                    <input
                      type="text"
                      id="neighborhood"
                      formControlName="neighborhood"
                      [class.error]="profileForm.get('address.neighborhood')?.invalid && profileForm.get('address.neighborhood')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.neighborhood')?.invalid && profileForm.get('address.neighborhood')?.touched"
                         class="error-message">
                      Neighborhood is required
                    </div>
                  </div>


                  <div class="form-group flex-grow">
                    <label for="street">Street *</label>
                    <input
                      type="text"
                      id="street"
                      formControlName="street"
                      [class.error]="profileForm.get('address.street')?.invalid && profileForm.get('address.street')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.street')?.invalid && profileForm.get('address.street')?.touched"
                         class="error-message">
                      Street is required
                    </div>
                  </div>


                  <div class="form-group small">
                    <label for="number">Number *</label>
                    <input
                      type="number"
                      id="number"
                      formControlName="number"
                      [class.error]="profileForm.get('address.number')?.invalid && profileForm.get('address.number')?.touched"
                    >
                    <div *ngIf="profileForm.get('address.number')?.invalid && profileForm.get('address.number')?.touched"
                         class="error-message">
                      Number is required
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <!-- Form Actions -->
            <div class="form-actions">
              <button
                type="submit"
                [disabled]="profileForm.invalid || isUpdating"
                class="save-btn">
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
             
              <button
                type="button"
                (click)="cancelAccountUpdate()"
                class="cancel-btn">
                Cancel Changes
              </button>
            </div>
          </form>
        </div>


        <!-- Password Tab -->
        <div *ngIf="activeTab === 'password'" class="tab-content">
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-section">
              <h3>Change Password</h3>
             
              <div class="form-group">
                <label for="oldPassword">Current Password *</label>
                <input
                  type="password"
                  id="oldPassword"
                  formControlName="oldPassword"
                  [class.error]="passwordForm.get('oldPassword')?.invalid && passwordForm.get('oldPassword')?.touched"
                >
                <div *ngIf="passwordForm.get('oldPassword')?.invalid && passwordForm.get('oldPassword')?.touched"
                     class="error-message">
                  Current password is required
                </div>
              </div>


              <div class="form-group">
                <label for="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  formControlName="newPassword"
                  [class.error]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                >
                <div *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                     class="error-message">
                  <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required</span>
                  <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 6 characters</span>
                </div>
              </div>


              <div class="form-group">
                <label for="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  [class.error]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
                >
                <div *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
                     class="error-message">
                  <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                  <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
                </div>
              </div>
            </div>


            <div class="form-actions">
              <button
                type="submit"
                [disabled]="passwordForm.invalid || isChangingPassword"
                class="save-btn">
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </button>
             
              <button
                type="button"
                (click)="resetPasswordForm()"
                class="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>


        <!-- Success/Error Messages -->
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
  private router = inject(Router);


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
      // Person fields
      firstName: [''],
      middleName: [''],
      familyName: [''],
      cpf: [''],
     
      // ONG fields
      name: [''],
      cnpj: [''],
     
      // Common fields
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
          this.error = error.message || 'Failed to load account information';
          this.loading = false;
        }
      });
  }


  private populateForm(userInfo: UserInfo): void {
    if (userInfo.userType === 'PERSON') {
      const person = userInfo.user as Person;
     
      // Set person-specific validators
      this.profileForm.get('firstName')?.setValidators([Validators.required]);
      this.profileForm.get('familyName')?.setValidators([Validators.required]);
      this.profileForm.get('cpf')?.setValidators([Validators.required]);
     
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
     
      // Set ONG-specific validators
      this.profileForm.get('name')?.setValidators([Validators.required]);
      this.profileForm.get('cnpj')?.setValidators([Validators.required]);
     
      this.profileForm.patchValue({
        name: ong.name,
        cnpj: ong.cnpj,
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
          this.errorMessage = 'Person ID not found';
          this.isUpdating = false;
          return;
        }


        this.accountService.updatePerson(person.id, updateData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updatedPerson) => {
              this.userInfo!.user = updatedPerson as Person;
              this.successMessage = 'Profile updated successfully!';
              this.isUpdating = false;
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Failed to update profile';
              this.isUpdating = false;
            }
          });
      } else {
        const ong = this.userInfo.user as Ong;
        const updateData: OngUpdateRequest = {
          name: this.profileForm.value.name,
          cnpj: this.profileForm.value.cnpj,
          email: this.profileForm.value.email,
          phone: this.profileForm.value.phone,
          address: this.profileForm.value.address
        };


        if (!ong.id) {
          this.errorMessage = 'ONG ID not found';
          this.isUpdating = false;
          return;
        }


        this.accountService.updateOng(ong.id, updateData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updatedOng) => {
              this.userInfo!.user = updatedOng as Ong;
              this.successMessage = 'Profile updated successfully!';
              this.isUpdating = false;
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Failed to update profile';
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
            this.successMessage = 'Password changed successfully!';
            this.resetPasswordForm();
            this.isChangingPassword = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to change password';
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


  // Helper methods for template
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


  // Type guard helpers for cleaner template logic
  isPerson(): boolean {
    return this.userInfo?.userType === 'PERSON';
  }


  isOng(): boolean {
    return this.userInfo?.userType === 'ONG';
  }


  // Get current user as Person (with type safety)
  getPersonData(): Person | null {
    return this.isPerson() ? (this.userInfo!.user as Person) : null;
  }


  // Get current user as ONG (with type safety)
  getOngData(): Ong | null {
    return this.isOng() ? (this.userInfo!.user as Ong) : null;
  }

  cancelAccountUpdate(): void {
    this.router.navigate(['/dashboard']);
  }

}