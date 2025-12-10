# ESP32 Code Reference

Este documento contiene los fragmentos de código necesarios para que tu ESP32 funcione correctamente con el dashboard React.

## ✅ Checklist de Requisitos

- [ ] El ESP32 conecta a WiFi
- [ ] Tienes un servidor Web (WebServer)
- [ ] Registraste el endpoint `/api/status`
- [ ] Implementaste los funciones de control
- [ ] Los datos de sensores se actualizan correctamente
- [ ] CORS está habilitado

## 1️⃣ Estructura de Variables Globales

Necesitas tener estas variables en tu `main.cpp`:

```cpp
// Variables Globales
float luminosidad = 0;      // Luminosidad LDR (0-4095)
float temperatura = 0;      // Temperatura en °C
float humedad = 0;          // Humedad en %
boolean estadobombillo = false;      // Estado del bombillo
boolean estadoventilador = false;    // Estado del ventilador
boolean estadobuzzer = false;        // Estado del buzzer

// Modos manual/automático
bool lightManual = false;
bool fanManual = false;
bool buzzerManual = false;

// Umbrales
int umbralLuz = 2500;           // Umbral para bombillo
int umbralTemperatura = 28;     // Umbral para ventilador
int umbralTemperaturaAlerta = 30; // Umbral para alarma
```

## 2️⃣ Struct para Estado del Servicio

```cpp
// En el archivo de configuración o en main.cpp
struct IoTServiceState {
  float luminosity;
  float temperature;
  float humidity;
  boolean lightOn;
  boolean fanOn;
  boolean buzzerOn;
  int lightThreshold;
  int fanThreshold;
  int buzzerThreshold;
  boolean lightManual;
  boolean fanManual;
  boolean buzzerManual;
};
```

## 3️⃣ Función para Construir JSON

```cpp
String buildStatusJson(const IoTServiceState& data) {
  String json = "{";
  
  json += "\"light\":{";
  json += "\"luminosity\":" + String(data.luminosity) + ",";
  json += "\"mode\":\"" + String(data.lightManual ? "MANUAL" : "AUTO") + "\",";
  json += "\"isOn\":" + String(data.lightOn ? "true" : "false") + ",";
  json += "\"threshold\":" + String(data.lightThreshold);
  json += "}";

  json += ",";
  json += "\"fan\":{";
  json += "\"temperature\":" + String(data.temperature) + ",";
  json += "\"humidity\":" + String(data.humidity) + ",";
  json += "\"mode\":\"" + String(data.fanManual ? "MANUAL" : "AUTO") + "\",";
  json += "\"isOn\":" + String(data.fanOn ? "true" : "false") + ",";
  json += "\"threshold\":" + String(data.fanThreshold);
  json += "}";

  json += ",";
  json += "\"buzzer\":{";
  json += "\"mode\":\"" + String(data.buzzerManual ? "MANUAL" : "AUTO") + "\",";
  json += "\"isOn\":" + String(data.buzzerOn ? "true" : "false") + ",";
  json += "\"threshold\":" + String(data.buzzerThreshold);
  json += "}";

  json += "}";
  return json;
}

IoTServiceState buildServiceState() {
  IoTServiceState current;
  current.luminosity = luminosidad;
  current.temperature = temperatura;
  current.humidity = humedad;
  current.lightOn = estadobombillo;
  current.fanOn = estadoventilador;
  current.buzzerOn = estadobuzzer;
  current.lightThreshold = umbralLuz;
  current.fanThreshold = umbralTemperatura;
  current.buzzerThreshold = umbralTemperaturaAlerta;
  current.lightManual = lightManual;
  current.fanManual = fanManual;
  current.buzzerManual = buzzerManual;
  return current;
}

String getStatusJson() {
  return buildStatusJson(buildServiceState());
}
```

## 4️⃣ Funciones de Control

```cpp
// BOMBILLO/LUZ
void setLightOn() {
  lightManual = true;
  estadobombillo = true;
  digitalWrite(bombillopin, HIGH);
}

void setLightOff() {
  lightManual = true;
  estadobombillo = false;
  digitalWrite(bombillopin, LOW);
}

void setLightAuto() {
  lightManual = false;
}

void setLightThreshold(int value) {
  umbralLuz = value;
}

// VENTILADOR
void setFanOn() {
  fanManual = true;
  estadoventilador = true;
  digitalWrite(ventiladorpin, HIGH);
}

void setFanOff() {
  fanManual = true;
  estadoventilador = false;
  digitalWrite(ventiladorpin, LOW);
}

void setFanAuto() {
  fanManual = false;
}

void setFanThreshold(int value) {
  umbralTemperatura = value;
}

// BUZZER/ALARMA
void setBuzzerOn() {
  buzzerManual = true;
  estadobuzzer = true;
  digitalWrite(buzzerpin, HIGH);
}

void setBuzzerOff() {
  buzzerManual = true;
  estadobuzzer = false;
  digitalWrite(buzzerpin, LOW);
}

void setBuzzerAuto() {
  buzzerManual = false;
}
```

## 5️⃣ Registrar Rutas en setup()

```cpp
void setup() {
  // ... inicialización anterior ...

  // ===== RUTAS API REST PARA REACT =====
  
  // Ruta principal para obtener estado JSON
  server.on("/api/status", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.send(200, "application/json", getStatusJson());
  });

  // Manejo CORS preflight
  server.on("/api/status", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200);
  });

  // CONTROL DE LUZ
  server.on("/api/light/on", HTTP_GET, []() {
    setLightOn();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/light/off", HTTP_GET, []() {
    setLightOff();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/light/auto", HTTP_GET, []() {
    setLightAuto();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/light/threshold", HTTP_GET, []() {
    if (server.hasArg("value")) {
      int value = server.arg("value").toInt();
      setLightThreshold(value);
    }
    server.send(200, "application/json", getStatusJson());
  });

  // CONTROL DE VENTILADOR
  server.on("/api/fan/on", HTTP_GET, []() {
    setFanOn();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/fan/off", HTTP_GET, []() {
    setFanOff();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/fan/auto", HTTP_GET, []() {
    setFanAuto();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/fan/threshold", HTTP_GET, []() {
    if (server.hasArg("value")) {
      int value = server.arg("value").toInt();
      setFanThreshold(value);
    }
    server.send(200, "application/json", getStatusJson());
  });

  // CONTROL DE BUZZER/ALARMA
  server.on("/api/buzzer/on", HTTP_GET, []() {
    setBuzzerOn();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/buzzer/off", HTTP_GET, []() {
    setBuzzerOff();
    server.send(200, "application/json", getStatusJson());
  });

  server.on("/api/buzzer/auto", HTTP_GET, []() {
    setBuzzerAuto();
    server.send(200, "application/json", getStatusJson());
  });

  // Favicon para evitar errores 404
  server.on("/favicon.ico", []() {
    server.send(204); // 204 = No Content
  });

  server.onNotFound([]() {
    server.send(404, "text/plain", "Not Found");
  });

  server.begin();
  Serial.println("Servidor web iniciado");
}
```

## 6️⃣ En loop(): Actualizar datos

```cpp
void loop() {
  server.handleClient();

  // Actualizar sensores cada X segundos
  if (millis() - lastUpdateTime >= postingInterval) {
    lastUpdateTime = millis();

    // Leer sensores
    temperatura = LeerTemperatura(temperaturapin, dht22, 5.0);
    humedad = LeerHumedad(temperaturapin, dht22, 5.0);
    luminosidad = LeerLuminosidad(sensorluzpin);

    // Lógica de control automático
    if (!lightManual) {
      // Control automático del bombillo
      // Aquí tu lógica...
    }

    if (!fanManual) {
      // Control automático del ventilador
      // Aquí tu lógica...
    }

    if (!buzzerManual) {
      // Control automático del buzzer
      // Aquí tu lógica...
    }
  }
}
```

## 📋 JSON que debe retornar /api/status

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

## 🔍 Cómo Verificar

1. **Abre en el navegador:**
   ```
   http://192.168.1.100/api/status
   ```
   Debe mostrarte el JSON directamente

2. **En el Serial Monitor:**
   ```
   Servidor web iniciado
   IP: 192.168.1.100
   ```

3. **Usa cURL para probar:**
   ```bash
   # Linux/Mac
   curl http://192.168.1.100/api/status | jq .
   
   # PowerShell Windows
   Invoke-WebRequest -Uri "http://192.168.1.100/api/status" | ConvertFrom-Json
   ```

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| No puedo conectar | Revisa la IP en Serial Monitor, debe estar en la misma red |
| El JSON está vacío | Verifica que `getStatusJson()` retorna datos válidos |
| Los sensores no actualizan | Revisa que `LeerTemperatura()`, etc. funcionan correctamente |
| Los botones no funcionan | Verifica que las funciones `setLightOn()`, etc. están completas |
| CORS error | Asegúrate de enviar el header: `Access-Control-Allow-Origin: *` |

---

¿Necesitas más ayuda? Crea un issue en el repositorio.
