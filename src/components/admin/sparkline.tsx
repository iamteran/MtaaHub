import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  area?: boolean;
  id?: string;
}

/** Tiny dependency-free SVG sparkline. */
export function Sparkline({
  data,
  className,
  stroke = "#22C55E",
  fill,
  width = 120,
  height = 34,
  strokeWidth = 1.6,
  area = false,
  id = "spark",
}: SparklineProps) {
  const points = data.length > 1 ? data : [0, 0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1 || 1);

  const coords = points.map((value, index) => {
    const x = index * stepX;
    const y = height - 2 - ((value - min) / span) * (height - 4);
    return [x, y] as const;
  });

  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `M0,${height} L${coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")} L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {area && (
        <>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill ?? stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={fill ?? stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${id}-grad)`} />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
