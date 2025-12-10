# 🔧 Comandos Útiles

## 📦 Instalación y Setup

```bash
# Instalar todas las dependencias
bun install
# o con npm
npm install

# Asegúrate de tener recharts
bun add recharts
npm install recharts
```

## 🚀 Desarrollo

```bash
# Ejecutar en modo desarrollo
bun run dev
# o
npm run dev

# El sitio estará en: http://localhost:5173
```

## 🏗️ Build para Producción

```bash
# Compilar TypeScript y construir
bun run build
# o
npm run build

# Preview del build
bun run preview
# o
npm run preview
```

## 🔍 Linting

```bash
# Revisar errores de lint
bun run lint
# o
npm run lint
```

## 🧪 Pruebas al ESP32

### Desde el Navegador

```bash
# Reemplaza 192.168.1.100 con tu IP del ESP32

# Obtener estado
http://192.168.1.100/api/status

# Encender bombillo
http://192.168.1.100/api/light/on

# Apagar bombillo
http://192.168.1.100/api/light/off
```

### Desde Terminal (PowerShell Windows)

```powershell
# GET status
$response = Invoke-WebRequest -Uri "http://192.168.1.100/api/status"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# GET light/on
Invoke-WebRequest -Uri "http://192.168.1.100/api/light/on"

# Probar conexión
Test-NetConnection -ComputerName 192.168.1.100 -Port 80
```

### Desde Terminal (Linux/Mac - bash/zsh)

```bash
# GET status
curl http://192.168.1.100/api/status | jq '.'

# GET light/on
curl http://192.168.1.100/api/light/on

# Usar jq para formatear JSON
curl -s http://192.168.1.100/api/status | jq '.fan.temperature'

# Probar ping
ping -c 1 192.168.1.100
```

## 🐛 Debugging

### Abrir DevTools
```
Presionar F12 en el navegador
```

### Ver Logs de Fetch
En la consola del navegador:
```javascript
// Verás los logs de todas las peticiones al ESP32
```

### Monitorear Red
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Ve las peticiones a `/api/status`, etc.

## 📝 Configuración

### Cambiar IP del ESP32

**Opción 1: Variable de Entorno**
```bash
# Edita .env.local
VITE_ESP32_URL=http://192.168.x.x
```

**Opción 2: Código (si no quieres usar .env)**
```typescript
// En src/lib/esp32Config.ts
BASE_URL: 'http://192.168.x.x',
```

## 🔐 Certificados (Para HTTPS en ESP32)

Si el ESP32 usa HTTPS:
```typescript
// En src/lib/esp32Config.ts
BASE_URL: 'https://192.168.1.100',
```

Nota: Necesitarás resolver el problema de certificados autofirmados.

## 📊 Verificar Versiones

```bash
# Node.js version
node --version

# npm version
npm --version

# Bun version
bun --version
```

## 🌍 Variables de Entorno Disponibles

```
VITE_ESP32_URL      - URL del ESP32 (ej: http://192.168.1.100)
VITE_*              - Cualquier variable que comience con VITE_ 
                      está disponible en el código
```

## 📚 Útiles para Desarrollo

### Hot Reload
El proyecto soporta HMR (Hot Module Replacement):
- Edita un archivo
- Se guarda automáticamente
- El navegador se actualiza sin perder estado

### TypeScript Strict Mode
El proyecto usa modo strict de TypeScript para mejor type-safety.

### Prettier / ESLint
```bash
# Formatear código
npx prettier --write src/

# Revisar linting
npm run lint
```

## 🔄 Workflow Típico

```bash
# 1. Clona/descarga el proyecto
cd invernadero-inteligente

# 2. Instala dependencias
bun install

# 3. Configura la IP del ESP32
# Edita .env.local o crea desde .env.example
cp .env.example .env.local
# Edita .env.local con tu IP

# 4. Inicia desarrollo
bun run dev

# 5. Abre en navegador
# http://localhost:5173

# 6. Haz cambios en el código
# El navegador se actualiza automáticamente

# 7. Cuando termines
# Ctrl+C para detener el servidor
```

## 📡 Prueba de Conectividad

```bash
# PowerShell (Windows)
Test-NetConnection -ComputerName 192.168.1.100 -Port 80

# Linux/Mac
ping 192.168.1.100
nc -zv 192.168.1.100 80
```

## 🆘 Problemas Comunes

### "Port 5173 already in use"
```bash
# En Windows
netstat -ano | findstr :5173

# En Linux/Mac
lsof -i :5173

# Mata el proceso
# O usa un puerto diferente
bun run dev -- --port 3000
```

### "Cannot find module"
```bash
# Limpia node_modules y reinstala
rm -rf node_modules
bun install

# En Windows
rmdir /s /q node_modules
bun install
```

### Error de TypeScript
```bash
# Verifica errores de tipos
npx tsc --noEmit

# Compila para detectar errores
npm run build
```

## 🎯 Checklist de Deploy

```
[ ] .env.local configurado con IP correcta
[ ] npm install ejecutado
[ ] npm run build completa sin errores
[ ] npm run dev funciona en localhost:5173
[ ] ESP32 responde en http://192.168.1.100/api/status
[ ] Dashboard muestra "Conectado"
[ ] Botones de control funcionan
```

## 📚 Recursos Útiles

### Documentación Oficial
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Recharts: https://recharts.org
- Tailwind: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com

### En tu Proyecto
- `QUICK_START.md` - Empezar rápido
- `INTEGRACION_ESP32.md` - Guía detallada
- `ESP32_CODE_REFERENCE.md` - Referencia ESP32
- `VISUALIZACION.md` - Cómo se ve

## 🚀 Next Steps

1. Configurar IP del ESP32
2. Instalar dependencias
3. Ejecutar `bun run dev`
4. Abrir `http://localhost:5173`
5. ¡Disfrutar del dashboard!

---

**Tip:** Guarda estos comandos en un archivo `Makefile` o `package.json` script para acceso rápido.
