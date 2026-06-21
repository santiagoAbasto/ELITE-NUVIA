import { Component, inject } from '@angular/core'
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
    .login-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0A2416; }
    .login-card { background:#111; border:1px solid rgba(201,168,76,0.2); border-radius:16px; padding:40px; width:380px; }
    .logo { text-align:center; margin-bottom:32px; }
    .elite { font-size:28px; font-weight:800; color:#fff; letter-spacing:4px; display:block; }
    .nuvia { font-size:18px; font-style:italic; color:#C9A84C; display:block; margin-top:2px; }
    .subtitle { font-size:11px; color:rgba(255,255,255,0.4); margin-top:8px; letter-spacing:2px; text-transform:uppercase; }
    form { display:flex; flex-direction:column; gap:16px; }
    mat-form-field { width:100%; }
    button[mat-raised-button] { background:#C9A84C !important; color:#0A2416 !important; font-weight:700; height:48px; }
    .error-msg { color:#f87171; font-size:13px; text-align:center; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder)
  private auth = inject(AuthService)
  private router = inject(Router)

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })
  loading = false
  error = ''

  submit() {
    if (this.form.invalid) return
    this.loading = true
    this.error = ''
    const { email, password } = this.form.value
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/ELITE-CRM/ADMIN/dashboard']),
      error: (e: { error?: { message?: string } }) => {
        this.error = e.error?.message ?? 'Error al iniciar sesion'
        this.loading = false
      },
    })
  }
}
