import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthService } from '../core/auth.service'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:40px;background:#0A2416;min-height:100vh;color:#C9A84C;">
      <h1 style="font-size:28px;font-weight:800;color:#fff;">Panel ELITE Nuvia</h1>
      <p style="color:rgba(255,255,255,0.6);margin-top:8px;">Bienvenido, {{ auth.user()?.nombre }}</p>
      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">Rol: {{ auth.user()?.rol }}</p>
      <button
        (click)="auth.logout().subscribe()"
        style="margin-top:24px;padding:10px 24px;background:#C9A84C;color:#0A2416;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;"
      >
        Cerrar sesion
      </button>
    </div>
  `,
})
export class DashboardComponent {
  auth = inject(AuthService)
}
