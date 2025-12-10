import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate: number;
  error?: string | null;
  onRetry: () => void;
}

export const ConnectionStatus = ({ isConnected, lastUpdate, error, onRetry }: ConnectionStatusProps) => {
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate) / 1000);
  const timeDisplay = timeSinceUpdate < 60 ? `hace ${timeSinceUpdate}s` : `hace ${Math.floor(timeSinceUpdate / 60)}m`;

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
              Conectado al ESP32
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              Desconectado del ESP32
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isConnected ? `Última actualización ${timeDisplay}` : error || 'Intentando conectar...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        {!isConnected && (
          <Button onClick={onRetry} size="sm" variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </Button>
        )}
        <div className="text-xs text-gray-600 flex-1">
          Nota: Asegúrate de que el ESP32 esté en línea y accesible en tu red
        </div>
      </CardContent>
    </Card>
  );
};
