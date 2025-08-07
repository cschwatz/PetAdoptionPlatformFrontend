import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Ong } from './ong.model';


@Injectable({
  providedIn: 'root'
})
export class OngService {
  private readonly apiUrl = 'http://localhost:8080/api/ong'; // Use full URL like MyAnimalsService


  constructor(private http: HttpClient) {}

  /**
   * Get all ONGs
   * @returns Observable<Ong[]>
   */
  getAllOngs(): Observable<Ong[]> {
    console.log('📡 OngService: Making GET request to', this.apiUrl);
    return this.http.get<Ong[]>(this.apiUrl)
      .pipe(
        retry(2), // Retry failed requests up to 2 times
        catchError(this.handleError)
      );
  }


  /**
   * Get ONG by ID
   * @param id - The ONG ID
   * @returns Observable<Ong>
   */
  getOngById(id: string): Observable<Ong> {
    const url = `${this.apiUrl}/${id}`;
    console.log('📡 OngService: Making GET request to', url);
    console.log('📡 OngService: ID parameter:', id);
    console.log('📡 OngService: Base API URL:', this.apiUrl);
   
    return this.http.get<Ong>(url)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('❌ OngService error details:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error URL:', error.url);
          console.error('❌ Full error object:', error);
          return this.handleError(error);
        })
      );
  }


  /**
   * Handle HTTP errors
   * @param error - The HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong';


    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 401:
          errorMessage = 'You are not authorized to access this resource.';
          break;
        case 403:
          errorMessage = 'Access to this resource is forbidden.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
      }
    }


    console.error('OngService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}