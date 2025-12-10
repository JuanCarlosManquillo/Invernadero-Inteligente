import { useState, useEffect, useCallback } from 'react';
import { Esp32Status, HistoryDataPoint } from '@/types/esp32';
import { ESP32_CONFIG, buildEsp32Url } from '@/lib/esp32Config';
import { validateEsp32Response } from '@/lib/esp32Validator';

export const useEsp32Data = () => {
  const [data, setData] = useState<Esp32Status | null>(null);
  const [history, setHistory] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  /**
   * Obtiene el estado actual del ESP32
   */
  const fetchStatus = useCallback(async () => {
    try {
      const url = buildEsp32Url('/api/status');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      
      // Validar estructura de respuesta
      if (!validateEsp32Response(json)) {
        throw new Error('Estructura JSON inválida del ESP32');
      }

      setData(json);
      setError(null);
      setLastUpdate(Date.now());

      // Agregar punto al historial
      setHistory((prev) => {
        const newPoint: HistoryDataPoint = {
          timestamp: Date.now(),
          temperature: json.fan.temperature,
          humidity: json.fan.humidity,
          luminosity: json.light.luminosity,
          lightOn: json.light.isOn,
          fanOn: json.fan.isOn,
          buzzerOn: json.buzzer.isOn,
        };

        // Mantener solo los últimos N puntos
        const updated = [...prev, newPoint];
        if (updated.length > ESP32_CONFIG.GRAPH_MAX_POINTS) {
          updated.shift();
        }
        return updated;
      });

      setLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      setLoading(false);
      console.error('Error fetching ESP32 data:', err);
    }
  }, []);

  /**
   * Envía una acción al ESP32
   */
  const sendAction = useCallback(async (action: string) => {
    try {
      const url = buildEsp32Url(`/api/${action}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const json = await response.json();
      
      // Validar estructura
      if (!validateEsp32Response(json)) {
        throw new Error('Respuesta inválida del ESP32');
      }

      setData(json);
      setError(null);
      return json;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      console.error('Error sending action:', err);
      throw err;
    }
  }, []);

  /**
   * Actualiza un umbral
   */
  const setThreshold = useCallback(
    async (type: 'light' | 'fan', value: number) => {
      try {
        const url = buildEsp32Url(`/api/${type}/threshold?value=${value}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const json = await response.json();
        
        // Validar estructura
        if (!validateEsp32Response(json)) {
          throw new Error('Respuesta inválida del ESP32');
        }

        setData(json);
        setError(null);
        return json;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        console.error('Error setting threshold:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Control de luz
   */
  const light = {
    on: () => sendAction('light/on'),
    off: () => sendAction('light/off'),
    auto: () => sendAction('light/auto'),
    setThreshold: (value: number) => setThreshold('light', value),
  };

  /**
   * Control de ventilador
   */
  const fan = {
    on: () => sendAction('fan/on'),
    off: () => sendAction('fan/off'),
    auto: () => sendAction('fan/auto'),
    setThreshold: (value: number) => setThreshold('fan', value),
  };

  /**
   * Control de buzzer
   */
  const buzzer = {
    on: () => sendAction('buzzer/on'),
    off: () => sendAction('buzzer/off'),
    auto: () => sendAction('buzzer/auto'),
  };

  // Configurar polling automático
  useEffect(() => {
    // Obtener datos iniciales
    fetchStatus();

    // Configurar polling
    const interval = setInterval(fetchStatus, ESP32_CONFIG.POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    data,
    history,
    loading,
    error,
    lastUpdate,
    fetchStatus,
    light,
    fan,
    buzzer,
    sendAction,
  };
};
