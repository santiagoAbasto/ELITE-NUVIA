import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'

interface Lead {
  id: string
  nombre: string
  email: string | null
  telefono: string
  mensaje: string | null
  estado: string
  createdAt: string
  propiedad: { slug: string; titulo: string } | null
  agente: { nombre: string; apellido: string } | null
}

const ESTADOS = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO']
const ESTADO_COLORS: Record<string, string> = {
  NUEVO: '#3b82f6', EN_CONTACTO: '#f59e0b', INTERESADO: '#8b5cf6',
  NEGOCIACION: '#C9A84C', CERRADO: '#22c55e', PERDIDO: '#ef4444',
}

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Consultas / Leads</h1>
        <span class="badge">{{ total() }} total</span>
      </div>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Contacto</th>
                <th>Propiedad</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (lead of leads(); track lead.id) {
                <tr>
                  <td class="date">{{ lead.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                  <td>
                    <div class="contact-name">{{ lead.nombre }}</div>
                    <a [href]="'tel:' + lead.telefono" class="contact-tel">{{ lead.telefono }}</a>
                    @if (lead.email) {
                      <div class="contact-email">{{ lead.email }}</div>
                    }
                  </td>
                  <td>
                    @if (lead.propiedad) {
                      <a [href]="'/propiedades/' + lead.propiedad.slug" target="_blank" class="prop-link">
                        {{ lead.propiedad.titulo }}
                      </a>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td class="mensaje">{{ lead.mensaje || '—' }}</td>
                  <td>
                    <select
                      [value]="lead.estado"
                      (change)="updateEstado(lead.id, $event)"
                      class="estado-select"
                      [style.color]="ESTADO_COLORS[lead.estado]"
                    >
                      @for (e of ESTADOS; track e) {
                        <option [value]="e" [style.color]="ESTADO_COLORS[e]">{{ e }}</option>
                      }
                    </select>
                  </td>
                  <td>
                    <a
                      [href]="'https://wa.me/' + lead.telefono.replace(/\\D/g, '') + '?text=' + waMsg(lead)"
                      target="_blank"
                      class="wa-btn"
                    >
                      WhatsApp
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding:32px; }
    .page-header { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
    h1 { font-size:24px; font-weight:800; color:#fff; }
    .badge { background:rgba(201,168,76,0.15); color:#C9A84C; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; }
    .loading { color:rgba(255,255,255,0.4); padding:40px; text-align:center; }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; padding:10px 14px; font-size:11px; color:rgba(255,255,255,0.35); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,0.06); }
    td { padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:top; font-size:13px; }
    .date { color:rgba(255,255,255,0.35); font-size:11.5px; white-space:nowrap; }
    .contact-name { color:#fff; font-weight:600; }
    .contact-tel { color:#C9A84C; font-size:12px; display:block; }
    .contact-email { color:rgba(255,255,255,0.35); font-size:11.5px; }
    .prop-link { color:rgba(255,255,255,0.7); text-decoration:none; font-size:12.5px; }
    .prop-link:hover { color:#C9A84C; }
    .text-muted { color:rgba(255,255,255,0.2); }
    .mensaje { color:rgba(255,255,255,0.5); font-size:12.5px; max-width:200px; }
    .estado-select { background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer; }
    .wa-btn { background:#25D366; color:#fff; padding:4px 12px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap; }
  `]
})
export class LeadsListComponent implements OnInit {
  private http = inject(HttpClient)

  leads = signal<Lead[]>([])
  total = signal(0)
  loading = signal(true)

  ESTADOS = ESTADOS
  ESTADO_COLORS = ESTADO_COLORS

  ngOnInit() {
    this.http.get<{ data: Lead[]; total: number }>(
      `${environment.apiUrl}/leads?pageSize=50`,
      { withCredentials: true }
    ).subscribe({
      next: r => { this.leads.set(r.data); this.total.set(r.total); this.loading.set(false) },
      error: () => this.loading.set(false)
    })
  }

  updateEstado(id: string, event: Event) {
    const estado = (event.target as HTMLSelectElement).value
    this.http.patch(`${environment.apiUrl}/leads/${id}/estado`, { estado }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.leads.update(leads => leads.map(l => l.id === id ? { ...l, estado } : l))
        }
      })
  }

  waMsg(lead: Lead) {
    const prop = lead.propiedad ? ` sobre "${lead.propiedad.titulo}"` : ''
    return encodeURIComponent(`Hola ${lead.nombre}, soy de ELITE Nuvia. Te contacto${prop}.`)
  }
}
