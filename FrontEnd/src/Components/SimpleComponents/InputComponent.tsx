import React, { FC } from "react";
import "./InputComponent.scss";

interface InputComponentProps {
  type?: React.HTMLInputTypeAttribute; // "checkbox" or "radio"
  label: string;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const InputComponent: FC<InputComponentProps> = ({
  type = "checkbox",
  label,
  disabled = false,
  checked = false,
  className = type,
  onChange,
}) => {
  return (
    <div className={`input_component type_${className}`}>
      <label>
        <input
          type={type}
          disabled={disabled}
          checked={checked}
          onChange={onChange}
        />
        <span>
          {label}
        </span>
      </label>
    </div>
  );
};

export default InputComponent;