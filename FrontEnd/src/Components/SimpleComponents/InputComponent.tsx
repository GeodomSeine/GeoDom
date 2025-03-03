import React, { FC, useRef } from "react";
import "./InputComponent.scss";
import ButtonComponent from "./ButtonComponent";

interface SelectOption {
  value: string;
  label: string;
}

interface InputComponentProps {
  type?: React.HTMLInputTypeAttribute | "textarea" | "select";
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  selectedFile?: string | null;
  required?: boolean;
  value?: string | number | readonly string[];
  selectOptions?: SelectOption[];
  children?: React.ReactNode;
}

const InputComponent: FC<InputComponentProps> = ({
  type = "checkbox",
  label,
  disabled = false,
  checked = false,
  className = type,
  onChange,
  selectedFile = null,
  required,
  value,
  // selectOptions,
  // children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  switch (type) {
    case "file":
      return (
        <div className={`input_component type_${className}`}>
          {label && <span>{label}</span>}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          />
          <ButtonComponent
            txt={`${selectedFile ? selectedFile : "parcourir..."}`}
            onClick={handleButtonClick}
            className="button_container button_max"
          />
        </div>
      );
    case "textarea":
      return (
        <div className={`input_component type_${className}`}>
          {label && <span>{label}</span>}
          <textarea
            disabled={disabled}
            required={required}
            value={value as string}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          />
        </div>
      );
    // case "select":
    //   return (
    //     <div className={`input_component type_${className}`}>
    //       {label && <span>{label}</span>}
    //       <select
    //         disabled={disabled}
    //         required={required}
    //         value={value as string}
    //         onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
    //       >
    //         {selectOptions?.map((option) => (
    //           <option key={option.value} value={option.value}>
    //             {option.label}
    //           </option>
    //         ))}
    //       </select>
    //       {/* only when select */}
    //       {children}
    //     </div>
    //   );
    default:
      return (
        <div className={`input_component type_${className}`}>
          <label>
            {(type === "text" || type === "number" || type === "password") && (
              <span>{label}</span>
            )}
            <input
              type={type}
              disabled={disabled}
              checked={checked}
              onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
              required={required}
              value={value}
            />
            {!(type === "text" || type === "number" || type === "password") && (
              <span>{label}</span>
            )}
          </label>
        </div>
      );
  }
};

export default InputComponent;
