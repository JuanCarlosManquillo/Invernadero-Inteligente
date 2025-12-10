# 🚀 Quick Start: ESP32 + React Dashboard

## ⚡ 5 Pasos Rápidos para Conectar

### 1️⃣ Obtener la IP del ESP32

En **PlatformIO** (Monitor Serial):
```
[INFO] Conectado a WiFi!
[INFO] IP: 192.168.1.100
```

Anota la IP (ej: `192.168.1.100`)

### 2️⃣ Crear archivo .env.local

En la raíz del proyecto React, crea el archivo `.env.local`:

```bash
# Linux/Mac
cat > .env.local << EOF
VITE_ESP32_URL=http://192.168.1.100
EOF

# PowerShell (Windows)
@"
VITE_ESP32_URL=http://192.168.1.100
"@ | Out-File -Encoding utf8 .env.local
```

**O simplemente copia `.env.example` a `.env.local` y edita la IP**

### 3️⃣ Instalar dependencias

```bash
bun install
# o si usas npm
npm install
```

### 4️⃣ Ejecutar el proyecto

```bash
bun run dev
# o si usas npm
npm run dev
```

Abre: `http://localhost:5173`

### 5️⃣ Verificar conexión

- ✅ Deberías ver "Conectado al ESP32" en verde
- ✅ Los valores de sensores aparecerán en tiempo real
- ✅ Prueba hacer clic en "Encender" para el bombillo

## ❌ Si no funciona...

### Error: "Desconectado"

```bash
# Prueba conectarte directamente en el navegador:
http://192.168.1.100/api/status

# Si no funciona, revisa:
1. El ESP32 está encendido
2. La IP es correcta (verifica en Serial Monitor)
3. Están en la misma WiFi
4. El ESP32 tiene el endpoint /api/status registrado
```

### Error: CORS / Cross-Origin

El ESP32 debe tener estos headers en `main.cpp`:

```cpp
server.on("/api/status", HTTP_GET, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.send(200, "application/json", getStatusJson());
});
```

### Los botones no funcionan

Revisa que estos endpoints existan en el ESP32:
- `GET /api/light/on` → Enciende bombillo
- `GET /api/light/off` → Apaga bombillo
- `GET /api/fan/on` → Enciende ventilador
- `GET /api/fan/off` → Apaga ventilador
- `GET /api/buzzer/on` → Activa alarma
- `GET /api/buzzer/off` → Desactiva alarma

## 📊 ¿Qué puedo ver en el dashboard?

**Pestaña "Sensores":**
- Temperatura actual
- Humedad actual
- Luminosidad (LDR)
- Estado de actuadores
- Controles manuales para cada dispositivo
- Entrada para ajustar umbrales

**Pestaña "Actuadores":**
- Control detallado de ventilador
- Control de sistema de alarma
- Ajuste de umbrales de temperatura

**Pestaña "Gráficas":**
- Histórico de temperatura y humedad
- Histórico de luminosidad
- Histórico de estado de actuadores

## 📝 Estructura JSON esperada

El ESP32 debe retornar este JSON en `/api/status`:

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

## 🎯 Próximos pasos (Opcionales)

- [ ] Configurar WiFi Manager para cambiar SSID/contraseña
- [ ] Agregar persistencia de datos con localStorage
- [ ] Exportar datos a CSV
- [ ] Notificaciones visuales cuando hay alertas
- [ ] Conexión MQTT para control remoto

---

**¿Todavía no funciona?** Abre la consola del navegador (F12) y busca mensajes de error rojo.
