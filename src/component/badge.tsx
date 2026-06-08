export type BadgeVariant =
  | "green"
  | "red"
  | "blue"
  | "yellow"
  | "purple"
  | "gray"
  | "indigo"
  | "orange";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  className?: string;
  showDot?: boolean;
}

const variantClasses: Record<BadgeVariant, { container: string; dot: string; text: string }> = {
  green: {
    container: "bg-green-50/80 border border-green-100",
    dot: "bg-green-400",
    text: "text-green-500",
  },
  red: {
    container: "bg-red-50/80 border border-red-100",
    dot: "bg-red-400",
    text: "text-red-500",
  },
  blue: {
    container: "bg-blue-50/80 border border-blue-100",
    dot: "bg-blue-400",
    text: "text-blue-500",
  },
  yellow: {
    container: "bg-yellow-50/80 border border-yellow-100",
    dot: "bg-yellow-400",
    text: "text-yellow-600",
  },
  purple: {
    container: "bg-purple-50/80 border border-purple-100",
    dot: "bg-purple-400",
    text: "text-purple-500",
  },
  gray: {
    container: "bg-slate-50/80 border border-slate-100",
    dot: "bg-slate-400",
    text: "text-slate-500",
  },
  indigo: {
    container: "bg-indigo-50/80 border border-indigo-100",
    dot: "bg-indigo-400",
    text: "text-indigo-500",
  },
  orange: {
    container: "bg-orange-50/80 border border-orange-100",
    dot: "bg-orange-400",
    text: "text-orange-500",
  },
};

export default function Badge({
  text,
  variant = "green",
  className = "",
  showDot = true,
}: BadgeProps) {
  const selected = variantClasses[variant] || variantClasses.green;

  return (
    <div
      className={`px-2.5 py-1.5 ${selected.container} rounded-[16px] inline-flex justify-center items-center gap-2 transition-all ${className}`}
    >
      {showDot && <div className={`size-1.5 ${selected.dot} rounded-full`} />}
      <div className={`justify-start ${selected.text} text-sm font-normal font-sans`}>
        {text}
      </div>
    </div>
  );
}
