import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { useTheme } from "../../context/ThemeContext";
import { colorAt, GRID_COLOR } from "./ChartTheme";

const AXIS_COLOR = "var(--agri-text-muted)";

/**
 * Stacked bar chart for multi-series quantities per time bucket.
 *
 * `series` is `[{ key, name, color? }]`; `points` rows carry `label` plus a
 * numeric value per series key.
 *
 * Uses an explicit h-56 (224px) container so ResponsiveContainer has a
 * definite height to work with in a flowing page layout.
 */
export default function StackedBarChart({ points, series, stacked = true }) {
  const { resolved } = useTheme();

  if (!points?.length || !series?.length) return null;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -14, bottom: 0 }} barCategoryGap="20%">
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
            cursor={{ fill: "rgba(140,160,145,0.08)" }}
            contentStyle={{
              backgroundColor: "var(--agri-elevated)",
              border: "1px solid var(--agri-border)",
              borderRadius: 12,
              color: "var(--agri-text)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--agri-text-secondary)", fontWeight: 600 }}
          />
          {series.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "var(--agri-text-muted)" }}
            />
          )}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stackId={stacked ? "stack" : undefined}
              fill={s.color ?? colorAt(resolved, i)}
              radius={stacked && i === series.length - 1 ? [4, 4, 0, 0] : undefined}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
