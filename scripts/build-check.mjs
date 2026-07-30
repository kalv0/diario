#!/usr/bin/env node
/**
 * Compila para verificar que todo sigue en pie, sin tocar el .next del
 * servidor de desarrollo: usa un directorio aparte.
 *
 *   npm run build:check
 *
 * Existe como script de Node y no como variable de entorno en línea porque en
 * Windows los scripts de npm corren en cmd.exe, donde `VAR=valor comando` no
 * funciona.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: ".next-check" },
});

process.exit(result.status ?? 1);
