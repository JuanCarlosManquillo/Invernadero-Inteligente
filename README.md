# Invernadero Inteligente

Descripción breve
- Frontend construido con React + Vite + TypeScript. Muestra datos de sensores, gráficas y controles para actuadores del invernadero. La app se monta en src/main.tsx y usa rutas en src/pages.

Cómo funciona (resumen técnico)
- Vite sirve y empaqueta la aplicación.
- React organiza la UI en componentes dentro de `src/`.
- React Query (@tanstack/react-query) gestiona la obtención/caché de datos.
- Rutas con react-router-dom (src/pages/Index.tsx, NotFound.tsx).
- Configuración de dev: `vite.config.ts` (servidor en el puerto 8080 por defecto).
- Variables expuestas al cliente deben empezar con `VITE_` y se acceden vía `import.meta.env`.

Requisitos
- Node.js 18 o superior
- npm (incluido con Node.js)
- Git (para clonar)

Comandos básicos (Windows — PowerShell / CMD)

1) Clonar el repositorio
PowerShell o CMD:
```bash
git clone https://github.com/JuanCarlosManquillo/Invernadero-Inteligente.git
cd "Invernadero-Inteligente"
```

2) Comprobar versiones (opcional)
PowerShell / CMD:
```bash
node -v
npm -v
```

3) Instalar dependencias
PowerShell / CMD:
```bash
npm i
# o para instalación reproducible en CI:
# npm ci
```

4) Ejecutar en modo desarrollo (hot-reload)
PowerShell / CMD:
```bash
npm run dev
```
- Por defecto el servidor escucha en el puerto 8080 (ver `vite.config.ts`). Abrir: http://localhost:8080

5) Generar build de producción (solo si lo necesitas)
PowerShell / CMD:
```bash
npm run build
```

Instalar librerías nuevas
- Dependencia de producción:
```bash
npm i nombre-paquete
```
- Dependencia de desarrollo:
```bash
npm i -D nombre-paquete
```

Archivos y carpetas clave
- src/ — código fuente (componentes, pages, hooks)
- index.html — punto de entrada HTML
- public/ — assets estáticos
- vite.config.ts — configuración de Vite (alias `@` apuntando a `./src`, servidor en puerto 8080)
- package.json — scripts: `dev`, `build`, `preview`
- .gitignore — ya excluye `node_modules`, `dist`, `.env`, etc.

Scripts disponibles (ejecutar en la raíz del proyecto)
- npm i — instalar dependencias
- npm run dev — iniciar servidor de desarrollo
- npm run build — compilar para producción
- npm run preview — servir localmente el `dist` (si está configurado)
