import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Animal } from '../animal/animal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {
  private apiUrl = `${environment.apiUrl}/animal`;
 
  constructor(private http: HttpClient) {}

  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getAnimalById(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAnimalsWithParams(params: {
    page?: number;
    size?: number;
    species?: string;
    status?: string;
    minAge?: number;
    maxAge?: number;
  }): Observable<{content: Animal[], totalElements: number, totalPages: number}> {
    let queryParams = new URLSearchParams();
   
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.http.get<{content: Animal[], totalElements: number, totalPages: number}>(
      `${this.apiUrl}?${queryParams.toString()}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  expressInterest(animalId: number, userInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${animalId}/interest`, userInfo).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Um erro ocorreu ao requisitar os dados.';
   
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Não foi possivel se conectar ao servidor. Por favor cheque sua conexão com a internet.';
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