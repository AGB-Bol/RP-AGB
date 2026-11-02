import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  ReactNode;
  rightSlot?: ReactNode;
  id:         string;       /* required for label association */
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightSlot,
  id,
  className = "",
  ...rest
}: InputProps) {
  const inputClass = [
    "form-input",
    leftIcon  ? "form-input--left-icon"  : "",
    rightSlot ? "form-input--right-slot" : "",
    error     ? "form-input--error"      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      <div className="form-input-wrap">
        {leftIcon && (
          <span className="form-input-icon-left" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input id={id} className={inputClass} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} aria-invalid={!!error} {...rest} />

        {rightSlot && (
          <span className="form-input-icon-right">{rightSlot}</span>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="form-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
