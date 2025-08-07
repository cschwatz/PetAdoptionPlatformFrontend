import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Event as EventModel } from '../ong-events/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyEventsService {
  private apiUrl = `${environment.apiUrl}`;
 
  constructor(private http: HttpClient) {}

  getMyEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.apiUrl}/ong/my-events`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getMyEventById(id: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.apiUrl}/event/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createMyEvent(event: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/event`, event).pipe(
      catchError(this.handleError)
    );
  }

  updateMyEvent(id: string, event: Partial<EventModel>): Observable<EventModel> {
    return this.http.put<EventModel>(`${this.apiUrl}/event/${id}`, event).pipe(
      catchError(this.handleError)
    );
  }

  deleteMyEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/event/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Um erro desconhecido aconteceu!';
   
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Você não tem autorização para acessar este recurso.';
          break;
        case 403:
          errorMessage = 'Você não tem permissão para acessar estes eventos.';
          break;
        case 404:
          errorMessage = 'O evento requisitado não foi encontrado.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Por favor tente novamente.';
          break;
        default:
          errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
      }
    }
   
    return throwError(() => new Error(errorMessage));
  }
}