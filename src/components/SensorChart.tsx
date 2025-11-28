import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DataPoint {
  time: string;
  value: number;
}

interface SensorChartProps {
  title: string;
  data: DataPoint[];
  dataKey: string;
  unit: string;
  color: string;
  minThreshold?: number;
  maxThreshold?: number;
}

export const SensorChart = ({ title, data, dataKey, unit, color, minThreshold, maxThreshold }: SensorChartProps) => {
  return (
    <Card className="p-6 shadow-soft border-2">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            label={{ value: unit, angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '2px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, dataKey]}
          />
          <Legend />
          
          {/* Threshold lines */}
          {maxThreshold !== undefined && (
            <Line 
              type="monotone" 
              dataKey={() => maxThreshold} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              dot={false}
              name="Umbral Máximo"
              strokeWidth={2}
            />
          )}
          {minThreshold !== undefined && (
            <Line 
              type="monotone" 
              dataKey={() => minThreshold} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="5 5"
              dot={false}
              name="Umbral Mínimo"
              strokeWidth={2}
            />
          )}
          
          {/* Actual data line */}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
            name={dataKey}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
