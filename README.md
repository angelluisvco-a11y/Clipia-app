# ClipIA — Proyecto web

Este es el proyecto completo, listo para subir a GitHub y desplegar en Vercel.

## Qué hacer con esta carpeta

1. Sube TODO el contenido de esta carpeta a un repositorio nuevo en GitHub llamado `clipia-app`.
   - En GitHub: "New repository" → nómbralo `clipia-app` → "Create repository".
   - Luego "Add file → Upload files" y arrastra todos los archivos y carpetas de aquí (incluyendo `src/`, `package.json`, `index.html`, `vite.config.js`, `.gitignore`).
2. Ve a **vercel.com**, conecta tu cuenta de GitHub, importa el repositorio `clipia-app`.
3. Vercel detecta automáticamente que es un proyecto Vite — no cambies ninguna configuración, solo dale clic en **"Deploy"**.
4. En un par de minutos te da una URL pública (ej. `https://clipia-app.vercel.app`) — esa es la que usarás en PWABuilder (Paso 3 de la guía) para convertirla en app de Android.

## Nota importante sobre el generador de guion

El botón "Generar video" llama a la API de Claude directamente desde el navegador (`https://api.anthropic.com/v1/messages`) sin usar ninguna clave — esto funciona dentro del entorno de prototipo de Claude.ai, pero **no funcionará igual una vez la app esté desplegada de forma independiente en Vercel**, porque ahí sí se necesita una clave de API real conectada a una cuenta de pago tuya.

Cuando lleguemos a esa parte del proyecto (conectar el backend real), te explico cómo obtener y proteger tu propia clave de API sin exponerla en el código público.
