import { type InputHTMLAttributes, type ReactNode } from "react";

interface InputBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label?: ReactNode;
  placeholder?: string;
  rightIcon?: string;
  onRightIconClick?: () => void;
  containerClassName?: string;
  rightIconClassName?: string;
}

export default function InputBox({
  label,
  placeholder,
  rightIcon,
  onRightIconClick,
  className = "",
  containerClassName = "",
  type = "text",
  rightIconClassName = "",
  ...props
}: InputBoxProps) {
  // Helper to format the icon filename
  const getIconSrc = (iconName: string) => {
    const formattedName = iconName.endsWith(".svg") ? iconName : `${iconName}.svg`;
    return `/icons/${formattedName}`;
  };

  return (
    <div className={`w-full max-w-116.5 inline-flex flex-col justify-start items-start gap-2 ${containerClassName}`}>
      {label && (
        <label className="self-stretch justify-start text-primary text-sm font-normal font-sans">
          {label}
        </label>
      )}
      <div className="self-stretch h-12 px-4 py-3 bg-indigo-50 rounded-lg outline -outline-offset-1 outline-primary focus-within:outline-primary/80 focus-within:ring-2 focus-within:ring-primary/20 inline-flex justify-between items-center transition-all gap-2">
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full bg-transparent text-black text-base font-normal font-sans placeholder:text-[#9EB7DA] outline-none border-none ${className}`}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            disabled={!onRightIconClick}
            className={`size-6 mask-contain mask-no-repeat mask-center shrink-0 transition-colors ${
              rightIconClassName || "bg-slate-500 hover:bg-slate-700"
            } ${
              onRightIconClick ? "cursor-pointer" : "pointer-events-none"
            }`}
            style={{
              maskImage: `url("${getIconSrc(rightIcon)}")`,
              WebkitMaskImage: `url("${getIconSrc(rightIcon)}")`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
