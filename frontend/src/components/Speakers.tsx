import { getSpeakerColor, initials } from "@/lib/trace-utils";

export function SpeakerAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const c = getSpeakerColor(name);
  return (
    <div
      className="inline-flex items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

export function SpeakerStack({ names, max = 3, size = 28 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((n, i) => (
        <div key={n + i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <SpeakerAvatar name={n} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: size,
            height: size,
            background: "var(--surface-2)",
            color: "var(--ink-2)",
            border: "1px solid var(--border)",
            fontSize: 11,
          }}
          className="inline-flex items-center justify-center rounded-full font-semibold"
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
