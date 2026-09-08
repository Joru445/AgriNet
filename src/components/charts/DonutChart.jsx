import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

import { useTheme } from "../../context/ThemeContext";
import { getChartPalette } from "./ChartTheme";

/**
 * Donut chart for share-of-total data (e.g. product category distribution).
 *
 * `items` is `[{ name, value, color? }]`. Renders a centered total.
 *
 * Uses an explicit h-56 (224px) container so ResponsiveContainer has a
 * definite height to work with in a flowing page layout.
 */
export default function DonutChart({ items, centerLabel }) {
  const { resolved } = useTheme();
  const palette = getChartPalette(resolved);

  if (!items?.length) return null;

  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const safeItems = items.filter((item) => Number(item.value) > 0);

  if (!safeItems.length) return null;

  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            formatter={(value) => [value.toLocaleString(), ""]}
            contentStyle={{
              backgroundColor: "var(--agri-elevated)",
              border: "1px solid var(--agri-border)",
              borderRadius: 12,
              color: "var(--agri-text)",
              fontSize: 12,
            }}
          />
          <Pie
            data={safeItems}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="86%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {safeItems.map((item, i) => (
              <Cell key={item.name} fill={item.color ?? palette[i % palette.length]} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "var(--agri-text-muted)" }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[var(--agri-text)]">{total.toLocaleString()}</span>
        {centerLabel && (
          <span className="text-[11px] font-medium text-[var(--agri-text-muted)]">{centerLabel}</span>
        )}
      </div>
    </div>
  );
}
