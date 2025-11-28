import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

interface Thresholds {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  lightMin: number;
}

interface ThresholdConfigProps {
  thresholds: Thresholds;
  onUpdate: (thresholds: Thresholds) => void;
}

export const ThresholdConfig = ({ thresholds, onUpdate }: ThresholdConfigProps) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(localThresholds);
    setIsEditing(false);
    toast.success("Umbrales actualizados correctamente", {
      description: "Los nuevos valores se aplicarán al sistema de control"
    });
  };

  const handleReset = () => {
    setLocalThresholds(thresholds);
    setIsEditing(false);
  };

  return (
    <Card className="p-6 shadow-soft border-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Configuración de Umbrales</h3>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} size="sm">
              Cancelar
            </Button>
            <Button onClick={handleSave} size="sm" className="bg-gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature Thresholds */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive"></span>
            Temperatura (°C)
          </h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="temp-min" className="text-sm text-muted-foreground">Mínima</Label>
              <Input
                id="temp-min"
                type="number"
                value={localThresholds.tempMin}
                onChange={(e) => setLocalThresholds({ ...localThresholds, tempMin: Number(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="temp-max" className="text-sm text-muted-foreground">Máxima</Label>
              <Input
                id="temp-max"
                type="number"
                value={localThresholds.tempMax}
                onChange={(e) => setLocalThresholds({ ...localThresholds, tempMax: Number(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Humidity Thresholds */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Humedad (%)
          </h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="hum-min" className="text-sm text-muted-foreground">Mínima</Label>
              <Input
                id="hum-min"
                type="number"
                value={localThresholds.humidityMin}
                onChange={(e) => setLocalThresholds({ ...localThresholds, humidityMin: Number(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hum-max" className="text-sm text-muted-foreground">Máxima</Label>
              <Input
                id="hum-max"
                type="number"
                value={localThresholds.humidityMax}
                onChange={(e) => setLocalThresholds({ ...localThresholds, humidityMax: Number(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Light Threshold */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning"></span>
            Luminosidad (lux)
          </h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="light-min" className="text-sm text-muted-foreground">Mínima</Label>
              <Input
                id="light-min"
                type="number"
                value={localThresholds.lightMin}
                onChange={(e) => setLocalThresholds({ ...localThresholds, lightMin: Number(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div className="pt-8 text-sm text-muted-foreground">
              <p>El sistema activará el bombillo cuando la luz esté por debajo de este valor.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-muted-foreground mb-1">Rango de Temp. Óptima</p>
            <p className="font-semibold text-foreground">{thresholds.tempMin}°C - {thresholds.tempMax}°C</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-muted-foreground mb-1">Rango de Hum. Óptima</p>
            <p className="font-semibold text-foreground">{thresholds.humidityMin}% - {thresholds.humidityMax}%</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-muted-foreground mb-1">Luz Mínima Requerida</p>
            <p className="font-semibold text-foreground">{thresholds.lightMin} lux</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
