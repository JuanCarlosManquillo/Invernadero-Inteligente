# 🔄 Diagrama de Flujo - ESP32 ↔ React

## Flujo General de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA GENERAL                           │
└─────────────────────────────────────────────────────────────────────────┘

                         📱 NAVEGADOR (React)
                    ┌─────────────────────────────┐
                    │                             │
                    │  Dashboard.tsx              │
                    │  ├─ 3 Tabs                 │
                    │  ├─ SensorCard              │
                    │  ├─ DataChart (Recharts)   │
                    │  └─ Buttons (Control)      │
                    │                             │
                    └────────────┬────────────────┘
                                 │
                    useEsp32.ts (Hook)
                    • Fetch /api/status cada 5s
                    • Manejo de errores
                    • Validación JSON
                                 │
                    HTTP GET/POST (CORS)
                                 │
                    ┌────────────↓────────────────┐
                    │                             │
                    │    🔌 ESP32 (PlatformIO)   │
                    │                             │
                    │  ┌──────────────────────┐  │
                    │  │ Sensores:            │  │
                    │  │ • DHT22 (Temp/Hum)  │  │
                    │  │ • LDR (Luminosidad)  │  │
                    │  └──────────────────────┘  │
                    │  ┌──────────────────────┐  │
                    │  │ Actuadores:          │  │
                    │  │ • Bombillo (GPIO 19) │  │
                    │  │ • Ventilador (GPIO18)│  │
                    │  │ • Buzzer (GPIO 16)   │  │
                    │  └──────────────────────┘  │
                    │  ┌──────────────────────┐  │
                    │  │ Servidor Web:        │  │
                    │  │ • WebServer (p80)    │  │
                    │  │ • Endpoints /api/*   │  │
                    │  │ • CORS habilitado    │  │
                    │  └──────────────────────┘  │
                    │                             │
                    └─────────────────────────────┘
```

---

## Ciclo de Datos - Vista Rápida

```
ESP32 Lee Sensores (cada 5s)
    ↓
Construye JSON con estado actual
    ↓
Cliente React hace fetch a /api/status
    ↓
Valida estructura JSON
    ↓
Actualiza estado (setData)
    ↓
Componentes se rerenderilzan
    ↓
Gráficas se actualizan
    ↓
Usuario ve datos en tiempo real
```

---

## Secuencia de Comunicación

```
Tiempo  React                           ESP32
─────   ────────────────────────────    ──────────────────────────────
 T0     ┌─────────────────────────┐
        │ useEsp32 inicia         │
        │ ├─ state: loading=true  │
        │ └─ fetch /api/status    │──────────────→
                                              ┌──────────────────┐
                                              │ WebServer escucha│
                                              │ Busca endpoint   │
                                              │ getStatusJson()  │
                                              │ Construye JSON   │
                                              │ Envía respuesta  │
        ┌────────────────────────┐        └──────────────────┘
        │ Recibe respuesta JSON  │←──────────────
        │ validateEsp32Response()│
        ├─ ✓ Válido? Continúa   │
        ├─ ✗ Inválido? Error    │
        └────────────────────────┘
 T1     
        ┌────────────────────────┐
        │ Actualiza estado       │
        ├─ setData(json)         │
        ├─ setHistory(...)       │
        ├─ setError(null)        │
        └────────────────────────┘

 T2     ┌────────────────────────┐
        │ Renderiza componentes  │
        │ Dashboard actualizado  │
        │ Gráficas actualizadas  │
        │ Usuario ve datos       │
        └────────────────────────┘

 T3     Dashboard esperando...
        Usuario hace clic en botón
            ↓
        fetch a /api/light/on ──────────→
                                              ┌──────────────────┐
                                              │ Ejecuta setLight │
                                              │ digitalWrite(HIGH)
                                              │ Construye JSON   │
                                              │ Envía respuesta  │
        ┌────────────────────────┐        └──────────────────┘
        │ Recibe respuesta       │←──────────────
        │ Actualiza estado       │
        │ Dashboard actualizado  │
        │ Bombillo brilla        │
        └────────────────────────┘

 T5+    Sigue haciendo fetch cada 5s...
```

---

## Flujo de Control - Encender Bombillo

```
┌─────────────────────────────────────────────────────────────────┐
│ USUARIO HACE CLIC EN "ENCENDER BOMBILLO"                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                    onClick={light.on()}
                             ↓
          sendAction('light/on') en useEsp32.ts
                             ↓
          fetch('http://192.168.1.100/api/light/on')
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ESP32 RECIBE PETICIÓN                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
            server.on("/api/light/on", ...)
                             ↓
          callSetLightOn() - Handler registrado
                             ↓
            setLightOn() - Función de control
              ├─ lightManual = true
              ├─ estadobombillo = true
              └─ digitalWrite(bombillopin, HIGH) ← BOMBILLO BRILLA
                             ↓
          buildStatusJson() - Construye respuesta
                             ↓
          server.send(200, "application/json", ...)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    REACT RECIBE RESPUESTA                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
            if (!validateEsp32Response(json))
              ├─ ✓ Válido
              └─ ✗ Error → mostrar error
                             ↓
                  setData(json) ← Estado actualizado
                             ↓
         Dashboard.tsx se renderiza con datos nuevos
                             ↓
        data.light.isOn = true → muestra ✅ ENCENDIDO
                             ↓
              Usuario ve cambio en tiempo real
                             ↓
                          ¡ÉXITO! 🎉
```

---

## Flujo de Errores

```
┌──────────────────────────────────────────────────┐
│              CONEXIÓN FALLIDA                    │
└──────────────────────────────────────────────────┘
                        ↓
        ¿IP correcta en .env.local?
         ├─ NO  → Editar .env.local
         └─ SÍ  → ¿ESP32 en línea?
                   ├─ NO  → Encender ESP32
                   └─ SÍ  → ¿Endpoint existe?
                            ├─ NO → Registrar en setup()
                            └─ SÍ → ¿CORS configurado?
                                    ├─ NO → Agregar headers
                                    └─ SÍ → ¿JSON válido?
                                            ├─ NO → Revisar estructura
                                            └─ SÍ → ¡Contacto! 📞

┌──────────────────────────────────────────────────┐
│              ERROR CAPTURADO                     │
└──────────────────────────────────────────────────┘
                        ↓
                try { ... } catch
                        ↓
              setError(errorMsg)
                        ↓
        Dashboard muestra Alert en rojo
                        ↓
         Mensaje de error visible al usuario
                        ↓
              Usuario puede reintentar
                        ↓
        Button "Reintentar" llama fetchStatus()
```

---

## Estados del Hook useEsp32

```
                    ┌─────────────────┐
                    │  Inicializando  │
                    │ loading = true  │
                    │ data = null     │
                    └────────┬────────┘
                             │
                     fetch /api/status
                             │
            ┌────────────────┴────────────────┐
            │                                 │
      ✓ Éxito                           ✗ Error
            │                                 │
  ┌─────────↓──────────┐         ┌──────────↓────────────┐
  │   Datos Obtenidos  │         │   Error Capturado    │
  │ loading = false    │         │ loading = false      │
  │ data = objeto JSON │         │ error = mensajeError │
  │ error = null       │         │ data = null o anterior
  │ history actualizado│         │                       │
  └────────┬───────────┘         └──────────┬─────────────┘
           │                               │
    ┌──────────────────────────────────────┘
    │
    └───────────────┬───────────────┐
                    │               │
            Espera 5 segundos    Usuario hace clic
                    │               │
          fetch nuevamente      sendAction()
                    │               │
              (vuelve al inicio)  (regresa al éxito)
```

---

## Estructura de Props - Flujo de Datos en React

```
Dashboard
  ├─ useEsp32() hook
  │   └─ retorna {data, history, error, ...}
  │
  ├─ data: Esp32Status
  │   ├─ light: LightService
  │   │   ├─ luminosity: number
  │   │   ├─ mode: "MANUAL" | "AUTO"
  │   │   ├─ isOn: boolean
  │   │   └─ threshold: number
  │   ├─ fan: FanService
  │   │   ├─ temperature: number
  │   │   ├─ humidity: number
  │   │   ├─ mode: "MANUAL" | "AUTO"
  │   │   ├─ isOn: boolean
  │   │   └─ threshold: number
  │   └─ buzzer: BuzzerService
  │       ├─ mode: "MANUAL" | "AUTO"
  │       └─ isOn: boolean
  │
  ├─ history: HistoryDataPoint[]
  │   └─ [{timestamp, temperature, humidity, luminosity, ...}, ...]
  │
  ├─ error: string | null
  └─ lastUpdate: number
```

---

## Ciclo de Vida del Componente

```
┌─────────────────────────────────────────┐
│  1. Componente se monta                 │
└─────────────────────────────────────────┘
                    ↓
        useEsp32 hook se ejecuta
                    ↓
        useEffect del hook:
        • Llamar fetchStatus()
        • Iniciar intervalo (5 segundos)
                    ↓
┌─────────────────────────────────────────┐
│  2. Dashboard renderiza                 │
│     (loading && !data) → Muestra loader │
│     (data) → Muestra dashboard          │
│     (error) → Muestra error             │
└─────────────────────────────────────────┘
                    ↓
    Usuario interactúa (hace clic en botón)
                    ↓
    light.on() → sendAction('light/on')
                    ↓
    fetch a /api/light/on
                    ↓
    Respuesta actualiza data
                    ↓
    Dashboard se rerenderiza automáticamente
                    ↓
    Usuario ve cambio inmediato
                    ↓
    Cada 5 segundos:
    • Fetch automático
    • Datos actualizados
    • Gráficas se llenan
                    ↓
┌─────────────────────────────────────────┐
│  3. Componente se desmonta              │
│     clearInterval() - limpia timer      │
└─────────────────────────────────────────┘
```

---

## Validación de JSON

```
Respuesta del ESP32
        ↓
   JSON.parse()
        ↓
    ¿Tiene luz? ✓
        ├─ ¿luminosity es número? ✓
        ├─ ¿mode es MANUAL/AUTO? ✓
        ├─ ¿isOn es boolean? ✓
        └─ ¿threshold es número? ✓
        ↓
    ¿Tiene fan? ✓
        ├─ ¿temperature es número? ✓
        ├─ ¿humidity es número? ✓
        ├─ ¿mode es MANUAL/AUTO? ✓
        ├─ ¿isOn es boolean? ✓
        └─ ¿threshold es número? ✓
        ↓
    ¿Tiene buzzer? ✓
        ├─ ¿mode es MANUAL/AUTO? ✓
        └─ ¿isOn es boolean? ✓
        ↓
    validateEsp32Response() retorna true
        ↓
    ✅ JSON VÁLIDO → Usar data
    ❌ JSON INVÁLIDO → Mostrar error
```

---

## Flujo de Gráficas

```
Inicia dashboard
        ↓
history = []
        ↓
Primer fetch: data obtenido
        ↓
Construir HistoryDataPoint
{
  timestamp: 1234567890,
  temperature: 24.5,
  humidity: 65.2,
  luminosity: 1500,
  lightOn: true,
  fanOn: false,
  buzzerOn: false
}
        ↓
Agregar a history
history = [{...}]
        ↓
DataChart renderiza con 1 punto
        ↓
5 segundos después
fetch nuevo
        ↓
Nuevo HistoryDataPoint
        ↓
history = [{...}, {...}]
        ↓
DataChart renderiza con 2 puntos
        ↓
Repetir cada 5 segundos
        ↓
Después de 30s: 6 puntos
Después de 60s: 12 puntos
Después de 500s: 100 puntos (máximo)
        ↓
Cuando llega a 100:
removeFirst()
        ↓
Se mantiene deslizando (últimas 100 mediciones)
        ↓
Gráfica siempre muestra
últimas ~8 minutos de datos
```

---

## Resumen Visual

```
┌─────────────────────────────────────┐
│         COMPONENTE RENDER            │
├─────────────────────────────────────┤
│                                     │
│  if loading && !data                │
│  → mostrar spinner                  │
│                                     │
│  if data                            │
│  → mostrar dashboard                │
│  → botones funcionales              │
│  → gráficas                         │
│                                     │
│  if error                           │
│  → mostrar alert rojo               │
│  → botón reintentar                 │
│                                     │
└─────────────────────────────────────┘
         ↓         ↓         ↓
    Conexión  Datos    Error
```

---

**¡Con este diagrama comprendes todo el flujo! 🎯**
