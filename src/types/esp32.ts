export interface SensorData {
  luminosity: number;
  temperature: number;
  humidity: number;
}

export interface ActuatorState {
  isOn: boolean;
  mode: 'MANUAL' | 'AUTO';
  threshold?: number;
}

export interface LightService extends ActuatorState {
  luminosity: number;
}

export interface FanService extends ActuatorState {
  temperature: number;
  humidity: number;
}

export interface BuzzerService extends ActuatorState {
  // Buzzer only has on/off and mode
}

export interface Esp32Status {
  light: LightService;
  fan: FanService;
  buzzer: BuzzerService;
}

export interface HistoryDataPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
  luminosity: number;
  lightOn: boolean;
  fanOn: boolean;
  buzzerOn: boolean;
}
