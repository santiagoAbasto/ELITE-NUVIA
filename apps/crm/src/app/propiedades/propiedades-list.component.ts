import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'

interface Propiedad {
  id: string
  slug: string
  titulo: string
  tipo: string
  tipoInmueble: string
  precio: number
  moneda: string
  ciudad: string
  zona: string | null
  activa: boolean
  destacada: boolean
  createdAt: string
  agente: { nombre: string; apellido: string }
  fotos: { urlThumb: string }[]
}

interface PropiedadesResponse {
  data: Propiedad[]
  total: number
  page: number
  totalPages: number
}

@Component({
  selector: 'app-propiedades-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Propiedades</h1>
        <span class="badge">{{ total() }} total</span>
      </div>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Ciudad</th>
                <th>Agente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (p of propiedades(); track p.id) {
                <tr>
                  <td>
                    @if (p.fotos[0]) {
                      <img [src]="p.fotos[0].urlThumb" alt="" class="thumb" />
                    } @else {
                      <div class="thumb-placeholder"></div>
                    }
                  </td>
                  <td>
                    <a [href]="'/propiedades/' + p.slug" target="_blank" class="prop-link">
                      {{ p.titulo }}
                    </a>
                    <div class="prop-meta">{{ p.tipoInmueble }}</div>
                  </td>
                  <td><span class="tipo-badge" [class]="p.tipo.toLowerCase()">{{ p.tipo }}</span></td>
                  <td class="precio">Bs. {{ p.precio | number }}</td>
                  <td>{{ p.ciudad }}{{ p.zona ? ', ' + p.zona : '' }}</td>
                  <td>{{ p.agente.nombre }} {{ p.agente.apellido }}</td>
                  <td>
                    <span class="status-badge" [class.active]="p.activa" [class.inactive]="!p.activa">
                      {{ p.activa ? 'Activa' : 'Inactiva' }}
                    </span>
                    @if (p.destacada) {
                      <span class="dest-badge">★ Destacada</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            @for (p of pages(); track p) {
              <button (click)="goPage(p)" [class.active]="p === page()">{{ p }}</button>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; }
    .page-header { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
    h1 { font-size:24px; font-weight:800; color:#fff; }
    .badge { background:rgba(201,168,76,0.15); color:#C9A84C; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; }
    .loading { color:rgba(255,255,255,0.4); padding:40px; text-align:center; }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; padding:10px 14px; font-size:11px; color:rgba(255,255,255,0.35); font-weight:700; letter-spacing:1.5px; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,0.06); }
    td { padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
    .thumb { width:52px; height:40px; object-fit:cover; border-radius:6px; }
    .thumb-placeholder { width:52px; height:40px; background:#0D3B27; border-radius:6px; }
    .prop-link { color:#fff; font-weight:600; font-size:13.5px; text-decoration:none; }
    .prop-link:hover { color:#C9A84C; }
    .prop-meta { color:rgba(255,255,255,0.35); font-size:11px; margin-top:2px; }
    .tipo-badge { padding:2px 10px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:1px; }
    .tipo-badge.venta { background:#C9A84C; color:#0A2416; }
    .tipo-badge.alquiler { background:#0D3B27; color:#C9A84C; border:1px solid rgba(201,168,76,0.3); }
    .tipo-badge.anticretico { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); }
    .precio { color:#C9A84C; font-weight:700; font-size:13.5px; white-space:nowrap; }
    .status-badge { padding:2px 10px; border-radius:20px; font-size:10px; font-weight:700; }
    .status-badge.active { background:rgba(34,197,94,0.15); color:#22c55e; }
    .status-badge.inactive { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.35); }
    .dest-badge { margin-left:6px; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; background:rgba(201,168,76,0.12); color:#C9A84C; }
    .pagination { display:flex; gap:6px; margin-top:20px; }
    .pagination button { width:34px; height:34px; border-radius:8px; border:none; cursor:pointer; font-size:13px; font-weight:600; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.5); }
    .pagination button.active { background:#C9A84C; color:#0A2416; }
  `]
})
export class PropiedadesListComponent implements OnInit {
  private http = inject(HttpClient)

  propiedades = signal<Propiedad[]>([])
  total = signal(0)
  page = signal(1)
  totalPages = signal(1)
  loading = signal(true)
  pages = signal<number[]>([])

  ngOnInit() { this.load() }

  load() {
    this.loading.set(true)
    this.http.get<PropiedadesResponse>(
      `${environment.apiUrl}/propiedades?page=${this.page()}&pageSize=15`,
      { withCredentials: true }
    ).subscribe({
      next: r => {
        this.propiedades.set(r.data)
        this.total.set(r.total)
        this.totalPages.set(r.totalPages)
        this.pages.set(Array.from({ length: r.totalPages }, (_, i) => i + 1))
        this.loading.set(false)
      },
      error: () => this.loading.set(false)
    })
  }

  goPage(p: number) {
    this.page.set(p)
    this.load()
  }
}
