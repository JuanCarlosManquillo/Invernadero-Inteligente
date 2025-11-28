import { useState, useEffect } from "react";
import { SensorCard } from "@/components/SensorCard";
import { ActuatorCard } from "@/components/ActuatorCard";
import { StatusBanner } from "@/components/StatusBanner";
import { SensorChart } from "@/components/SensorChart";
import { ThresholdConfig } from "@/components/ThresholdConfig";
import { Thermometer, Droplets, Sun, Lightbulb, Fan, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataPoint {
  time: string;
  value: number;
}

interface Thresholds {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  lightMin: number;
}

const Index = () => {
  // Sensor data
  const [temperature, setTemperature] = useState(24);
  const [humidity, setHumidity] = useState(65);
  const [light, setLight] = useState(420);
  
  // Actuators
  const [bulbActive, setBulbActive] = useState(false);
  const [fanActive, setFanActive] = useState(false);
  const [buzzerActive, setBuzzerActive] = useState(false);

  // Thresholds
  const [thresholds, setThresholds] = useState<Thresholds>({
    tempMin: 18,
    tempMax: 28,
    humidityMin: 50,
    humidityMax: 75,
    lightMin: 300,
  });

  // Historical data for charts
  const [tempHistory, setTempHistory] = useState<DataPoint[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<DataPoint[]>([]);
  const [lightHistory, setLightHistory] = useState<DataPoint[]>([]);

  // Simulate data updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      // Update current values
      const newTemp = Math.max(15, Math.min(35, temperature + (Math.random() - 0.5) * 2));
      const newHumidity = Math.max(40, Math.min(90, humidity + (Math.random() - 0.5) * 5));
      const newLight = Math.max(0, Math.min(1000, light + (Math.random() - 0.5) * 50));

      setTemperature(newTemp);
      setHumidity(newHumidity);
      setLight(newLight);

      // Update history (keep last 20 data points)
      setTempHistory(prev => [...prev, { time: timeStr, value: newTemp }].slice(-20));
      setHumidityHistory(prev => [...prev, { time: timeStr, value: newHumidity }].slice(-20));
      setLightHistory(prev => [...prev, { time: timeStr, value: newLight }].slice(-20));
    }, 3000);

    return () => clearInterval(interval);
  }, [temperature, humidity, light]);

  // Control logic based on thresholds
  useEffect(() => {
    setBulbActive(light < thresholds.lightMin);
    setFanActive(temperature > thresholds.tempMax);
    setBuzzerActive(
      temperature > thresholds.tempMax + 4 || 
      temperature < thresholds.tempMin - 2 || 
      humidity > thresholds.humidityMax + 10
    );
  }, [temperature, humidity, light, thresholds]);

  const getStatus = () => {
    if (
      temperature > thresholds.tempMax + 4 || 
      temperature < thresholds.tempMin - 2 || 
      humidity > thresholds.humidityMax + 10
    ) {
      return { 
        status: "critical" as const, 
        message: "¡Condiciones críticas detectadas! Revise el sistema inmediatamente." 
      };
    }
    if (
      temperature > thresholds.tempMax || 
      temperature < thresholds.tempMin ||
      light < thresholds.lightMin || 
      humidity > thresholds.humidityMax
    ) {
      return { 
        status: "warning" as const, 
        message: "Condiciones fuera del rango óptimo. Sistema ajustando automáticamente." 
      };
    }
    return { 
      status: "normal" as const, 
      message: "Todas las condiciones dentro del rango óptimo. Sistema operando correctamente." 
    };
  };

  const getTempStatus = () => {
    if (temperature > thresholds.tempMax + 4 || temperature < thresholds.tempMin - 2) return "critical";
    if (temperature > thresholds.tempMax || temperature < thresholds.tempMin) return "warning";
    return "normal";
  };

  const getHumidityStatus = () => {
    if (humidity > thresholds.humidityMax + 10) return "critical";
    if (humidity > thresholds.humidityMax || humidity < thresholds.humidityMin) return "warning";
    return "normal";
  };

  const getLightStatus = () => {
    if (light < thresholds.lightMin) return "warning";
    return "normal";
  };

  const currentStatus = getStatus();

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-card border-b-2 border-border shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sun className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invernadero Inteligente</h1>
              <p className="text-sm text-muted-foreground">Universidad del Cauca - Sistema IoT</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Banner */}
        <StatusBanner status={currentStatus.status} message={currentStatus.message} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-8">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="charts">Gráficas</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Sensor Readings */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Lecturas de Sensores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SensorCard
                  title="Temperatura"
                  value={temperature.toFixed(1)}
                  unit="°C"
                  icon={Thermometer}
                  status={getTempStatus()}
                  trend={temperature > 26 ? "up" : temperature < 22 ? "down" : "stable"}
                />
                <SensorCard
                  title="Humedad"
                  value={humidity.toFixed(0)}
                  unit="%"
                  icon={Droplets}
                  status={getHumidityStatus()}
                  trend={humidity > 70 ? "up" : humidity < 60 ? "down" : "stable"}
                />
                <SensorCard
                  title="Luminosidad"
                  value={light.toFixed(0)}
                  unit="lux"
                  icon={Sun}
                  status={getLightStatus()}
                  trend={light < 300 ? "down" : light > 600 ? "up" : "stable"}
                />
              </div>
            </section>

            {/* Actuator Status */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Estado de Actuadores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActuatorCard
                  title="Bombillo"
                  icon={Lightbulb}
                  isActive={bulbActive}
                  description="Iluminación artificial"
                />
                <ActuatorCard
                  title="Ventilador"
                  icon={Fan}
                  isActive={fanActive}
                  description="Control de temperatura"
                />
                <ActuatorCard
                  title="Alarma"
                  icon={Bell}
                  isActive={buzzerActive}
                  description="Sistema de alertas"
                />
              </div>
            </section>

            {/* System Info */}
            <section className="bg-card p-6 rounded-xl shadow-soft border-2 border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Información del Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Última actualización:</span>
                  <span className="font-medium text-foreground">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Tipo de cultivo:</span>
                  <span className="font-medium text-foreground">Plantas Suculentas</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Controlador:</span>
                  <span className="font-medium text-foreground">ESP32</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Protocolo:</span>
                  <span className="font-medium text-foreground">MQTT + ThingSpeak</span>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Evolución Temporal de Variables</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Monitoreo de las últimas 20 lecturas de cada sensor con umbrales configurados
              </p>
            </div>
            
            <SensorChart
              title="Temperatura en el Tiempo"
              data={tempHistory}
              dataKey="Temperatura"
              unit="°C"
              color="hsl(var(--destructive))"
              minThreshold={thresholds.tempMin}
              maxThreshold={thresholds.tempMax}
            />
            
            <SensorChart
              title="Humedad en el Tiempo"
              data={humidityHistory}
              dataKey="Humedad"
              unit="%"
              color="hsl(210, 100%, 50%)"
              minThreshold={thresholds.humidityMin}
              maxThreshold={thresholds.humidityMax}
            />
            
            <SensorChart
              title="Luminosidad en el Tiempo"
              data={lightHistory}
              dataKey="Luminosidad"
              unit="lux"
              color="hsl(var(--warning))"
              minThreshold={thresholds.lightMin}
            />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Configuración de Umbrales</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Establezca los valores óptimos para el cultivo de plantas suculentas
              </p>
            </div>
            
            <ThresholdConfig
              thresholds={thresholds}
              onUpdate={setThresholds}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t-2 border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Desarrollado por Miguel Ángel Polo, y Juan Carlos Manquillo y Laura Botina </p>
          <p className="mt-1">Ingeniería de Sistemas - Universidad del Cauca 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
