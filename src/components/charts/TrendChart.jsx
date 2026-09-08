import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useTheme } from "../../context/ThemeContext";
import { colorAt, GRID_COLOR } from "./ChartTheme";

const AXIS_COLOR = "var(--agri-text-muted)";

/**
 * Multi-series line/area chart.
 *
 * `series` is an array of `{ key, name, color? }`. `points` is the array of
 * data rows; each row carries `label` (x-axis) plus one value per series key.
 *
 * Uses an explicit h-56 (224px) container so ResponsiveContainer has a
 * definite height to work with in a flowing page layout.
 */
export default function TrendChart({ points, series }) {
  const { resolved } = useTheme();

  if (!points?.length || !series?.length) return null;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: AXIS_COLOR, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: AXIS_COLOR, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "var(--agri-text-muted)", strokeOpacity: 0.3 }}
            contentStyle={{
              backgroundColor: "var(--agri-elevated)",
              border: "1px solid var(--agri-border)",
              borderRadius: 12,
              color: "var(--agri-text)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--agri-text-secondary)", fontWeight: 600 }}
          />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? colorAt(resolved, i)}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
