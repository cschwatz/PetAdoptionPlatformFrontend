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
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Request headers:', req.headers.keys());


    // Check for API requests - handle both absolute and relative URLs
    const isApiRequest = req.url.startsWith('/api/') || req.url.startsWith('http://localhost:8080/api/');
    const isDevServerRequest = req.url.includes('localhost:4200');
    const isAssetRequest = req.url.includes('/assets/');
    const isDataUrl = req.url.startsWith('data:');
    const isBlobUrl = req.url.startsWith('blob:');
    const isFileRequest = /\.(jpg|jpeg|png|gif|svg|webp|bmp|css|js|html|ico|woff|woff2|ttf)$/i.test(req.url);
   
    // Skip auth for login and register endpoints
    const isLoginRequest = req.url.includes('/api/login/') || req.url.includes('/api/register/');
   
    if (!isApiRequest || isDevServerRequest || isAssetRequest || isDataUrl || isBlobUrl || isFileRequest || isLoginRequest) {
      console.log('⏭️ Skipping auth for:', req.url);
      console.log('  - isApiRequest:', isApiRequest);
      console.log('  - isDevServerRequest:', isDevServerRequest);
      console.log('  - isAssetRequest:', isAssetRequest);
      console.log('  - isFileRequest:', isFileRequest);
      console.log('  - isLoginRequest:', isLoginRequest);
      return next.handle(req);
    }


    // Only add token for verified API requests (excluding login/register)
    const token = this.authService.getToken();
    console.log('🔑 Token found:', token ? 'YES' : 'NO');


    if (token) {
      // Don't log the full token in production
      console.log('🔑 Token exists, adding to request for URL:', req.url);
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Added Authorization header for API request:', req.url);
      console.log('✅ Modified request headers:', authReq.headers.keys());
      return next.handle(authReq);
    }


    console.log('❌ No token found, proceeding without auth');
    return next.handle(req);
  }
}