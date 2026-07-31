# Despliegue

Un solo contenedor, enganchado a la red Docker externa **`cloudflare`**, donde ya corre el
`cloudflared` del servidor. El diario **no publica ningún puerto en el host**: solo se llega a él
desde esa red. No hay que abrir nada en el router ni en el cortafuegos.

```
internet ──HTTPS──> Cloudflare ──túnel saliente──> cloudflared ──http://diario:1312──> diario
                                                   └──────── red `cloudflare` ────────┘
```

El túnel no es cosa de este compose: se gestiona aparte, junto al resto de servicios que ya
expone el servidor.

## 1. Configurar el servidor

```bash
git clone https://github.com/kalv0/diario.git
cd diario
cp .env.example .env
cp .users.example .users
```

Edita `.env`:

```dotenv
SESSION_SECRET="<pega aquí una cadena larga y aleatoria>"
SESSION_DAYS="30"
ALLOWED_ORIGINS="diario.tudominio.com"
```

Genera el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`ALLOWED_ORIGINS` no es opcional: Cloudflare reescribe la cabecera `Host` y, sin declarar el
dominio, Next rechaza las *server actions* por no coincidir el origen. El síntoma es un login que
no hace nada.

`DATABASE_URL` no se toca: dentro del contenedor siempre es `file:/data/diario.db`.

Y edita `.users`, que es de donde salen las cuentas:

```dotenv
raul:una-contraseña-larga:Raúl
alvaro:otra-contraseña-larga:Álvaro
```

Ninguno de los dos ficheros se sube al repositorio: los dos están en `.gitignore` porque
contienen secretos. Viven solo en el servidor.

## 2. Arrancar

La red `cloudflare` tiene que existir antes; normalmente ya la ha creado el compose del túnel.
Para comprobarlo, y crearla si hiciera falta:

```bash
docker network ls | grep cloudflare
docker network create cloudflare   # solo si no aparece
```

Y ya:

```bash
docker compose up -d --build
docker compose logs -f app
```

En cada arranque el entrypoint, por este orden:

1. Comprueba que `SESSION_SECRET` existe y tiene al menos 32 caracteres.
2. Da permisos del volumen al usuario sin privilegios del contenedor.
3. Ejecuta `prisma db push` para crear o actualizar las tablas. Sobre un esquema que ya coincide
   no hace nada.
4. Sincroniza las cuentas desde `.users`.

Si falta `.users` o tiene errores de formato, el contenedor **no arranca** y dice por qué: es
preferible a quedarse en pie con un diario al que nadie puede entrar.

## 3. Exponerlo por el túnel

En el *public hostname* del túnel de Cloudflare, apunta el dominio a:

```
HTTP → diario:1312
```

`diario` es el `container_name` del servicio, y Docker lo resuelve por DNS dentro de la red
`cloudflare`. **No pongas `localhost`**: dentro del contenedor de `cloudflared`, `localhost` es el
propio `cloudflared`, no el diario.

El dominio que pongas ahí tiene que coincidir con `ALLOWED_ORIGINS` del `.env`.

Ya se puede entrar en `https://diario.tudominio.com`.

## 4. Administrar las cuentas

No hay registro público. Las cuentas se administran **solo** desde el fichero `.users` del
servidor. Para dar de alta a alguien, cambiar una contraseña o corregir un nombre: se edita el
fichero y se reinicia.

```bash
nano .users
docker compose restart app
docker compose logs app | tail -20     # confirma qué hizo con cada cuenta
```

Qué hace la sincronización con lo que encuentra:

| Situación | Qué pasa |
| --- | --- |
| Usuario en `.users` que no existe | Se crea |
| Contraseña o nombre distintos | Se actualizan |
| Usuario en la base de datos que ya no está en `.users` | **Se avisa, pero no se borra** |

Lo último es deliberado: borrar una cuenta se lleva por delante todas sus entradas, y eso no
puede ser un efecto secundario de reiniciar un contenedor. Para borrarla de verdad hay un paso
explícito, con confirmación:

```bash
docker compose exec app node scripts/delete-user.mjs alvaro              # dice qué se borraría
docker compose exec app node scripts/delete-user.mjs alvaro --confirmar  # lo borra
```

Y para ver el estado:

```bash
docker compose exec app node scripts/list-users.mjs
```

---

## Operación

### Copias de seguridad

Todo está en un único fichero SQLite dentro del volumen `diario-data`:

```bash
docker compose exec app sh -c 'node_modules/.bin/prisma db execute --url "file:/data/diario.db" --stdin' <<< "VACUUM INTO '/data/backup.db';"
docker compose cp app:/data/backup.db ./diario-$(date +%F).db
```

`VACUUM INTO` genera una copia consistente con la base de datos en uso, a diferencia de copiar
el fichero directamente. Para una copia rápida con el servicio parado vale con:

```bash
docker compose stop app
docker run --rm -v diario_diario-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/diario-$(date +%F).tar.gz -C /data .
docker compose start app
```

### Actualizar

```bash
git pull
docker compose up -d --build
```

El esquema se sincroniza solo al arrancar. Si un cambio implicara perder datos, `prisma db push`
se detiene y avisa en lugar de ejecutarlo: revisa el log antes de forzar nada.

### Ver los registros

```bash
docker compose logs -f app
```

### Probar en local sin túnel

Descomenta el bloque `ports` del servicio `app` en `docker-compose.yml` y entra en
`http://localhost:1312`. Ten en cuenta que la cookie de sesión es `secure` en producción, así que
por HTTP plano no se guardará: para pruebas de login usa `npm run dev`.

## Resolución de problemas

| Síntoma | Causa habitual |
| --- | --- |
| El login no responde y el log muestra un error de origen | Falta `ALLOWED_ORIGINS` con el dominio del túnel |
| El contenedor sale con «SESSION_SECRET no está definida» | El `.env` no está o el secreto tiene menos de 32 caracteres |
| `network cloudflare declared as external, but could not be found` | La red no existe todavía: `docker network create cloudflare` |
| El contenedor sale diciendo que `.users` es un directorio | No existía en el host y Docker lo creó como carpeta al montarlo. `docker compose down && rmdir .users && cp .users.example .users` |
| `exec /usr/local/bin/docker-entrypoint.sh: no such file or directory` | El `.sh` se ha subido con finales de línea CRLF. Lo evita `.gitattributes`; si ya pasó, `dos2unix docker-entrypoint.sh` |
| Error 502 en el dominio | El *public hostname* del túnel no apunta a `diario:1312` |
| La sesión se cierra sola | Cambió `SESSION_SECRET`: invalida todas las cookies emitidas |
