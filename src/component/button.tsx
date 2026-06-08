import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "outline-white"
  | "outline-primary"
  | "slate-primary"
  | "ghost-primary"
  | "ghost-white"
  | "ghost-black";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  leftIcon?: string;
  rightIcon?: string;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-linear-to-r from-[#3F71B7] to-[#3365AC] text-white hover:opacity-95",
  "outline-white": "bg-transparent text-white outline outline-2 outline-offset-[-2px] outline-white hover:bg-white/10",
  "outline-primary": "bg-transparent text-[#3F71B7] outline outline-2 outline-offset-[-2px] outline-[#3F71B7] hover:bg-[#3F71B7]/10",
  "slate-primary": "bg-linear-to-r from-[#3F71B7] to-[#3365AC] text-white hover:opacity-95",
  "ghost-primary": "bg-transparent text-[#3F71B7] hover:bg-[#3F71B7]/10",
  "ghost-white": "bg-transparent text-white hover:bg-white/10",
  "ghost-black": "bg-transparent text-black hover:bg-black/10",
};

export default function Button({
  text,
  leftIcon,
  rightIcon,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  // Helper to format the icon filename
  const getIconSrc = (iconName: string) => {
    const formattedName = iconName.endsWith(".svg") ? iconName : `${iconName}.svg`;
    return `/icons/${formattedName}`;
  };

  const selectedVariantClass = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      className={`h-12 px-6 py-3 rounded-[48px] inline-flex justify-center items-center gap-2.5 text-base font-medium font-sans active:scale-98 transition-all cursor-pointer ${selectedVariantClass} ${className}`}
      {...props}
    >
      {leftIcon && (
        <span
          style={{
            maskImage: `url("${getIconSrc(leftIcon)}")`,
            WebkitMaskImage: `url("${getIconSrc(leftIcon)}")`,
          }}
          className="size-6 bg-current mask-contain mask-no-repeat mask-center shrink-0"
          aria-hidden="true"
        />
      )}
      <span className="leading-none">{text}</span>
      {rightIcon && (
        <span
          style={{
            maskImage: `url("${getIconSrc(rightIcon)}")`,
            WebkitMaskImage: `url("${getIconSrc(rightIcon)}")`,
          }}
          className="size-6 bg-current mask-contain mask-no-repeat mask-center shrink-0"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
