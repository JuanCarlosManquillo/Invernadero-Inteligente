import { useEsp32Data } from '@/hooks/useEsp32';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataChart } from '@/components/DataChart';
import { SensorCard } from '@/components/SensorCard';
import { ActuatorCard } from '@/components/ActuatorCard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { AlertCircle, Wifi, WifiOff, RefreshCw, Lightbulb, Droplets, Sun, Thermometer } from 'lucide-react';
import { useState } from 'react';

export const Dashboard = () => {
  const { data, history, loading, error, lastUpdate, light, fan, buzzer, fetchStatus } =
    useEsp32Data();
  const [lightThreshold, setLightThreshold] = useState<string>('');
  const [fanThreshold, setFanThreshold] = useState<string>('');

  const handleSetLightThreshold = async () => {
    if (!lightThreshold) return;
    try {
      await light.setThreshold(parseInt(lightThreshold));
      setLightThreshold('');
    } catch (err) {
      console.error('Error setting light threshold:', err);
    }
  };

  const handleSetFanThreshold = async () => {
    if (!fanThreshold) return;
    try {
      await fan.setThreshold(parseInt(fanThreshold));
      setFanThreshold('');
    } catch (err) {
      console.error('Error setting fan threshold:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 mx-auto text-gray-400 animate-pulse" />
          <h2 className="text-2xl font-bold">Conectando con ESP32...</h2>
          <p className="text-gray-600">
            Asegúrate de que el ESP32 esté conectado y accesible en la red.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">🌱 Invernadero Inteligente</h1>
          <p className="text-gray-600">Control y monitoreo en tiempo real con ESP32</p>
        </div>

        {/* Status Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {error ? (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-500">Desconectado</span>
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-500">Conectado</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Última actualización: {new Date(lastUpdate).toLocaleTimeString('es-ES')}
          </span>
        </div>

        {/* Connection Status Card */}
        <ConnectionStatus 
          isConnected={!error} 
          lastUpdate={lastUpdate} 
          error={error}
          onRetry={fetchStatus}
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error de conexión: {error}
              <br />
              <small>
                Verifica que el ESP32 esté en línea. Actualiza la IP en las variables de entorno
                (VITE_ESP32_URL).
              </small>
            </AlertDescription>
          </Alert>
        )}

        {data && (
          <Tabs defaultValue="sensores" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sensores">📊 Sensores</TabsTrigger>
              <TabsTrigger value="actuadores">⚙️ Actuadores</TabsTrigger>
              <TabsTrigger value="graficas">📈 Gráficas</TabsTrigger>
            </TabsList>

            {/* SENSORES TAB */}
            <TabsContent value="sensores" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SensorCard
                  title="Luminosidad"
                  value={data.light.luminosity.toFixed(0)}
                  unit="(0-4095)"
                  icon={Sun}
                  status="normal"
                />
                <SensorCard
                  title="Temperatura"
                  value={data.fan.temperature.toFixed(1)}
                  unit="°C"
                  icon={Thermometer}
                  status={data.fan.temperature > 28 ? "warning" : "normal"}
                />
                <SensorCard
                  title="Humedad"
                  value={data.fan.humidity.toFixed(0)}
                  unit="%"
                  icon={Droplets}
                  status={data.fan.humidity > 70 ? "warning" : "normal"}
                />
              </div>

              {/* Luz y Calefacción */}
              <Card>
                <CardHeader>
                  <CardTitle>💡 Control de Iluminación y Calefacción</CardTitle>
                  <CardDescription>
                    El bombillo se enciende si: LDR &gt; {data.light.threshold} (poca luz) O
                    temperatura &lt; 20°C
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Modo: {data.light.mode}</div>
                    <div className="text-sm text-gray-600">
                      Estado: {data.light.isOn ? '✅ ENCENDIDO' : '❌ APAGADO'}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => light.on()}
                      variant={data.light.isOn && data.light.mode === 'MANUAL' ? 'default' : 'outline'}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Encender
                    </Button>
                    <Button
                      onClick={() => light.off()}
                      variant={!data.light.isOn && data.light.mode === 'MANUAL' ? 'default' : 'outline'}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Apagar
                    </Button>
                    <Button
                      onClick={() => light.auto()}
                      variant={data.light.mode === 'AUTO' ? 'default' : 'outline'}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Automático
                    </Button>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <label className="text-sm font-medium">Ajustar Umbral LDR:</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="2500"
                        value={lightThreshold}
                        onChange={(e) => setLightThreshold(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleSetLightThreshold} className="bg-yellow-500 hover:bg-yellow-600">
                        Guardar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACTUADORES TAB */}
            <TabsContent value="actuadores" className="space-y-4">
              {/* Ventilador */}
              <Card>
                <CardHeader>
                  <CardTitle>🌬️ Control de Ventilación</CardTitle>
                  <CardDescription>
                    Se enciende si T &gt; {data.fan.threshold}°C y se apaga si T ≤ 26°C
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Modo: {data.fan.mode}</div>
                    <div className="text-sm text-gray-600">
                      Estado: {data.fan.isOn ? '✅ ENCENDIDO' : '❌ APAGADO'}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => fan.on()}
                      variant={data.fan.isOn && data.fan.mode === 'MANUAL' ? 'default' : 'outline'}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Encender
                    </Button>
                    <Button
                      onClick={() => fan.off()}
                      variant={!data.fan.isOn && data.fan.mode === 'MANUAL' ? 'default' : 'outline'}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Apagar
                    </Button>
                    <Button
                      onClick={() => fan.auto()}
                      variant={data.fan.mode === 'AUTO' ? 'default' : 'outline'}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Automático
                    </Button>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <label className="text-sm font-medium">Ajustar Umbral Temperatura:</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="28"
                        value={fanThreshold}
                        onChange={(e) => setFanThreshold(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleSetFanThreshold} className="bg-orange-500 hover:bg-orange-600">
                        Guardar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alarma */}
              <Card>
                <CardHeader>
                  <CardTitle>🚨 Sistema de Alarma</CardTitle>
                  <CardDescription>Se activa automáticamente cuando T ≥ 30°C</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Modo: {data.buzzer.mode}</div>
                    <div className="text-sm text-gray-600">
                      Estado: {data.buzzer.isOn ? '🔴 ACTIVADA' : '⭕ DESACTIVADA'}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => buzzer.on()}
                      variant={data.buzzer.isOn && data.buzzer.mode === 'MANUAL' ? 'default' : 'outline'}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Activar
                    </Button>
                    <Button
                      onClick={() => buzzer.off()}
                      variant={!data.buzzer.isOn && data.buzzer.mode === 'MANUAL' ? 'default' : 'outline'}
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Desactivar
                    </Button>
                    <Button
                      onClick={() => buzzer.auto()}
                      variant={data.buzzer.mode === 'AUTO' ? 'default' : 'outline'}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Automático
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* GRÁFICAS TAB */}
            <TabsContent value="graficas" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => fetchStatus()}
                  size="sm"
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              <DataChart
                title="Temperatura y Humedad"
                description="Evolución de los sensores de temperatura y humedad en el tiempo"
                data={history}
                dataKeys={[
                  { key: 'temperature', name: 'Temperatura (°C)', stroke: '#ef4444' },
                  { key: 'humidity', name: 'Humedad (%)', stroke: '#3b82f6' },
                ]}
                yAxisDomain={[0, 100]}
                height={400}
              />

              <DataChart
                title="Luminosidad"
                description="Cambios de iluminación detectados por el fotoresistor"
                data={history}
                dataKeys={[{ key: 'luminosity', name: 'LDR Value', stroke: '#f59e0b' }]}
                yAxisDomain={[0, 4095]}
                height={300}
              />

              <DataChart
                title="Estado de Actuadores"
                description="Historial de encendido/apagado de los dispositivos"
                data={history}
                dataKeys={[
                  { key: 'lightOn', name: 'Bombillo', stroke: '#fbbf24' },
                  { key: 'fanOn', name: 'Ventilador', stroke: '#60a5fa' },
                  { key: 'buzzerOn', name: 'Alarma', stroke: '#ef4444' },
                ]}
                yAxisDomain={[0, 1]}
                height={300}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-6 border-t">
          <p>Invernadero Inteligente IoT • ESP32 + React Dashboard</p>
        </div>
      </div>
    </div>
  );
};
