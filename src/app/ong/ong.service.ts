import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Ong } from './ong.model';

@Injectable({
  providedIn: 'root'
})
export class OngService {
  private readonly apiUrl = 'http://localhost:8080/api/ong';

  constructor(private http: HttpClient) {}

  getAllOngs(): Observable<Ong[]> {
    return this.http.get<Ong[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getOngById(id: string): Observable<Ong> {
    const url = `${this.apiUrl}/${id}`;
   
    return this.http.get<Ong>(url)
      .pipe(
        retry(2),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor. Por favor checar sua conexão com a internet.';
          break;
        case 401:
          errorMessage = 'Você não tem autorização para acessar este recurso.';
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