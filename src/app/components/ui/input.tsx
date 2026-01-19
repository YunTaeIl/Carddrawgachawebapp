import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-12 w-full rounded-lg border border-[#2B6CFF]/30 bg-[#0B0F1A] px-4 py-2 text-base text-[#EAF0FF] placeholder:text-[#9AA6C3] focus:outline-none focus:ring-2 focus:ring-[#2B6CFF] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
