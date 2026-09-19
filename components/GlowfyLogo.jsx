export default function GlowfyLogo({ className = "w-9 h-9", size = 36 }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 shadow-sm shadow-emerald-500/20 text-white flex-shrink-0 select-none overflow-hidden group ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle soft radiant sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 pointer-events-none" />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[70%] h-[70%] relative z-10"
      >
        {/* Soft center ambient glow */}
        <circle cx="50" cy="50" r="34" fill="white" fillOpacity="0.14" />

        {/* Dynamic Curved Petal Loop (Hair / Care / Aesthetics) */}
        <path
          d="M 50 18 C 68 18 82 32 82 50 C 82 68 68 82 50 82 C 34 82 24 70 24 56 C 24 44 33 36 44 36 C 54 36 60 42 60 50 C 60 56 56 60 50 60 C 46 60 43 57 43 53"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Radiant Sparkle (Glow & Star) */}
        <path
          d="M 68 22 Q 72 31 81 35 Q 72 39 68 48 Q 64 39 55 35 Q 64 31 68 22 Z"
          fill="#FEF08A"
        />
        <circle cx="68" cy="35" r="2" fill="white" />
      </svg>
    </div>
  );
}
