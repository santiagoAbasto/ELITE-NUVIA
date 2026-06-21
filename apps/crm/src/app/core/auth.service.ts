import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { environment } from '../../environments/environment'
import { tap, catchError, of } from 'rxjs'

export interface AuthUser { userId: string; rol: string; nombre: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(null)
  readonly user = this._user.asReadonly()

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ rol: string; nombre: string }>(
      `${environment.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(tap(() => this.verify().subscribe()))
  }

  verify() {
    return this.http.get<AuthUser>(
      `${environment.apiUrl}/auth/verify`,
      { withCredentials: true }
    ).pipe(
      tap(user => this._user.set(user)),
      catchError(() => { this._user.set(null); return of(null) })
    )
  }

  logout() {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => { this._user.set(null); this.router.navigate(['/ELITE-CRM/ADMIN/login']) }))
  }

  isAuthenticated(): boolean { return this._user() !== null }
}
