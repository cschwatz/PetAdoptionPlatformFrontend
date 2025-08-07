import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyEventsService } from '../my-events/my-events.service';
import { Event as EventModel, EventTypeEnum } from './event.model';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-event-container">
      <!-- Header with back button -->
      <header class="create-header">
        <button (click)="goBack()" class="back-btn">
          ← Voltar aos Eventos
        </button>
        <h1>📅 Criar Novo Evento</h1>
        <p>Organize um novo evento para sua ONG</p>
      </header>


      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <h3>⚠️ Opa! Derrubaram o pote de aǵua nos fios do servidor</h3>
        <p>{{ error }}</p>
        <button (click)="error = null" class="retry-btn">Tentar Novamente</button>
      </div>


      <!-- Create Form -->
      <div class="form-container">
        <form [formGroup]="createForm" (ngSubmit)="onSubmit()" class="create-form">
         
          <!-- Basic Information -->
          <div class="form-section">
            <h3>Informação Básica</h3>
           
            <div class="form-row">
              <div class="form-group full-width">
                <label for="name">Nome do Evento *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  placeholder="Enter event name"
                  [class.error]="createForm.get('name')?.invalid && createForm.get('name')?.touched">
                <div *ngIf="createForm.get('name')?.invalid && createForm.get('name')?.touched" class="error-message">
                  Nome do Evento é obrigatório
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="eventType">Tipo do Evento *</label>
                <select
                  id="eventType"
                  formControlName="eventType"
                  [class.error]="createForm.get('eventType')?.invalid && createForm.get('eventType')?.touched">
                  <option value="">Selecione o tipo do evento</option>
                  <option value="ADOPTION_FAIR">Feira de Adoção</option>
                  <option value="FUNDRAISING">Angariamento de Fundos</option>
                  <option value="AWARENESS_CAMPAIGN">Campanha de Conscientização</option>
                  <option value="VETERINARY_CLINIC">Clínica Veterinária</option>
                  <option value="VOLUNTEER_MEETING">Encontro de Voluntários</option>
                  <option value="OTHER">Other</option>
                </select>
                <div *ngIf="createForm.get('eventType')?.invalid && createForm.get('eventType')?.touched" class="error-message">
                  Tipo do Evento é obrigatório
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="obs">Descrição do Evento</label>
                <textarea
                  id="obs"
                  formControlName="obs"
                  placeholder="Describe your event - what will happen, who should attend, etc."
                  rows="4"></textarea>
                <small class="help-text">Forneça detalhes do evento para ajudar as pessoas e entenderem seu funcionamento</small>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Data e Horário</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Data e Horário de Início *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  formControlName="startDate"
                  [class.error]="createForm.get('startDate')?.invalid && createForm.get('startDate')?.touched">
                <div *ngIf="createForm.get('startDate')?.invalid && createForm.get('startDate')?.touched" class="error-message">
                  Data e Horário de Início é obrigatório
                </div>
              </div>

              <div class="form-group">
                <label for="endDate">Data e Horário de Encerramento *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  formControlName="endDate"
                  [class.error]="createForm.get('endDate')?.invalid && createForm.get('endDate')?.touched">
                <div *ngIf="createForm.get('endDate')?.invalid && createForm.get('endDate')?.touched" class="error-message">
                  Data e Horário de Encerramento é obrigatório
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Location</h3>
           
            <div class="form-row">
              <div class="form-group">
                <label for="street">Rua</label>
                <input
                  type="text"
                  id="street"
                  formControlName="street"
                  placeholder="Street address">
              </div>

              <div class="form-group">
                <label for="number">Número</label>
                <input
                  type="number"
                  id="number"
                  formControlName="number"
                  placeholder="Number"
                  min="0">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="neighborhood">Bairro</label>
                <input
                  type="text"
                  id="neighborhood"
                  formControlName="neighborhood"
                  placeholder="Neighborhood">
              </div>

              <div class="form-group">
                <label for="city">Cidade</label>
                <input
                  type="text"
                  id="city"
                  formControlName="city"
                  placeholder="City">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="state">Estado</label>
                <input
                  type="text"
                  id="state"
                  formControlName="state"
                  placeholder="State"
                  maxlength="2">
              </div>

              <div class="form-group">
                <label for="cep">CEP</label>
                <input
                  type="text"
                  id="cep"
                  formControlName="cep"
                  placeholder="00000-000"
                  maxlength="9">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              (click)="goBack()"
              class="cancel-btn"
              [disabled]="saving">
              Cancelar
            </button>
            <button
              type="submit"
              class="save-btn"
              [disabled]="createForm.invalid || saving">
              <span *ngIf="saving">Criando Evento...</span>
              <span *ngIf="!saving">📅 Criar Evento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-event-container {
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
      padding: 0.75rem 1rem;
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
      background: #f8d7da;
      color: #721c24;
      border-radius: 8px;
      border: 1px solid #f5c6cb;
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

    .form-group.full-width {
      grid-column: 1 / -1;
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
      .create-event-container {
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
export class EventCreateComponent implements OnInit {
  createForm!: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private myEventsService: MyEventsService,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (!this.authService.isOng()) {
      this.error = 'Você deve ser uma ONG para criar um evento.';
      return;
    }
  }

  private initializeForm(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required]],
      eventType: ['', [Validators.required]],
      obs: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      street: [''],
      number: [null],
      neighborhood: [''],
      city: [''],
      state: [''],
      cep: ['']
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      Object.keys(this.createForm.controls).forEach(key => {
        this.createForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    this.error = null;

    const formData = this.createForm.value;

    const startDate = this.formatDateForBackend(formData.startDate);
    const endDate = this.formatDateForBackend(formData.endDate);

    let address = null;
    if (formData.street || formData.city || formData.state) {
      address = {
        street: formData.street || '',
        number: formData.number || 0,
        neighborhood: formData.neighborhood || '',
        city: formData.city || '',
        state: formData.state || '',
        cep: formData.cep || ''
      };
    }

    const eventData: Omit<EventModel, 'id' | 'ong'> = {
      name: formData.name,
      eventType: formData.eventType as EventTypeEnum,
      obs: formData.obs || undefined,
      startDate: startDate,
      endDate: endDate,
      address: address || undefined
    };

    this.myEventsService.createMyEvent(eventData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/my-events']);
        },
        error: (error: any) => {
          this.error = error.message || 'Falha ao criar o evento.';
          this.saving = false;
        }
      });
  }

  private formatDateForBackend(dateTimeLocal: string): string {
    const date = new Date(dateTimeLocal);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
   
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  goBack(): void {
    this.router.navigate(['/my-events']);
  }
}