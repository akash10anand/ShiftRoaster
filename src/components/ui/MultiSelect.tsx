import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface MultiSelectProps extends Omit<
  React.InputHTMLAttributes<HTMLDivElement>,
  "onChange" | "value"
> {
  options: { id: string; label: string; disabled?: boolean }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Search and select items...",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleOption = (optionId: string) => {
      if (value.includes(optionId)) {
        onChange(value.filter((id) => id !== optionId));
      } else {
        onChange([...value, optionId]);
      }
    };

    const handleRemoveValue = (optionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((id) => id !== optionId));
    };

    const selectedLabels = value
      .map((id) => options.find((opt) => opt.id === id)?.label)
      .filter(Boolean);

    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !value.includes(option.id),
    );

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className,
          )}
        >
          {selectedLabels.map((label) => {
            const optionId = value.find(
              (id) => options.find((opt) => opt.id === id)?.label === label,
            );
            return (
              <div
                key={optionId}
                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveValue(optionId!, e);
                  }}
                  disabled={disabled}
                  className="hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedLabels.length === 0 ? placeholder : ""}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => searchQuery.length > 0 && setIsOpen(true)}
            disabled={disabled}
            className="flex-1 outline-none bg-transparent text-base md:text-sm min-w-48"
          />
        </div>

        {isOpen && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-md">
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggleOption(option.id)}
                    disabled={option.disabled}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm hover:bg-accent transition-colors",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
