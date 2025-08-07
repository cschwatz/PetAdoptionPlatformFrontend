import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Animal } from '../animal/animal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyAnimalsService {
  private apiUrl = `${environment.apiUrl}`;
 
  constructor(private http: HttpClient) {}

  getMyAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/ong/my-animals`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  getMyAnimalById(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/animal/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateMyAnimal(id: string, animal: Partial<Animal>): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/animal/${id}`, animal).pipe(
      catchError(this.handleError)
    );
  }

  deleteMyAnimal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/animal/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createAnimal(animal: Omit<Animal, 'id'>): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/animal`, animal).pipe(
      catchError(this.handleError)
    );
  }

  createMyAnimal(animal: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/animal`, animal).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
   
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Você não tem autorização para acessar este recurso.';
          break;
        case 403:
          errorMessage = 'Você não tem permissão para acessar estes animais.';
          break;
        case 404:
          errorMessage = 'O animal requisitado não foi encontrado.';
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