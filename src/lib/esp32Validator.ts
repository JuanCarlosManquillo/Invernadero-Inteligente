import { Esp32Status } from '@/types/esp32';

/**
 * Valida que la respuesta del ESP32 tenga la estructura correcta
 */
export const validateEsp32Response = (data: unknown): data is Esp32Status => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Validar estructura light
  if (!obj.light || typeof obj.light !== 'object') return false;
  const light = obj.light as Record<string, unknown>;
  if (typeof light.luminosity !== 'number') return false;
  if (!['MANUAL', 'AUTO'].includes(String(light.mode))) return false;
  if (typeof light.isOn !== 'boolean') return false;
  if (typeof light.threshold !== 'number') return false;

  // Validar estructura fan
  if (!obj.fan || typeof obj.fan !== 'object') return false;
  const fan = obj.fan as Record<string, unknown>;
  if (typeof fan.temperature !== 'number') return false;
  if (typeof fan.humidity !== 'number') return false;
  if (!['MANUAL', 'AUTO'].includes(String(fan.mode))) return false;
  if (typeof fan.isOn !== 'boolean') return false;
  if (typeof fan.threshold !== 'number') return false;

  // Validar estructura buzzer
  if (!obj.buzzer || typeof obj.buzzer !== 'object') return false;
  const buzzer = obj.buzzer as Record<string, unknown>;
  if (!['MANUAL', 'AUTO'].includes(String(buzzer.mode))) return false;
  if (typeof buzzer.isOn !== 'boolean') return false;

  return true;
};

/**
 * Obtiene un mensaje de error descriptivo si los datos no son válidos
 */
export const getValidationError = (data: unknown): string => {
  if (!data) return 'La respuesta está vacía';
  if (typeof data !== 'object') return 'La respuesta no es un objeto JSON';

  const obj = data as Record<string, unknown>;

  if (!obj.light) return 'Falta la sección "light"';
  if (!obj.fan) return 'Falta la sección "fan"';
  if (!obj.buzzer) return 'Falta la sección "buzzer"';

  return 'Estructura JSON inválida. Revisa que el endpoint retorne el formato correcto.';
};

/**
 * Sanitiza valores numéricos para evitar NaN o infinito
 */
export const sanitizeNumber = (value: unknown, min = -Infinity, max = Infinity): number => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(min, Math.min(max, num));
};
