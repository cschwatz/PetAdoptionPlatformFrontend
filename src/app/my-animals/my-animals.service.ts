import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Animal } from '../animal/animal.model';


@Injectable({
  providedIn: 'root'
})
export class MyAnimalsService {
  private apiUrl = 'http://localhost:8080/api'; // Base URL for API endpoints
 
  constructor(private http: HttpClient) {}


  // Get animals for the authenticated ONG
  getMyAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/ong/my-animals`).pipe(
      retry(2), // Retry failed requests up to 2 times
      catchError(this.handleError)
    );
  }


  // Get specific animal by ID (for the authenticated ONG)
  getMyAnimalById(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/animal/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  // Update animal (for the authenticated ONG)
  updateMyAnimal(id: string, animal: Partial<Animal>): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/animal/${id}`, animal).pipe(
      catchError(this.handleError)
    );
  }


  // Delete animal (for the authenticated ONG)
  deleteMyAnimal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/animal/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  // Create new animal (for the authenticated ONG)
  createAnimal(animal: Omit<Animal, 'id'>): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/animal`, animal).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
   
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case 401:
          errorMessage = 'You are not authorized to access this resource.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access these animals.';
          break;
        case 404:
          errorMessage = 'The requested animals could not be found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
   
    console.error('MyAnimalsService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}