import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: ReactNode;
  searchLabel?: string;
}

interface BaseDropdownProps {
  label?: ReactNode;
  placeholder?: string;
  options: DropdownOption[];
  containerClassName?: string;
  disabled?: boolean;
  selectClassName?: string;
  allowCustomValues?: boolean;
}

interface SingleDropdownProps extends BaseDropdownProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultipleDropdownProps extends BaseDropdownProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type DropdownProps = SingleDropdownProps | MultipleDropdownProps;

const Icon = ({ name, className = "size-5 bg-current" }: { name: string; className?: string }) => (
  <span
    style={{
      maskImage: `url("/icons/${name}.svg")`,
      WebkitMaskImage: `url("/icons/${name}.svg")`,
    }}
    className={`mask-contain mask-no-repeat mask-center shrink-0 inline-block ${className}`}
    aria-hidden="true"
  />
);

export default function Dropdown({
  label,
  placeholder = "Select option...",
  options,
  value,
  onChange,
  multiple = false,
  containerClassName = "",
  disabled = false,
  selectClassName = "bg-indigo-50",
  allowCustomValues = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((option) => {
    const labelStr = typeof option.label === "string" ? option.label : option.searchLabel || "";
    return labelStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to check if an option is selected
  const isSelected = (val: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  // Toggle selection
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const nextValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      
      (onChange as (val: string[]) => void)(nextValues);
    } else {
      (onChange as (val: string) => void)(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  // Remove single item in multi-select chips
  const handleRemoveItem = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      (onChange as (val: string[]) => void)(value.filter((v) => v !== optionValue));
    }
  };

  // Get display text/elements for input field
  const getSelectedLabels = () => {
    if (multiple && Array.isArray(value)) {
      return value.map((val) => {
        const found = options.find((opt) => opt.value === val);
        return found || { value: val, label: val };
      });
    }
    const singleOpt = options.find((opt) => opt.value === value);
    if (!singleOpt && value) {
      return [{ value: value as string, label: value as string }];
    }
    return singleOpt ? [singleOpt] : [];
  };

  const selectedOptions = getSelectedLabels();

  const hasExactMatch = options.some((opt) => {
    const labelStr = typeof opt.label === "string" ? opt.label : opt.searchLabel || opt.value;
    return labelStr.toLowerCase() === searchQuery.trim().toLowerCase();
  });

  const showCustomAddOption = allowCustomValues && searchQuery.trim() !== "" && !hasExactMatch;

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[466px] inline-flex flex-col justify-start items-start gap-2 relative ${containerClassName}`}
    >
      {label && (
        <label className="self-stretch justify-start text-primary text-sm font-normal font-sans">
          {label}
        </label>
      )}

      {/* Select Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`self-stretch min-h-[48px] px-4 py-2 ${selectClassName} rounded-lg outline -outline-offset-1 transition-all flex justify-between items-center gap-2 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed outline-slate-200" : "outline-primary focus-within:ring-2 focus-within:ring-primary/20"
        } ${isOpen ? "ring-2 ring-primary/20 outline-primary/80" : ""}`}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden">
          {/* Chips for Multiple Select */}
          {multiple && selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <div
                key={opt.value}
                className="bg-primary/15 text-primary text-sm font-medium font-sans px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors border border-primary/20"
              >
                <span>{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveItem(e, opt.value)}
                  className="size-4 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center transition-all cursor-pointer"
                >
                  <Icon name="Close" className="size-3 bg-current" />
                </button>
              </div>
            ))
          ) : !multiple && selectedOptions.length > 0 && !isOpen ? (
            <span className="text-black text-base font-normal font-sans">
              {selectedOptions[0].label}
            </span>
          ) : null}

          {/* Interactive Search Input inside Select Box */}
          {(!multiple || selectedOptions.length === 0 || isOpen) && (
            <input
              type="text"
              disabled={disabled}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              placeholder={
                selectedOptions.length > 0
                  ? ""
                  : placeholder
              }
              className="flex-1 bg-transparent text-black text-base font-normal font-sans placeholder:text-[#9EB7DA] outline-none border-none min-w-[60px]"
            />
          )}
        </div>

        {/* Dropdown Arrow Indicator */}
        <div
          className={`size-6 text-slate-500 flex items-center justify-center transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        >
          <Icon name="Down 2" className="size-4 bg-current" />
        </div>
      </div>

      {/* Options Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200/80 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 animate-fade-in">
          {filteredOptions.length === 0 && !showCustomAddOption ? (
            <div className="py-3 px-4 text-center text-[#9EB7DA] text-sm font-sans">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const active = isSelected(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 rounded-lg flex items-center justify-between text-base font-normal font-sans cursor-pointer transition-colors ${
                    active
                      ? "bg-primary-light/50 text-primary font-medium"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {active && (
                    <Icon name="Tick" className="size-5 bg-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}

          {showCustomAddOption && (
            <div
              onClick={() => handleSelect(searchQuery.trim())}
              className="px-4 py-2.5 rounded-lg flex items-center justify-between text-base font-medium font-sans text-primary hover:bg-slate-50 cursor-pointer border-t border-slate-100"
            >
              <span>Add "{searchQuery.trim()}"</span>
              <Icon name="Add" className="size-4 bg-primary shrink-0 animate-pulse" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
