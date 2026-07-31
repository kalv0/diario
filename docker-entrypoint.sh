#!/bin/sh
set -e

DB_PATH="${DATABASE_URL#file:}"
DB_DIR="$(dirname "$DB_PATH")"
USERS_FILE="${USERS_FILE:-/app/.users}"

if [ -z "$SESSION_SECRET" ] || [ ${#SESSION_SECRET} -lt 32 ]; then
  echo "✖ SESSION_SECRET no está definida o tiene menos de 32 caracteres." >&2
  echo "  Genérala con: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"" >&2
  exit 1
fi

# El volumen se monta como root la primera vez: le damos el directorio al
# usuario sin privilegios antes de arrancar.
mkdir -p "$DB_DIR"
chown -R diario:nodejs "$DB_DIR"

# Crea o actualiza las tablas. Sobre un esquema que ya coincide no hace nada.
echo "→ Sincronizando el esquema en $DB_PATH"
su-exec diario:nodejs node_modules/.bin/prisma db push --skip-generate

# Las cuentas se administran en .users, montado desde el host. Sin ese fichero
# no habría forma de entrar, así que paramos en vez de arrancar a medias.
if [ -d "$USERS_FILE" ]; then
  # Docker crea un directorio cuando el origen de un bind mount no existe.
  echo "✖ $USERS_FILE es un directorio, no un fichero." >&2
  echo "  Lo ha creado Docker porque .users no existía en el servidor. Arréglalo con:" >&2
  echo "    docker compose down && rmdir .users && cp .users.example .users" >&2
  exit 1
fi

if [ ! -f "$USERS_FILE" ]; then
  echo "✖ No se encuentra $USERS_FILE." >&2
  echo "  Copia .users.example a .users en el servidor: es de donde salen las cuentas." >&2
  exit 1
fi

echo "→ Sincronizando cuentas desde $USERS_FILE"
# El fichero viene del host con su dueño y sus permisos (lo normal es 600 para
# el usuario que administra el servidor), y dentro del contenedor corremos como
# "diario", que casi nunca coincide en uid. En vez de obligar a aflojar los
# permisos del original —que lleva contraseñas en claro—, copiamos aquí una
# versión legible solo por "diario" y la borramos en cuanto se ha usado.
USERS_TMP="/tmp/.users-sync"
cp "$USERS_FILE" "$USERS_TMP"
chown diario:nodejs "$USERS_TMP"
chmod 600 "$USERS_TMP"
USERS_FILE="$USERS_TMP" su-exec diario:nodejs node scripts/sync-users.mjs
rm -f "$USERS_TMP"

echo "→ Arrancando el diario en el puerto ${PORT:-1312}"
exec su-exec diario:nodejs "$@"
