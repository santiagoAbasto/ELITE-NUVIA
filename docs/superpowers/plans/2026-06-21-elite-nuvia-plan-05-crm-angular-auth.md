# ELITE Nuvia — Plan 05: Auth JWT + CRM Angular (estructura base)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Implementar el sistema de autenticacion JWT completo (login, refresh, logout, verify) en el API Express, y crear la estructura base del CRM Angular en `/ELITE-CRM/ADMIN/` con AuthGuard, routing protegido y el formulario de login.

**Architecture:** Ver `docs/superpowers/graphs/03-flujo-login-crm.md` para el sequence diagram completo del flujo de autenticacion. JWT en httpOnly cookies. Angular AuthGuard verifica el JWT en cada navegacion. Rate limiter en el endpoint de login.

**Tech Stack:** jsonwebtoken + bcryptjs + express-rate-limit (API) | Angular 17 + Angular Material + Angular Router con guards (CRM)

---

## Referencia: Flujo de Autenticacion

Ver: `docs/superpowers/graphs/03-flujo-login-crm.md`

Resumen: Usuario → `/ELITE-CRM/ADMIN/login` → POST `/api/v1/auth/login` → JWT httpOnly cookie → redirect a `/dashboard` → AuthGuard en cada ruta protegida.

---

### Task 1: Auth middleware y rate limiter

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/rateLimiter.ts`
- Create: `apps/api/src/routes/auth.ts`

- [ ] **Step 1: Crear middleware/rateLimiter.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                      // max 5 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'Demasiados intentos de login. Espera 15 minutos.', statusCode: 429 },
  keyGenerator: (req) => req.ip ?? 'unknown',
})
```

- [ ] **Step 2: Crear middleware/auth.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthPayload } from '@elite/types'

declare global {
  namespace Express {
    interface Request { user?: AuthPayload }
  }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token no encontrado', statusCode: 401 })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.clearCookie('token')
    res.status(401).json({ error: 'Unauthorized', message: 'Token invalido o expirado', statusCode: 401 })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Forbidden', message: 'Sin permisos suficientes', statusCode: 403 })
      return
    }
    next()
  }
}
```

- [ ] **Step 3: Crear routes/auth.ts**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/routes/auth.ts
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { loginRateLimiter } from '../middleware/rateLimiter.js'
import { verifyJWT } from '../middleware/auth.js'
import type { AuthPayload } from '@elite/types'

export const authRouter = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

authRouter.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) {
      res.status(400).json({ error: 'Bad Request', message: 'Email y password requeridos', statusCode: 400 })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { agente: { select: { nombre: true, apellido: true } } },
    })

    if (!user || !user.activo) {
      res.status(401).json({ error: 'Unauthorized', message: 'Credenciales invalidas', statusCode: 401 })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Unauthorized', message: 'Credenciales invalidas', statusCode: 401 })
      return
    }

    const nombre = user.agente
      ? `${user.agente.nombre} ${user.agente.apellido}`
      : 'Administrador'

    const payload: AuthPayload = { userId: user.id, rol: user.rol, nombre }

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
    const refresh = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })

    res.cookie('token', token, { ...COOKIE_OPTS, maxAge: 8 * 60 * 60 * 1000 })
    res.cookie('refresh', refresh, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })

    res.json({ rol: user.rol, nombre })
  } catch (err) { next(err) }
})

authRouter.get('/verify', verifyJWT, (req, res) => {
  res.json(req.user)
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh as string | undefined
    if (!refreshToken) { res.status(401).json({ error: 'Unauthorized', message: 'Sin refresh token', statusCode: 401 }); return }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, activo: true },
      include: { agente: { select: { nombre: true, apellido: true } } },
    })
    if (!user) { res.status(401).json({ error: 'Unauthorized', message: 'Usuario no encontrado', statusCode: 401 }); return }

    const nombre = user.agente ? `${user.agente.nombre} ${user.agente.apellido}` : 'Administrador'
    const payload: AuthPayload = { userId: user.id, rol: user.rol, nombre }
    const newToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
    const newRefresh = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })

    res.cookie('token', newToken, { ...COOKIE_OPTS, maxAge: 8 * 60 * 60 * 1000 })
    res.cookie('refresh', newRefresh, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.json({ rol: user.rol, nombre })
  } catch {
    res.clearCookie('token')
    res.clearCookie('refresh')
    res.status(401).json({ error: 'Unauthorized', message: 'Refresh token invalido', statusCode: 401 })
  }
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE_OPTS)
  res.clearCookie('refresh', COOKIE_OPTS)
  res.json({ message: 'Sesion cerrada' })
})
```

- [ ] **Step 4: Registrar rutas auth en app.ts**

Agregar en `apps/api/src/app.ts` despues de los routers existentes:

```typescript
import { authRouter } from './routes/auth.js'
// ...
app.use('/api/v1/auth', authRouter)
```

- [ ] **Step 5: Verificar login funciona**

```bash
cd /Users/user/Desktop/ELITE/apps/api && pnpm dev &
sleep 2

# Login correcto
curl -s -c /tmp/elite-cookies.txt -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@elitenuvia.bo","password":"Admin123!"}' | python3 -m json.tool
# Expected: {"rol":"SUPER_ADMIN","nombre":"Administrador"}

# Verify con cookie
curl -s -b /tmp/elite-cookies.txt http://localhost:8080/api/v1/auth/verify | python3 -m json.tool
# Expected: {"userId":"...","rol":"SUPER_ADMIN","nombre":"Administrador"}

# Login incorrecto
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@elitenuvia.bo","password":"wrong"}' | python3 -m json.tool
# Expected: {"error":"Unauthorized","message":"Credenciales invalidas","statusCode":401}
```

- [ ] **Step 6: Commit**

```bash
kill %1 2>/dev/null
cd /Users/user/Desktop/ELITE
git add apps/api/src/middleware/ apps/api/src/routes/auth.ts
git commit -m "feat: add JWT auth with rate limiter, refresh token rotation, httpOnly cookies"
```

---

### Task 2: Angular CRM — Estructura base

**Files:**
- Create: `apps/crm/` (Angular project)

- [ ] **Step 1: Crear proyecto Angular**

```bash
cd /Users/user/Desktop/ELITE/apps
npx @angular/cli@17 new crm \
  --routing=true \
  --style=scss \
  --skip-git=true \
  --skip-tests=false \
  --package-manager=pnpm
```

Al prompt de SSR: `No`

- [ ] **Step 2: Agregar Angular Material**

```bash
cd /Users/user/Desktop/ELITE/apps/crm
npx ng add @angular/material --skip-confirmation
```

Elegir: `Custom theme` + `Typography: No` + `Animations: Include`

- [ ] **Step 3: Crear environment con base URL**

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
}
```

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api/v1',
}
```

- [ ] **Step 4: Crear AuthService**

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/app/core/auth.service.ts
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
```

- [ ] **Step 5: Crear AuthGuard**

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/app/core/auth.guard.ts
import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from './auth.service'
import { map, tap } from 'rxjs'

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  if (auth.isAuthenticated()) return true
  return auth.verify().pipe(
    map(user => !!user),
    tap(ok => { if (!ok) router.navigate(['/ELITE-CRM/ADMIN/login']) })
  )
}
```

- [ ] **Step 6: Crear LoginComponent**

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/app/login/login.component.ts
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { AuthService } from '../core/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <span class="elite">ELITE</span>
          <span class="nuvia">Nuvia</span>
          <div class="subtitle">Panel de Administracion</div>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Contrasena</mat-label>
            <input matInput formControlName="password" type="password" autocomplete="current-password">
          </mat-form-field>
          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }
          <button mat-raised-button type="submit" [disabled]="loading || form.invalid">
            @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
            @else { Ingresar }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container { min-height: 100vh; display:flex; align-items:center; justify-content:center; background:#0A2416; }
    .login-card { background:#111; border:1px solid rgba(201,168,76,0.2); border-radius:16px; padding:40px; width:380px; }
    .logo { text-align:center; margin-bottom:32px; }
    .elite { font-size:28px; font-weight:800; color:#fff; letter-spacing:4px; display:block; }
    .nuvia { font-size:18px; font-style:italic; color:#C9A84C; display:block; margin-top:2px; }
    .subtitle { font-size:11px; color:rgba(255,255,255,0.4); margin-top:8px; letter-spacing:2px; text-transform:uppercase; }
    form { display:flex; flex-direction:column; gap:16px; }
    mat-form-field { width:100%; }
    button { background:#C9A84C !important; color:#0A2416 !important; font-weight:700; height:48px; }
    .error-msg { color:#f87171; font-size:13px; text-align:center; }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })
  loading = false
  error = ''

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return
    this.loading = true
    this.error = ''
    const { email, password } = this.form.value
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/ELITE-CRM/ADMIN/dashboard']),
      error: (e) => { this.error = e.error?.message ?? 'Error al iniciar sesion'; this.loading = false },
    })
  }
}
```

- [ ] **Step 7: Configurar routes de Angular con base href**

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/app/app.routes.ts
import { Routes } from '@angular/router'
import { authGuard } from './core/auth.guard'

export const routes: Routes = [
  {
    path: 'ELITE-CRM/ADMIN/login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'ELITE-CRM/ADMIN/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'ELITE-CRM/ADMIN',
    redirectTo: 'ELITE-CRM/ADMIN/dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'ELITE-CRM/ADMIN/login',
    pathMatch: 'full',
  },
]
```

- [ ] **Step 8: Crear DashboardComponent placeholder**

```typescript
// /Users/user/Desktop/ELITE/apps/crm/src/app/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core'
import { AuthService } from '../core/auth.service'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div style="padding:40px;background:#0A2416;min-height:100vh;color:#C9A84C;">
      <h1 style="font-size:28px;font-weight:800;">Dashboard ELITE Nuvia</h1>
      <p>Bienvenido, {{ auth.user()?.nombre }}</p>
      <p>Rol: {{ auth.user()?.rol }}</p>
      <button (click)="auth.logout().subscribe()" style="margin-top:20px;padding:8px 20px;background:#C9A84C;color:#0A2416;border:none;border-radius:6px;cursor:pointer;">
        Cerrar sesion
      </button>
    </div>
  `,
})
export class DashboardComponent {
  auth = inject(AuthService)
}
```

- [ ] **Step 9: Agregar paquete CRM a pnpm workspace y update package.json con script dev**

```bash
# Agregar script dev al package.json del CRM si no existe
cd /Users/user/Desktop/ELITE/apps/crm
# verificar que pnpm dev funciona
pnpm start &
sleep 5
curl -s http://localhost:4200 | head -5
kill %1
```

Expected: HTML del Angular app

- [ ] **Step 10: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/crm/
git commit -m "feat: add Angular CRM with JWT auth, AuthGuard, login form and dashboard placeholder"
```
