interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export function WaveformIcon({ size = 20, color = "var(--accent)", className }: Props) {
  // total intrinsic: 27 wide x 20 tall, bars 8/14/20/14/8 px high, 3px wide, 3px gap
  const heights = [8, 14, 20, 14, 8];
  return (
    <svg
      width={(size * 27) / 20}
      height={size}
      viewBox="0 0 27 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 6}
          y={(20 - h) / 2}
          width={3}
          height={h}
          rx={1}
          fill={color}
        />
      ))}
    </svg>
  );
}
