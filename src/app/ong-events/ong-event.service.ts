import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Event as EventModel } from './event.model';


@Injectable({
  providedIn: 'root'
})
export class OngEventService {
  private readonly apiUrl = 'http://localhost:8080/api/event';


  constructor(private http: HttpClient) {}


  /**
   * Get all events
   * @returns Observable<EventModel[]>
   */
  getAllEvents(): Observable<EventModel[]> {
    console.log('📡 EventService: Making GET request to', this.apiUrl);
   
    // Check if token exists before making request
    const token = localStorage.getItem('token');
    console.log('🔑 JWT Token exists:', !!token);
    console.log('🔑 JWT Token length:', token?.length || 0);
   
    return this.http.get<EventModel[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('❌ EventService error details:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error URL:', error.url);
          console.error('❌ Full error object:', error);
         
          // Check if it's a CORS or network error
          if (error.status === 0) {
            console.error('❌ Network error - check if backend is running and CORS is configured');
          } else if (error.status === 403) {
            console.error('❌ 403 Forbidden - check Spring Security configuration and user permissions');
          }
         
          return this.handleError(error);
        })
      );
  }


  /**
   * Get event by ID
   * @param id - The event ID
   * @returns Observable<EventModel>
   */
  getEventById(id: string): Observable<EventModel> {
    const url = `${this.apiUrl}/${id}`;
    console.log('📡 EventService: Making GET request to', url);
    console.log('📡 EventService: Event ID parameter:', id);
    console.log('📡 EventService: Full API URL:', this.apiUrl);
    return this.http.get<EventModel>(url)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('❌ EventService.getEventById error:', error);
          console.error('❌ Requested URL was:', url);
          console.error('❌ Event ID was:', id);
          console.error('❌ Error response body:', error.error);
          console.error('❌ Error response type:', typeof error.error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error statusText:', error.statusText);
         
          // Check if we're getting HTML instead of JSON
          if (typeof error.error === 'string' && error.error.includes('<html>')) {
            console.error('❌ Received HTML response instead of JSON - likely a server error page');
            console.error('❌ HTML content preview:', error.error.substring(0, 200));
          }
         
          return this.handleError(error);
        })
      );
  }


  /**
   * Get events by ONG ID
   * @param ongId - The ONG ID
   * @returns Observable<EventModel[]>
   */
  getEventsByOngId(ongId: string): Observable<EventModel[]> {
    const url = `${this.apiUrl}/ong/${ongId}`;
    console.log('📡 EventService: Making GET request to', url);
    return this.http.get<EventModel[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }


  /**
   * Create new event
   * @param event - The event data to create
   * @returns Observable<EventModel>
   */
  createEvent(event: Omit<EventModel, 'id'>): Observable<EventModel> {
    console.log('📡 EventService: Making POST request to', this.apiUrl);
    console.log('📡 Event data:', event);
    return this.http.post<EventModel>(this.apiUrl, event)
      .pipe(
        retry(1),
        catchError(this.handleError)
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


    console.error('EventService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}