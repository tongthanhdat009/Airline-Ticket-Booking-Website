<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# ThongKe

## Purpose
Chart and stat widgets for the admin thống kê (analytics) screen. They render data the page already fetched; none of them call the API themselves.

## Key Files
| File | Description |
|------|-------------|
| `StatCard.jsx` | KPI tile (title, value, icon) with a colour variant map (`green`, `blue`, `indigo`, `orange`, `teal`, `red`). |
| `CustomTooltip.jsx` | Shared recharts tooltip; falls back to `payload[0].name` when the label is undefined (pie charts) and renames the `value` key to "Doanh thu". |
| `GroupedBarChart.jsx` | Recharts `BarChart` comparing periods (tháng này vs tháng trước, năm nay vs năm trước) over the given `dataKeys`. |
| `HorizontalBarChart.jsx` | Recharts horizontal bar chart for the top chặng bay, keyed on `changBay` / `soVeBan` by default. |
| `HeatmapChart.jsx` | Hand-built SVG heatmap of booking volume by weekday (X) and hour (Y), built from a 7×24 matrix. |
| `FunnelChart.jsx` | Hand-built SVG funnel for the đặt vé conversion ratio. |

## For AI Agents

### Working In This Directory
- Only `GroupedBarChart` and `HorizontalBarChart` use recharts; `HeatmapChart`, `FunnelChart` and `StatCard` are plain SVG / markup — do not reach for a chart library there.
- Every chart renders its own "Không có dữ liệu" empty state when `data` is missing or empty; keep that guard when adding a series.
- Colours come from the `colors` prop (or `constants/colorPalette.js`), not hardcoded hex values.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Open the thống kê screen with data and with an empty range in `pnpm dev`.

### Common Patterns
- `formatValue` is injected per chart, so the same component renders VND in one place and counts in another.
- The heatmap and funnel are hand-drawn SVGs — a data shape change means editing the geometry code, not just the props.
- `StatCard` is memoized; it re-renders only when its props change.

## Dependencies

### Internal
- `../../../constants/colorPalette.js` - chart colour palette.
- `../../../pages/QuanLy/ThongKeDoanhThu.jsx` - the page that fetches the data and renders these widgets.
- `../../../services/ThongKeService.jsx` - statistics endpoints used by the page.

### External
- recharts - `BarChart`, `ResponsiveContainer`, `Tooltip` and axes.
- tailwindcss - stat card and empty-state styling.

<!-- MANUAL: -->
