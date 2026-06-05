"use client";

const CONNECTIONS = [
  {
    id: "p1",
    avatarX: 7,
    avatarY: 11,
    earthX: 40,
    earthY: 36,
    path: "M 7 11 Q 22 20 40 36",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=72&h=72&fit=crop&crop=face",
    delay: "0s",
  },
  {
    id: "p2",
    avatarX: 90,
    avatarY: 9,
    earthX: 62,
    earthY: 34,
    path: "M 90 9 Q 76 18 62 34",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=72&h=72&fit=crop&crop=face",
    delay: "0.6s",
  },
  {
    id: "p3",
    avatarX: 5,
    avatarY: 76,
    earthX: 38,
    earthY: 60,
    path: "M 5 76 Q 20 68 38 60",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=72&h=72&fit=crop&crop=face",
    delay: "1.2s",
  },
  {
    id: "p4",
    avatarX: 94,
    avatarY: 64,
    earthX: 64,
    earthY: 56,
    path: "M 94 64 Q 82 56 64 56",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=72&h=72&fit=crop&crop=face",
    delay: "1.8s",
  },
] as const;

const EARTH_NODES = [
  { x: 40, y: 36 },
  { x: 62, y: 34 },
  { x: 38, y: 60 },
  { x: 64, y: 56 },
] as const;

export function EarthConnectionNetwork() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="conn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.12" />
            <stop offset="45%" stopColor="#818CF8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
          </linearGradient>
          <filter id="conn-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {CONNECTIONS.map((conn) => (
          <g key={conn.id}>
            <path
              d={conn.path}
              fill="none"
              stroke="rgba(96,165,250,0.08)"
              strokeWidth="0.28"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={conn.path}
              fill="none"
              stroke="url(#conn-gradient)"
              strokeWidth="0.24"
              vectorEffect="non-scaling-stroke"
              filter="url(#conn-glow)"
              className="earth-conn-line"
              style={{ animationDelay: conn.delay }}
            />
            <circle r="0.45" fill="#7DD3FC" opacity="0">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path={conn.path}
                begin={conn.delay}
              />
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                dur="3.2s"
                repeatCount="indefinite"
                begin={conn.delay}
              />
            </circle>
          </g>
        ))}

        {EARTH_NODES.map((node, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r="0.9"
              fill="#60A5FA"
              opacity="0.18"
              className="earth-conn-node-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="0.4"
              fill="#BAE6FD"
              filter="url(#conn-glow)"
            />
          </g>
        ))}
      </svg>

      {CONNECTIONS.map((conn) => (
        <div
          key={`avatar-${conn.id}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${conn.avatarX}%`,
            top: `${conn.avatarY}%`,
          }}
        >
          <div className="earth-avatar-glow h-9 w-9 rounded-[8px] bg-gradient-to-br from-[#60A5FA]/80 to-[#818CF8]/80 p-[1.5px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={conn.photo}
              alt=""
              className="h-full w-full rounded-[6px] object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
