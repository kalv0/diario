# Diario de emociones

Diario personal para registrar entradas emocionales: de dónde nace cada emoción (una situación
externa o un pensamiento interno), qué la desencadenó, qué se sintió, qué se pensó, cómo se
respondió y qué se ve después con perspectiva. Web responsive *mobile first*, con acceso por usuario y contraseña, pensada
para correr en Docker en un servidor propio y salir a internet por un túnel de Cloudflare.

La pantalla principal reparte el histórico en tres franjas verticales —positivas arriba,
ambiguas en medio, negativas abajo— con las emociones representadas como burbujas en
movimiento cuyo tamaño depende de cuántas veces aparecen.

---

## Puesta en marcha en local

```bash
npm install
cp .env.example .env      # y edita SESSION_SECRET
npm run dev
```

La primera vez, `npm run dev` crea el SQLite y sincroniza las tablas. Después crea tu cuenta:

```bash
npm run user:create -- raul micontraseña "Raúl"
```

Y entra en <http://localhost:3000>. La demo pública, sin cuenta, está en `/demo`.

> Genera un `SESSION_SECRET` propio con
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
> Si es más corto de 32 caracteres la aplicación se niega a arrancar.

## Despliegue

```bash
cp .env.example .env       # SESSION_SECRET, ALLOWED_ORIGINS y TUNNEL_TOKEN
docker compose up -d --build
docker compose exec app node scripts/create-user.mjs raul micontraseña "Raúl"
```

El paso a paso completo del túnel de Cloudflare está en
[docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

## Documentación

| Documento | Qué contiene |
| --- | --- |
| [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md) | Qué hace cada pantalla, con las reglas de negocio exactas |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, modelo de datos, flujo de datos y mapa de ficheros |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) | Docker, túnel de Cloudflare, copias de seguridad y actualizaciones |
| [docs/DECISIONES.md](docs/DECISIONES.md) | Decisiones tomadas y por qué, incluidas las que se consultaron |
| [CLAUDE.md](CLAUDE.md) | Convenciones del repo para seguir trabajando con Claude Code |

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el 3000 |
| `npm run build` | Compilación de producción (escribe en `.next`) |
| `npm run build:check` | Compila en `.next-check` para verificar sin romper el `npm run dev` en marcha |
| `npm start` | Sirve la compilación |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run user:create -- <usuario> <contraseña> ["Nombre"]` | Alta o cambio de contraseña |
| `npm run user:list` | Cuentas existentes y cuántos registros tiene cada una |
| `npm run db:push` | Aplica el esquema de Prisma al SQLite |

## Cuentas

No hay registro público, es deliberado: las cuentas se crean con `user:create`. La demo
enseña un CTA discreto («Obtener cuenta») que abre un aviso indicando que hay que pedirla
por correo a **raul@calvo.cc**.
