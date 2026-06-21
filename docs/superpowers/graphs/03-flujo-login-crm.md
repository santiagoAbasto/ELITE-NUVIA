# Diagrama 3: Flujo de Login CRM

**Proposito:** Traza el proceso completo de autenticacion desde que el usuario llega al login hasta que accede al dashboard, incluyendo todas las capas de seguridad.

---

```mermaid
sequenceDiagram
    actor U as Usuario CRM
    participant B as Navegador<br/>(Angular)
    participant G as AuthGuard<br/>(Angular)
    participant API as POST /api/v1/auth/login<br/>(Express)
    participant RL as Rate Limiter<br/>(express-rate-limit)
    participant DB as PostgreSQL<br/>(via Prisma)
    participant CK as httpOnly Cookie<br/>(Servidor)

    Note over U,CK: Acceso inicial — URL escrita manualmente
    U->>B: Navega a /ELITE-CRM/ADMIN/login
    B->>G: Activar AuthGuard
    G->>CK: Verificar JWT en cookie
    alt Sin JWT valido
        CK-->>G: Sin cookie / expirada
        G->>B: Renderizar LoginComponent
        B->>U: Muestra formulario login
    end

    Note over U,CK: Intento de login
    U->>B: Ingresa email + password
    B->>API: POST /api/v1/auth/login<br/>{ email, password }
    API->>RL: Verificar rate limit (IP)
    alt Limite excedido (>5 intentos/15min)
        RL-->>B: 429 Too Many Requests
        B->>U: "Demasiados intentos. Espera 15 min."
    else Dentro del limite
        RL-->>API: OK, continuar
        API->>DB: SELECT User WHERE email = ?
        DB-->>API: User record (con bcrypt hash)
        API->>API: bcrypt.compare(password, hash)
        alt Password incorrecta
            API-->>B: 401 Unauthorized
            B->>U: "Credenciales invalidas"
        else Password correcta
            API->>API: jwt.sign({ userId, rol }, SECRET, { expiresIn:'8h' })
            API->>API: jwt.sign({ userId }, REFRESH_SECRET, { expiresIn:'30d' })
            API->>CK: Set-Cookie: token=JWT; HttpOnly; Secure; SameSite=Strict
            API->>CK: Set-Cookie: refresh=REFRESH_JWT; HttpOnly; Secure
            API-->>B: 200 OK { rol, nombre }
            B->>B: Angular Router.navigate('/ELITE-CRM/ADMIN/dashboard')
        end
    end

    Note over U,CK: Acceso a ruta protegida
    B->>G: Activar AuthGuard para /dashboard
    G->>API: GET /api/v1/auth/verify (cookie enviada automaticamente)
    API->>CK: Leer httpOnly cookie
    API->>API: jwt.verify(token, SECRET)
    alt JWT valido
        API-->>G: 200 { userId, rol, nombre }
        G->>B: Permitir navegacion
        B->>U: Renderiza Dashboard (segun rol)
    else JWT expirado
        API->>API: jwt.verify(refreshToken, REFRESH_SECRET)
        alt Refresh valido
            API->>CK: Set-Cookie: token=NEW_JWT (rotation)
            API-->>G: 200 { userId, rol }
            G->>B: Permitir navegacion
        else Refresh expirado
            API-->>G: 401 Unauthorized
            G->>B: Router.navigate('/ELITE-CRM/ADMIN/login')
            B->>U: Formulario de login
        end
    end
```

---

## Capas de Seguridad

| Capa | Mecanismo | Configuracion |
|---|---|---|
| **Obscuridad** | Ruta no enlazada, no indexada | `robots.txt: Disallow: /ELITE-CRM/` |
| **Rate Limiting** | Max intentos por IP | 5 req / 15 min en `/api/v1/auth/login` |
| **Password hashing** | bcrypt | 12 salt rounds |
| **JWT Access Token** | httpOnly Secure cookie | Expira en 8 horas |
| **JWT Refresh Token** | httpOnly Secure cookie separada | Expira en 30 dias, rotation en cada uso |
| **SameSite** | Proteccion CSRF | `SameSite=Strict` |
| **Angular AuthGuard** | Verificacion en cada navegacion | Llama `/api/v1/auth/verify` |
| **Express middleware** | Verificacion en cada ruta privada | `verifyJWT()` antes de cualquier handler |
| **Rol RBAC** | Super Admin ve todo, Agente solo lo suyo | `req.user.rol` en cada handler |
