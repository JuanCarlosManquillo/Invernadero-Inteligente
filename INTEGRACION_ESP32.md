# Guía de Integración ESP32 + React Dashboard

Esta guía te ayudará a conectar tu ESP32 (desde PlatformIO) con el dashboard React de Invernadero Inteligente.

## 📋 Paso 1: Verificar el endpoint en ESP32

Asegúrate de que tu código en `main.cpp` tenga este endpoint registrado en `setup()`:

```cpp
// Ruta API REST para obtener estado JSON
server.on("/api/status", HTTP_GET, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.send(200, "application/json", getStatusJson());
});
```

El endpoint debe retornar un JSON con esta estructura:

```json
{
  "light": {
    "luminosity": 1500,
    "mode": "AUTO",
    "isOn": true,
    "threshold": 2500
  },
  "fan": {
    "temperature": 24.5,
    "humidity": 65.2,
    "mode": "AUTO",
    "isOn": false,
    "threshold": 28
  },
  "buzzer": {
    "mode": "AUTO",
    "isOn": false,
    "threshold": 30
  }
}
```

## 🔧 Paso 2: Obtener la IP del ESP32

1. Abre PlatformIO
2. Conecta el ESP32 por USB
3. Abre el monitor serie (Serial Monitor)
4. El ESP32 mostrará su IP algo como: `IP: 192.168.1.100`
5. Anota esta IP

## 📝 Paso 3: Configurar la URL del ESP32 en React

### Opción A: Variables de Entorno (Recomendado)

1. Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y reemplaza la IP:
   ```
   VITE_ESP32_URL=http://192.168.1.100
   ```

### Opción B: Editar directamente en el código

Si prefieres no usar `.env`, edita `src/lib/esp32Config.ts`:

```typescript
export const ESP32_CONFIG = {
  BASE_URL: 'http://192.168.1.100', // Cambiar esto
  POLLING_INTERVAL: 5000,
  GRAPH_MAX_POINTS: 100,
};
```

## 🚀 Paso 4: Ejecutar el proyecto

```bash
# Instalar dependencias
bun install

# Ejecutar en desarrollo
bun run dev
```

El proyecto estará disponible en: `http://localhost:5173`

## 🔌 Paso 5: Conectar y Probar

1. Asegúrate de que el ESP32 esté conectado y ejecutando tu código
2. Abre `http://localhost:5173` en tu navegador
3. El dashboard debería mostrar:
   - Los valores actuales de sensores
   - Estado de los actuadores
   - Botones para control manual
   - Gráficas en tiempo real

## 🐛 Solución de Problemas

### "Desconectado" / Error de conexión

1. **Verifica la IP**: 
   ```bash
   ping 192.168.1.100
   ```

2. **Asegúrate de CORS**: El ESP32 debe enviar estos headers:
   ```cpp
   server.sendHeader("Access-Control-Allow-Origin", "*");
   server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
   ```

3. **Revisa el Serial Monitor** para ver si hay errores en el ESP32

4. **Prueba directamente en el navegador**:
   ```
   http://192.168.1.100/api/status
   ```
   Debería mostrar el JSON directamente

### Las gráficas no aparecen

- Las gráficas se llenan conforme reciben datos (cada 5 segundos)
- Espera 30 segundos para ver el historial

### Los botones no funcionan

1. Verifica que el JSON de respuesta sea válido
2. Revisa la consola del navegador (F12) para mensajes de error
3. Asegúrate de que los endpoints estén registrados en el ESP32:
   - `/api/light/on`
   - `/api/light/off`
   - `/api/fan/on`
   - `/api/fan/off`
   - `/api/buzzer/on`
   - `/api/buzzer/off`
   - `/api/light/threshold?value=2500`
   - `/api/fan/threshold?value=28`

## 📱 Estructura del Dashboard

El dashboard está organizado en 3 pestañas:

### 1. **Sensores** 📊
- Muestra valores actuales de temperatura, humedad y luminosidad
- Estado de los actuadores
- Controles manuales para luz, ventilador y alarma
- Entrada para ajustar umbrales

### 2. **Actuadores** ⚙️
- Control detallado de cada dispositivo
- Botones ON/OFF/AUTO para cada uno
- Configuración de umbrales

### 3. **Gráficas** 📈
- Gráficas históricas de sensores
- Evolución de actuadores en el tiempo
- Últimas 100 mediciones

## 🔄 Cómo funciona

```
ESP32 (PlatformIO)
    ↓
Lee sensores cada 5 seg
    ↓
Expone JSON en /api/status
    ↓
React Dashboard
    ↓
Fetch cada 5 seg
    ↓
Actualiza UI y gráficas
    ↓
Usuario puede controlar actuadores
```

## 📚 Archivos creados

- `src/types/esp32.ts` - Tipos TypeScript para los datos del ESP32
- `src/lib/esp32Config.ts` - Configuración y URL del ESP32
- `src/hooks/useEsp32.ts` - Hook personalizado para obtener datos
- `src/components/Dashboard.tsx` - Componente principal del dashboard
- `src/components/DataChart.tsx` - Componente para gráficas
- `.env.example` - Plantilla de configuración

## 💡 Tips

- **Cambios rápidos**: Si necesitas cambiar la IP sin reiniciar, actualiza `.env.local` y el navegador lo recargaréá automáticamente
- **Desarrollo**: Puedes usar DevTools (F12) para ver las peticiones al ESP32
- **Performance**: Las gráficas están limitadas a 100 puntos para mantener el rendimiento
- **Persistencia**: Los datos se pierden al recargar la página (puedes agregar localStorage si lo necesitas)

## 🎯 Próximos pasos

- [ ] Agregar persistencia con localStorage para gráficas históricas
- [ ] Exportar datos a CSV
- [ ] Configuración guardada en el ESP32 (EEPROM)
- [ ] Notificaciones en tiempo real cuando cruza umbrales
- [ ] Conexión MQTT para control remoto

---

¿Necesitas ayuda? Revisa los logs en la consola del navegador (F12) y el Serial Monitor del ESP32.
