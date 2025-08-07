import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Event as EventModel } from '../ong-events/event.model';


@Injectable({
  providedIn: 'root'
})
export class MyEventsService {
  private apiUrl = 'http://localhost:8080/api'; // Base URL for API endpoints
 
  constructor(private http: HttpClient) {}


  // Get events for the authenticated ONG
  getMyEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.apiUrl}/ong/my-events`).pipe(
      retry(2), // Retry failed requests up to 2 times
      catchError(this.handleError)
    );
  }


  // Get specific event by ID (for the authenticated ONG)
  getMyEventById(id: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.apiUrl}/event/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  // Create new event (for the authenticated ONG)
  createMyEvent(event: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/event`, event).pipe(
      catchError(this.handleError)
    );
  }


  // Update event (for the authenticated ONG)
  updateMyEvent(id: string, event: Partial<EventModel>): Observable<EventModel> {
    return this.http.put<EventModel>(`${this.apiUrl}/event/${id}`, event).pipe(
      catchError(this.handleError)
    );
  }


  // Delete event (for the authenticated ONG)
  deleteMyEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/event/${id}`).pipe(
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
          errorMessage = 'You do not have permission to access these events.';
          break;
        case 404:
          errorMessage = 'The requested events could not be found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
   
    console.error('MyEventsService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}