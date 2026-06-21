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
