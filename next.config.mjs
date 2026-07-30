/**
 * Configuración en JavaScript plano a propósito: la imagen de producción poda
 * las devDependencies, así que en tiempo de ejecución no hay TypeScript.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Un `next build` lanzado mientras corre `next dev` machaca el .next del
  // servidor de desarrollo y este empieza a devolver 404 en /_next/static.
  // Con esto, `npm run build:check` compila aparte y no lo toca.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Cloudflare Tunnel reescribe la cabecera Host: sin declarar el dominio
    // público, Next rechaza las server actions (el login) por origen inválido.
    serverActions: {
      allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    },
  },
};

export default nextConfig;
