import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HistoryDataPoint } from '@/types/esp32';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataChartProps {
  data: HistoryDataPoint[];
  title: string;
  description?: string;
  dataKeys: Array<{
    key: keyof HistoryDataPoint;
    name: string;
    stroke: string;
    dataType?: 'number' | 'boolean';
  }>;
  yAxisDomain?: [number, number];
  height?: number;
}

export const DataChart = ({
  data,
  title,
  description,
  dataKeys,
  yAxisDomain,
  height = 300,
}: DataChartProps) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Esperando datos del ESP32...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formatear datos para mostrar timestamp legible
  const chartData = data.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval={Math.floor(data.length / 6) || 0}
            />
            <YAxis domain={yAxisDomain} />
            <Tooltip
              formatter={(value) => {
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return value ? 'ON' : 'OFF';
              }}
              labelFormatter={(label) => `Hora: ${label}`}
            />
            <Legend />
            {dataKeys.map((key) => (
              <Line
                key={String(key.key)}
                type="monotone"
                dataKey={String(key.key)}
                name={key.name}
                stroke={key.stroke}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
