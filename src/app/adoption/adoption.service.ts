import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Animal } from '../animal/animal.model';




@Injectable({
  providedIn: 'root'
})
export class AdoptionService {
  private apiUrl = 'http://localhost:8080/api/animal'; // Adjust to your backend URL
 
  constructor(private http: HttpClient) {}


  // Get all animals
  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }


  // Get animal by ID
  getAnimalById(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  // Get animals with filtering/pagination (if your backend supports it)
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


  // Express interest in an animal (if you have this endpoint)
  expressInterest(animalId: number, userInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${animalId}/interest`, userInfo).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while fetching data.';
   
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
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
   
    console.error('AnimalService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

