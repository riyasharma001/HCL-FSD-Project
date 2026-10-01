import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notify = inject(NotificationService);
  const token = auth.token();

  let authReq = req;
  // Attach token if present and not calling login
  if (token && !req.url.includes('/login')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // If 401 Unauthorized on protected resource, logout and notify
      if (err.status === 401 && !req.url.includes('/login')) {
        notify.error('Session expired or unauthorized. Please sign in again.');
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
