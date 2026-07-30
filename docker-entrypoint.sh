#!/bin/sh
set -e

DB_PATH="${DATABASE_URL#file:}"
DB_DIR="$(dirname "$DB_PATH")"

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

echo "→ Arrancando el diario en el puerto ${PORT:-3000}"
exec su-exec diario:nodejs "$@"
