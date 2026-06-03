import { useEffect, useRef } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

const OtpInput = ({ value, onChange, length = 6, disabled }: Props) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const values = Array.from({ length }).map((_, index) => value[index] || "");

  const focusInput = (index: number) => {
    const node = inputsRef.current[index];
    if (node) {
      node.focus();
      node.select();
    }
  };

  const handleChange = (index: number, nextValue: string) => {
    const digit = nextValue.replace(/\D/g, "");
    const updated = value.split("");
    updated[index] = digit.charAt(digit.length - 1) || "";
    const merged = updated.join("").slice(0, length);
    onChange(merged);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent) => {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    onChange(pasted.slice(0, length));
  };

  useEffect(() => {
    if (value.length === 0) {
      focusInput(0);
    }
  }, [value.length]);

  return (
    <div className="flex items-center gap-2" onPaste={handlePaste}>
      {values.map((digit, index) => (
        <input
          key={`otp-${index}`}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="h-11 w-10 rounded-lg border border-gray-200 bg-white text-center text-sm font-medium text-gray-800 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/10 disabled:bg-gray-100"
        />
      ))}
    </div>
  );
};

export default OtpInput;
