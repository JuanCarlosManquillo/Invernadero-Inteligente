# 🆘 Guía de Troubleshooting

## 🔴 Problema: "Conectando con ESP32..." (Indefinidamente)

### Síntomas
- La página muestra "Conectando con ESP32..." 
- No avanza
- Los datos nunca cargan

### Causas Posibles
1. IP del ESP32 es incorrecta
2. ESP32 no está en línea
3. Red WiFi no es accesible
4. Firewall bloqueando conexión
5. CORS no configurado en ESP32

### Soluciones

#### 1. Verificar IP del ESP32
```bash
# En Serial Monitor de PlatformIO, deberías ver algo como:
# IP: 192.168.1.100

# Prueba conectarte directamente:
http://192.168.1.100/api/status
```

#### 2. Verificar que el ESP32 está encendido
```bash
# Intenta ping
ping 192.168.1.100

# PowerShell Windows
Test-NetConnection -ComputerName 192.168.1.100 -Port 80
```

#### 3. Editar .env.local
```bash
# Abre el archivo .env.local en la raíz del proyecto
# Y actualiza:
VITE_ESP32_URL=http://192.168.1.100
```

#### 4. Verificar CORS en ESP32
El ESP32 debe tener estos headers:
```cpp
server.on("/api/status", HTTP_GET, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.send(200, "application/json", getStatusJson());
});
```

#### 5. Limpiar caché del navegador
- Abre DevTools (F12)
- Pestaña "Application" → "Clear storage"
- O usa Ctrl+Shift+Delete

---

## 🔴 Problema: "Desconectado del ESP32"

### Síntomas
- Muestra en rojo "Desconectado"
- Error visible en el dashboard
- Botones no funcionan

### Causas Posibles
1. ESP32 se apagó
2. WiFi del ESP32 cayó
3. IP cambió (DHCP)
4. Incompatibilidad de JSON
5. Endpoint no existe

### Soluciones

#### 1. Revisa Serial Monitor del ESP32
```
¿Muestra conexión a WiFi?
✓ Conectado a WiFi
✓ IP: 192.168.1.100
✓ Servidor web iniciado
```

#### 2. Valida que /api/status retorna JSON válido
```bash
# En navegador
http://192.168.1.100/api/status

# Debería mostrarse como JSON válido
{
  "light": {...},
  "fan": {...},
  "buzzer": {...}
}

# Si muestra error 404, el endpoint no existe
# Si muestra error 500, hay error en el código del ESP32
```

#### 3. Revisa la consola del navegador (F12)
```
Abre Consola (F12)
Busca errores rojos
Ej: "Failed to fetch"
```

#### 4. Reinicia el ESP32
```
- Desconecta USB
- Espera 5 segundos
- Vuelve a conectar
```

---

## 🔴 Problema: Los botones no funcionan

### Síntomas
- Haces clic en "Encender"
- Nada pasa
- Los datos no cambian

### Causas Posibles
1. Endpoint no existe en ESP32
2. Estructura JSON incorrecta
3. Función no implementada en ESP32
4. Error en el código de control

### Soluciones

#### 1. Prueba el endpoint directamente
```bash
# Encender bombillo
http://192.168.1.100/api/light/on

# Debe retornar JSON actualizado
{
  "light": {
    "isOn": true,  ← Debe cambiar a true
    ...
  }
}

# Si da error 404, el endpoint no existe
```

#### 2. Revisa que todos los endpoints existan
En tu `main.cpp` debes tener registrados:
```cpp
server.on("/api/light/on", ...);
server.on("/api/light/off", ...);
server.on("/api/light/auto", ...);
server.on("/api/fan/on", ...);
server.on("/api/fan/off", ...);
server.on("/api/fan/auto", ...);
server.on("/api/buzzer/on", ...);
server.on("/api/buzzer/off", ...);
server.on("/api/buzzer/auto", ...);
server.on("/api/light/threshold", ...);
server.on("/api/fan/threshold", ...);
```

#### 3. Verifica las funciones de control
```cpp
// Estas funciones deben estar implementadas
void setLightOn();
void setLightOff();
void setLightAuto();
void setFanOn();
void setFanOff();
void setFanAuto();
void setBuzzerOn();
void setBuzzerOff();
void setBuzzerAuto();
```

#### 4. Revisa la consola del navegador
```
F12 → Console
Busca errores
Ej: "Error sending action:"
```

---

## 🔴 Problema: Las gráficas están vacías

### Síntomas
- Los gráficos no tienen datos
- Mensajes "Esperando datos del ESP32..."

### Causas Posibles
1. Acabas de abrir la página (necesita tiempo)
2. Los sensores no leen datos
3. Los datos son NaN o inválidos
4. El polling está deshabilitado

### Soluciones

#### 1. Espera 30-60 segundos
Las gráficas se llenan conforme llegan datos.
El polling es cada 5 segundos, así que:
- 1-5 seg: 1 punto
- 6-10 seg: 2 puntos
- ...
- 30 seg: ~6 puntos

#### 2. Revisa que los sensores retornan datos válidos
En el JSON debe haber números válidos:
```json
{
  "light": { "luminosity": 1500 },    ← Debe ser número
  "fan": { "temperature": 24.5 },     ← Debe ser número
  ...
}
```

Si ves `null` o `undefined`, hay problema en los sensores del ESP32.

#### 3. Revisa DataChart.tsx
```typescript
// En src/components/DataChart.tsx
// Verifica que los dataKeys sean correctos
dataKeys={[
  { key: 'temperature', name: 'Temperatura', ... },
  ...
]}
```

#### 4. Abre DevTools y verifica
```
F12 → Network
Busca peticiones a /api/status
Verifica que el JSON tenga números, no null
```

---

## 🔴 Problema: Error CORS

### Síntomas
```
Access to XMLHttpRequest at 'http://192.168.1.100/api/status' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Causa
El ESP32 no envía los headers CORS correctos.

### Solución
En tu `main.cpp`, asegúrate de tener:

```cpp
server.on("/api/status", HTTP_GET, []() {
  // ESTOS HEADERS SON OBLIGATORIOS:
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  
  server.send(200, "application/json", getStatusJson());
});

// También para preflight
server.on("/api/status", HTTP_OPTIONS, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200);
});
```

Repite esto para TODOS los endpoints (`/api/light/*`, `/api/fan/*`, etc.)

---

## 🔴 Problema: JSON inválido

### Síntomas
```
Error: Estructura JSON inválida del ESP32
```

### Causas Posibles
1. Falta alguna propiedad requerida
2. Tipos de datos incorrectos
3. Nombres de propiedades mal escritos

### Solución
Tu JSON DEBE tener exactamente esta estructura:

```json
{
  "light": {
    "luminosity": NUMBER,      ← número
    "mode": "AUTO" o "MANUAL", ← string
    "isOn": true o false,      ← booleano
    "threshold": NUMBER        ← número
  },
  "fan": {
    "temperature": NUMBER,     ← número
    "humidity": NUMBER,        ← número
    "mode": "AUTO" o "MANUAL", ← string
    "isOn": true o false,      ← booleano
    "threshold": NUMBER        ← número
  },
  "buzzer": {
    "mode": "AUTO" o "MANUAL", ← string
    "isOn": true o false,      ← booleano
    "threshold": NUMBER        ← número (opcional)
  }
}
```

**IMPORTANTE:**
- No puede haber `null`
- No puede haber propiedades extra sin usar
- Los nombres deben ser exactos (minúsculas)
- Los tipos deben ser correctos

### Cómo verificar
```bash
# En navegador, abre:
http://192.168.1.100/api/status

# Compara el JSON que muestra con la estructura anterior
# Busca diferencias en:
# - Nombres de propiedades
# - Tipos de datos (string vs number vs boolean)
# - Propiedades faltantes
```

---

## 🟡 Problema: Datos desactualizados

### Síntomas
- El timestamp no cambia
- Los valores se quedan igual
- Las gráficas no avanzan

### Causas Posibles
1. El ESP32 no actualiza los sensores
2. El polling está detenido
3. Los sensores siempre retornan lo mismo

### Soluciones

#### 1. Verifica que loop() actualiza datos
En ESP32 `main.cpp`:
```cpp
void loop() {
  server.handleClient();

  if (millis() - lastUpdateTime >= postingInterval) {
    lastUpdateTime = millis();
    
    // AQUÍ DEBEN ACTUALIZARSE LOS SENSORES:
    temperatura = LeerTemperatura(...);
    humedad = LeerHumedad(...);
    luminosidad = LeerLuminosidad(...);
  }
}
```

#### 2. Revisa que los sensores funcionan
Abre Serial Monitor y verifica que los valores cambian:
```
Temperatura: 24.5°C
Humedad: 65%
Luminosidad: 1500

Temperatura: 24.6°C  ← Debe cambiar
Humedad: 65%
Luminosidad: 1501    ← Debe cambiar
```

Si los valores no cambian, problema en el sensor.

---

## 🟡 Problema: IP del ESP32 cambia

### Síntomas
- Funciona al principio
- Después de apagar/encender el ESP32, no conecta

### Causa
El ESP32 obtiene IP por DHCP y el router asignó una diferente.

### Soluciones

#### 1. Configurar IP estática en ESP32
```cpp
#include <WiFi.h>

// IP estática
IPAddress local_IP(192, 168, 1, 100);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);

void setup() {
  // Configurar IP estática antes de conectar
  WiFi.config(local_IP, gateway, subnet);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println("IP: " + WiFi.localIP().toString());
}
```

#### 2. Usar mDNS (alternativa)
```cpp
#include <ESPmDNS.h>

void setup() {
  WiFi.begin(ssid, password);
  
  if (MDNS.begin("invernadero")) {
    Serial.println("mDNS responder started");
  }
  
  // Después conectas como: invernadero.local
  // http://invernadero.local/api/status
}
```

En `.env.local`:
```
VITE_ESP32_URL=http://invernadero.local
```

---

## 🟡 Problema: Performance lenta

### Síntomas
- Dashboard tarda en cargar
- Las gráficas parpadean
- Los botones responden lentamente

### Causas Posibles
1. Demasiados puntos en las gráficas (> 100)
2. WiFi lenta
3. ESP32 sobrecargado
4. Navegador antiguo

### Soluciones

#### 1. Reducir puntos de gráficas
En `src/lib/esp32Config.ts`:
```typescript
GRAPH_MAX_POINTS: 50,  // Cambiar de 100 a 50
```

#### 2. Aumentar intervalo de polling
```typescript
POLLING_INTERVAL: 10000,  // Cambiar de 5s a 10s
```

#### 3. Cerrar otras pestañas
Las gráficas consumen CPU.

---

## 📋 Checklist de Diagnóstico

Cuando tengas problemas, verifica en orden:

```
[ ] ¿El ESP32 está conectado a WiFi?
    Serial Monitor debe mostrar: "IP: 192.168.x.x"

[ ] ¿Puedo ping al ESP32?
    ping 192.168.1.100  (cambiar por tu IP)

[ ] ¿Puedo acceder a /api/status desde navegador?
    http://192.168.1.100/api/status

[ ] ¿El JSON está bien formado?
    Verifica estructura (no null, tipos correctos)

[ ] ¿El .env.local tiene la IP correcta?
    Verifica VITE_ESP32_URL

[ ] ¿Los headers CORS están en ESP32?
    "Access-Control-Allow-Origin: *"

[ ] ¿Los endpoints de control existen?
    /api/light/on, /api/fan/on, etc.

[ ] ¿La consola del navegador (F12) muestra errores?
    Búscalos y analiza

[ ] ¿El Serial Monitor del ESP32 muestra errores?
    Verifica logs
```

---

## 📞 Pedir Ayuda

Si nada funciona, proporciona:

1. **Captura del Serial Monitor del ESP32**
2. **Respuesta de** `http://192.168.1.100/api/status` (en navegador)
3. **Error de la consola del navegador** (F12)
4. **Tu `.env.local`** (sin contraseñas)
5. **Código de tu `main.cpp`** (las funciones de control)

---

¡Con esta guía deberías resolver la mayoría de problemas!
