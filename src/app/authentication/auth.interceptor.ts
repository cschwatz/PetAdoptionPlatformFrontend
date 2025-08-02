// auth.interceptor.ts - FIXED VERSION
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 Interceptor called for URL:', req.url);

    // Be very specific about what gets the token
    const apiBaseUrl = 'http://localhost:8080/api/';
    
    // Additional checks to be extra safe
    const isApiRequest = req.url.startsWith(apiBaseUrl);
    const isDevServerRequest = req.url.includes('localhost:4200');
    const isAssetRequest = req.url.includes('/assets/');
    const isDataUrl = req.url.startsWith('data:');
    const isBlobUrl = req.url.startsWith('blob:');
    const isFileRequest = /\.(jpg|jpeg|png|gif|svg|webp|bmp|css|js|html|ico|woff|woff2|ttf)$/i.test(req.url);
    
    if (!isApiRequest || isDevServerRequest || isAssetRequest || isDataUrl || isBlobUrl || isFileRequest) {
      console.log('⏭️ Skipping auth for:', req.url);
      console.log('  - isApiRequest:', isApiRequest);
      console.log('  - isDevServerRequest:', isDevServerRequest);
      console.log('  - isAssetRequest:', isAssetRequest);
      console.log('  - isFileRequest:', isFileRequest);
      return next.handle(req);
    }

    // Only add token for verified API requests
    const token = this.authService.getToken();
    console.log('🔑 Token found:', token ? 'YES' : 'NO');

    if (token) {
      // Don't log the full token in production
      console.log('🔑 Token exists, adding to request');
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Added Authorization header for API request:', req.url);
      return next.handle(authReq);
    }

    console.log('❌ No token found, proceeding without auth');
    return next.handle(req);
  }
}