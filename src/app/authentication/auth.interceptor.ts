import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiRequest = req.url.startsWith('/api/') || req.url.startsWith('http://localhost:8080/api/');
    const isDevServerRequest = req.url.includes('localhost:4200');
    const isAssetRequest = req.url.includes('/assets/');
    const isDataUrl = req.url.startsWith('data:');
    const isBlobUrl = req.url.startsWith('blob:');
    const isFileRequest = /\.(jpg|jpeg|png|gif|svg|webp|bmp|css|js|html|ico|woff|woff2|ttf)$/i.test(req.url);

    const isLoginRequest = req.url.includes('/api/login/') || req.url.includes('/api/register/');
   
    if (!isApiRequest || isDevServerRequest || isAssetRequest || isDataUrl || isBlobUrl || isFileRequest || isLoginRequest) {
      return next.handle(req);
    }

    const token = this.authService.getToken();

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}