# Despliegue

Dos contenedores: la aplicación y `cloudflared`. La aplicación **no publica ningún puerto en el
host**; solo la alcanza el túnel por la red interna de Docker. No hay que abrir nada en el
router ni en el cortafuegos.

```
internet ──HTTPS──> Cloudflare ──túnel saliente──> cloudflared ──http://app:3000──> diario
```

## 1. Crear el túnel en Cloudflare

En el panel de Cloudflare Zero Trust:

1. **Networks → Tunnels → Create a tunnel**, tipo **Cloudflared**. Ponle nombre, por ejemplo
   `diario`.
2. Copia el **token** que aparece en el comando de instalación (la cadena larga después de
   `--token`). Es lo que irá en `TUNNEL_TOKEN`.
3. En **Public Hostnames**, añade uno:
   - **Subdomain / Domain**: el que quieras, por ejemplo `diario.tudominio.com`.
   - **Service**: `HTTP` → `app:3000`.

   `app` es el nombre del servicio en `docker-compose.yml`; Docker lo resuelve por DNS dentro de
   la red `diario`. No pongas `localhost`: dentro del contenedor de `cloudflared`, `localhost` es
   el propio `cloudflared`.

## 2. Configurar el servidor

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
TUNNEL_TOKEN="<el token del paso 1>"
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

## 3. Arrancar

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
docker compose logs -f cloudflared
```

### Probar en local sin túnel

Descomenta el bloque `ports` del servicio `app` en `docker-compose.yml` y entra en
`http://localhost:3000`. Ten en cuenta que la cookie de sesión es `secure` en producción, así que
por HTTP plano no se guardará: para pruebas de login usa `npm run dev`.

## Resolución de problemas

| Síntoma | Causa habitual |
| --- | --- |
| El login no responde y el log muestra un error de origen | Falta `ALLOWED_ORIGINS` con el dominio del túnel |
| El contenedor sale con «SESSION_SECRET no está definida» | El `.env` no está o el secreto tiene menos de 32 caracteres |
| `exec /usr/local/bin/docker-entrypoint.sh: no such file or directory` | El `.sh` se ha subido con finales de línea CRLF. Lo evita `.gitattributes`; si ya pasó, `dos2unix docker-entrypoint.sh` |
| Error 502 en el dominio | El *public hostname* del túnel no apunta a `app:3000` |
| La sesión se cierra sola | Cambió `SESSION_SECRET`: invalida todas las cookies emitidas |
