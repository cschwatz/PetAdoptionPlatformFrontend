import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';


export interface LoginRequest {
  login: string;
  password: string;
}


export interface LoginResponse {
  token?: string;
  message?: string;
  // Add other fields based on your backend response
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080'; // Remove /api from here
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());


  constructor(private http: HttpClient) {
    // Debug: Log initial token state
    console.log('🔑 AuthService initialized. Token exists:', this.hasToken());
    console.log('🔑 Initial token:', this.getToken());
  }


  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🚀 Attempting login...');
   
    // Try person login first (will work for both Person and ONG with unified UserDetailsService)
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/login/person-login`, credentials)
      .pipe(
        tap((response: any) => {
          console.log('✅ Login response:', response);
          if (response.token) {
            console.log('💾 Storing token:', response.token);
            localStorage.setItem('auth_token', response.token);
            this.isLoggedInSubject.next(true);
            console.log('✅ Token stored successfully');
          }
        }),
        // If person-login fails, try ONG login as fallback
        catchError(error => {
          console.log('❌ Person login failed, trying ONG login...', error);
          return this.http.post<LoginResponse>(`${this.apiUrl}/api/login/ong-login`, credentials)
            .pipe(
              tap((response: any) => {
                console.log('✅ ONG login response:', response);
                if (response.token) {
                  console.log('💾 Storing token (ONG):', response.token);
                  localStorage.setItem('auth_token', response.token);
                  this.isLoggedInSubject.next(true);
                  console.log('✅ ONG token stored successfully');
                }
              }),
              catchError(ongError => {
                console.log('❌ Both login attempts failed');
                throw new Error('Invalid credentials');
              })
            );
        })
      );
  }


  logout(): void {
    console.log('👋 Logging out...');
    localStorage.removeItem('auth_token');
    this.isLoggedInSubject.next(false);
    console.log('✅ Token removed');
  }


  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  isLoggedInSync(): boolean {
    return this.hasToken();
  }


  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('🔍 Getting token:', token ? 'Token exists' : 'No token');
    return token;
  }


  private hasToken(): boolean {
    return !!this.getToken();
  }


  // Add these methods to your AuthService
  getUserType(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', payload);
        return payload.userType || payload.role || null;
      } catch (error) {
        console.error('❌ Error parsing token:', error);
        return null;
      }
    }
    return null;
  }


  isPerson(): boolean {
    const userType = this.getUserType();
    return userType === 'PERSON';
  }


  isOng(): boolean {
    const userType = this.getUserType();
    return userType === 'ONG';
  }
}