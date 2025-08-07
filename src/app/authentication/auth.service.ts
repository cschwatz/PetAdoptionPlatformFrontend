import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {
  }


  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/person-login`, credentials)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
            this.isLoggedInSubject.next(true);
          }
        }),
        catchError(error => {
          return this.http.post<LoginResponse>(`${this.apiUrl}/login/ong-login`, credentials)
            .pipe(
              tap((response: any) => {
                if (response.token) {
                  localStorage.setItem('auth_token', response.token);
                  this.isLoggedInSubject.next(true);
                }
              }),
              catchError(ongError => {
                throw new Error('Credenciais inválidas');
              })
            );
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  isLoggedInSync(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    return token;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getUserType(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userType || payload.role || null;
      } catch (error) {
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