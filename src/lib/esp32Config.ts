// Configuración del ESP32
export const ESP32_CONFIG = {
  // Cambia esto por la IP de tu ESP32
  // Ejemplo: 'http://192.168.1.100'
  // Puedes encontrarla en el Serial Monitor de PlatformIO cuando se conecta
  BASE_URL: import.meta.env.VITE_ESP32_URL || 'http://192.168.1.100',
  
  // Intervalos de actualización en milisegundos
  POLLING_INTERVAL: 5000, // Cada 5 segundos
  GRAPH_MAX_POINTS: 100, // Máximo número de puntos en las gráficas
  
  // Umbrales predeterminados
  DEFAULT_THRESHOLDS: {
    light: 2500,
    fan: 28,
    buzzer: 30,
  },
};

/**
 * Construye la URL completa para un endpoint del ESP32
 * @param endpoint - La ruta del endpoint (ej: '/api/status')
 * @returns URL completa
 */
export const buildEsp32Url = (endpoint: string): string => {
  return `${ESP32_CONFIG.BASE_URL}${endpoint}`;
};
