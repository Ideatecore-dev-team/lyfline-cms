import { type TextareaHTMLAttributes, type ReactNode } from "react";

interface DescriptionBoxProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder"> {
  label?: ReactNode;
  placeholder?: string;
  containerClassName?: string;
}

export default function DescriptionBox({
  label,
  placeholder,
  className = "",
  containerClassName = "",
  rows = 4,
  ...props
}: DescriptionBoxProps) {
  return (
    <div className={`w-full max-w-[466px] inline-flex flex-col justify-start items-start gap-2 ${containerClassName}`}>
      {label && (
        <label className="self-stretch justify-start text-primary text-sm font-normal font-sans">
          {label}
        </label>
      )}
      <div className="self-stretch px-4 py-3 bg-indigo-50 rounded-lg outline -outline-offset-1 outline-primary focus-within:outline-primary/80 focus-within:ring-2 focus-within:ring-primary/20 inline-flex justify-between items-start transition-all gap-2">
        <textarea
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-transparent text-black text-base font-normal font-sans placeholder:text-[#9EB7DA] outline-none border-none resize-y min-h-[80px] ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
