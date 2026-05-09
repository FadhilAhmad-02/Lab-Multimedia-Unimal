import * as React from "react";

export interface OutlineFillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  /** Background warna dasar button (sebelum hover) */
  baseBackground?: string;
  /** Background layer fill yang muncul saat hover, bisa gradient */
  fillBackground?: string;
  /** Border — default "none" */
  borderValue?: string;
  /** Warna teks sebelum hover */
  textColor?: string;
  /** Warna teks saat hover (fill penuh) */
  filledTextColor?: string;
  /** Class tambahan untuk inner content span (padding, font-size, dll) */
  contentClassName?: string;
}

export const OutlineFillButton = React.forwardRef<
  HTMLButtonElement,
  OutlineFillButtonProps
>(
  (
    {
      children,
      direction = "up",
      duration = 0.35,
      baseBackground = "transparent",
      fillBackground = "#2E7D32",
      borderValue = "none",
      textColor = "#ffffff",
      filledTextColor = "#ffffff",
      contentClassName = "px-8 py-3.5 font-semibold text-sm",
      className = "",
      style,
      ...props
    },
    ref,
  ) => {
    const [filled, setFilled] = React.useState(false);

    const clipMap: Record<string, { initial: string; filled: string }> = {
      up:    { initial: "inset(100% 0 0 0)", filled: "inset(0 0 0 0)" },
      down:  { initial: "inset(0 0 100% 0)", filled: "inset(0 0 0 0)" },
      left:  { initial: "inset(0 100% 0 0)", filled: "inset(0 0 0 0)" },
      right: { initial: "inset(0 0 0 100%)", filled: "inset(0 0 0 0)" },
    };

    const clip = clipMap[direction];

    return (
      <button
        ref={ref}
        onMouseEnter={() => setFilled(true)}
        onMouseLeave={() => setFilled(false)}
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl cursor-pointer focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${className}`}
        style={{
          border: borderValue,
          background: baseBackground,
          color: filled ? filledTextColor : textColor,
          transition: `color ${duration}s ease-out`,
          ...style,
        }}
        {...props}
      >
        {/* Layer fill yang naik/turun/geser saat hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: fillBackground,
            clipPath: filled ? clip.filled : clip.initial,
            transition: `clip-path ${duration}s ease-out`,
          }}
        />

        {/* Konten */}
        <span
          className={`relative z-10 flex items-center gap-2 ${contentClassName}`}
          style={{ fontFamily: "'Inter',sans-serif" }}
        >
          {children}
        </span>
      </button>
    );
  },
);

OutlineFillButton.displayName = "OutlineFillButton";
export default OutlineFillButton;