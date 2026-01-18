"use client";

import { useState, useEffect } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

// Format phone number as user types
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

// Validate phone number (US format)
export function validatePhoneNumber(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  
  if (!digits) {
    return "Phone number is required";
  }
  
  if (digits.length < 10) {
    return "Please enter a valid 10-digit phone number";
  }
  
  if (digits.length > 10) {
    return "Phone number is too long";
  }
  
  return null;
}

// Get raw digits from formatted number
export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export default function PhoneInput({
  value,
  onChange,
  error,
  disabled = false,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(formatPhoneNumber(value));

  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, "").slice(0, 10);
    const formatted = formatPhoneNumber(digits);
    setDisplayValue(formatted);
    onChange(digits);
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor="phone"
        className="block text-sm font-medium text-gray-700"
      >
        Phone Number
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          +1
        </span>
        <input
          type="tel"
          id="phone"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="(555) 123-4567"
          className={`
            w-full pl-10 pr-4 py-2.5 rounded-lg border
            transition-colors duration-200
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        We&apos;ll call this number to run the test
      </p>
    </div>
  );
}
