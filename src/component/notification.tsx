import { useEffect, useState } from "react";

export type NotificationType = "error" | "default" | "success";

export interface NotificationProps {
  isOpen: boolean;
  message: string;
  type?: NotificationType;
  onClose: () => void;
  duration?: number; // duration in ms, defaults to 4000. Set to 0 to disable auto-close.
  className?: string;
}

const variantConfig: Record<
  NotificationType,
  {
    container: string;
    icon: string;
    iconColor: string;
    textColor: string;
  }
> = {
  success: {
    container: "bg-green-50/95 border-green-200/60 shadow-green-100/40 text-green-800",
    icon: "Tick Circle",
    iconColor: "bg-green-600",
    textColor: "text-green-800",
  },
  error: {
    container: "bg-red-50/95 border-red-200/60 shadow-red-100/40 text-red-800",
    icon: "Danger Circle",
    iconColor: "bg-[#E02828]",
    textColor: "text-[#E02828]",
  },
  default: {
    container: "bg-blue-50/95 border-blue-200/60 shadow-blue-100/40 text-blue-800",
    icon: "Information Circle",
    iconColor: "bg-[#3F71B7]",
    textColor: "text-[#3F71B7]",
  },
};

export default function Notification({
  isOpen,
  message,
  type = "default",
  onClose,
  duration = 4000,
  className = "",
}: NotificationProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateState, setAnimateState] = useState<"enter" | "exit">("exit");

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Wait for the render frame before animating in
      const frame = requestAnimationFrame(() => {
        setAnimateState("enter");
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setAnimateState("exit");
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // match duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!shouldRender) return null;

  const currentVariant = variantConfig[type] || variantConfig.default;

  return (
    <div
      className={`fixed top-24 right-6 z-50 max-w-sm w-full md:max-w-md rounded-2xl border px-4 py-3.5 flex items-start justify-between gap-3 shadow-lg transition-all duration-300 transform font-sans ${
        animateState === "enter"
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-0 translate-x-8 scale-95"
      } ${currentVariant.container} ${className}`}
    >
      {/* Content wrapper */}
      <div className="flex items-start gap-3 flex-1">
        {/* State Icon */}
        <span
          style={{
            maskImage: `url("/icons/${currentVariant.icon}.svg")`,
            WebkitMaskImage: `url("/icons/${currentVariant.icon}.svg")`,
          }}
          className={`size-5 ${currentVariant.iconColor} mask-contain mask-no-repeat mask-center shrink-0 mt-0.5`}
          aria-hidden="true"
        />

        {/* Text-sm Message */}
        <div className={`text-sm font-medium leading-relaxed wrap-break-word ${currentVariant.textColor}`}>
          {message}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-black hover:text-black/70 hover:bg-slate-100/50 transition-all cursor-pointer flex items-center justify-center shrink-0"
        title="Close"
      >
        <span
          style={{
            maskImage: 'url("/icons/Close.svg")',
            WebkitMaskImage: 'url("/icons/Close.svg")',
          }}
          className="size-4 bg-current mask-contain mask-no-repeat mask-center"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
