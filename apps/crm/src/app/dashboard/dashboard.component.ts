import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { AuthService } from '../core/auth.service'

const NAV = [
  { path: '/ELITE-CRM/ADMIN/propiedades', label: 'Propiedades', icon: '🏠' },
  { path: '/ELITE-CRM/ADMIN/leads', label: 'Consultas', icon: '📩' },
]

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">
          <span class="elite">ELITE</span>
          <span class="nuvia">Nuvia</span>
          <div class="role">{{ auth.user()?.rol }}</div>
        </div>
        <nav>
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path" class="nav-item">
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <div class="user-name">{{ auth.user()?.nombre }}</div>
          <button (click)="auth.logout().subscribe()" class="logout-btn">Cerrar sesion</button>
        </div>
      </aside>
      <main class="content">
        <div class="welcome">
          <h1>Bienvenido, {{ firstName() }}</h1>
          <p>Panel de administracion ELITE Nuvia</p>
          <div class="quick-links">
            @for (item of nav; track item.path) {
              <a [routerLink]="item.path" class="quick-card">
                <div class="quick-icon">{{ item.icon }}</div>
                <div class="quick-label">{{ item.label }}</div>
              </a>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display:flex; min-height:100vh; background:#080e09; }
    .sidebar { width:220px; background:#0A2416; border-right:1px solid rgba(201,168,76,0.08); display:flex; flex-direction:column; padding:24px 16px; flex-shrink:0; }
    .logo { margin-bottom:32px; }
    .elite { display:block; font-size:20px; font-weight:800; color:#fff; letter-spacing:4px; }
    .nuvia { display:block; font-size:14px; font-style:italic; color:#C9A84C; margin-top:2px; }
    .role { font-size:9px; color:rgba(255,255,255,0.3); margin-top:4px; letter-spacing:2px; text-transform:uppercase; }
    nav { flex:1; display:flex; flex-direction:column; gap:4px; }
    .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; color:rgba(255,255,255,0.5); font-size:13px; font-weight:500; text-decoration:none; transition:all 0.15s; }
    .nav-item:hover { background:rgba(201,168,76,0.08); color:#fff; }
    .nav-icon { font-size:16px; }
    .sidebar-footer { border-top:1px solid rgba(255,255,255,0.06); padding-top:16px; margin-top:16px; }
    .user-name { color:rgba(255,255,255,0.5); font-size:12px; margin-bottom:8px; }
    .logout-btn { background:none; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:11px; transition:all 0.15s; }
    .logout-btn:hover { border-color:rgba(201,168,76,0.3); color:#C9A84C; }
    .content { flex:1; padding:40px; overflow-y:auto; }
    h1 { font-size:28px; font-weight:800; color:#fff; margin-bottom:4px; }
    p { color:rgba(255,255,255,0.4); font-size:13px; margin-bottom:28px; }
    .quick-links { display:flex; gap:12px; flex-wrap:wrap; }
    .quick-card { display:flex; flex-direction:column; align-items:center; gap:8px; padding:24px 32px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; text-decoration:none; transition:all 0.2s; cursor:pointer; }
    .quick-card:hover { border-color:rgba(201,168,76,0.3); background:rgba(201,168,76,0.04); }
    .quick-icon { font-size:28px; }
    .quick-label { color:rgba(255,255,255,0.6); font-size:13px; font-weight:500; }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService)
  nav = NAV

  firstName() {
    return this.auth.user()?.nombre?.split(' ')[0] ?? ''
  }
}
