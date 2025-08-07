import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Event as EventModel } from './event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OngEventService {
  private readonly apiUrl = `${environment.apiUrl}/event`;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<EventModel[]> {
    const token = localStorage.getItem('token');
    return this.http.get<EventModel[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getEventById(id: string): Observable<EventModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<EventModel>(url)
      .pipe(
        retry(2),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getEventsByOngId(ongId: string): Observable<EventModel[]> {
    const url = `${this.apiUrl}/ong/${ongId}`;
    return this.http.get<EventModel[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  createEvent(event: Omit<EventModel, 'id'>): Observable<EventModel> {
    return this.http.post<EventModel>(this.apiUrl, event)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor. Por favor checar sua conexão de internet.';
          break;
        case 401:
          errorMessage = 'Você não tem autorização para acessar este conteúdo.';
          break;
        case 403:
          errorMessage = 'Acesso a este recurso não é permitido.';
          break;
        case 404:
          errorMessage = 'O recurso requisitado não foi encontrado.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Por favor tente novamente mais tarde.';
          break;
        default:
          errorMessage = `Servidor retornou o código: ${error.status}, mensagem de erro é: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}