import React, { FC, useRef } from "react";
import "./InputComponent.scss";
import ButtonComponent from "./ButtonComponent";

interface InputComponentProps {
  // type of the input wanted (warning some of them are doesnt have style, only checkbox, radio, text, password, number, file and also textarea supported)
  type?: React.HTMLInputTypeAttribute | "textarea" | "select";
  // label, if the element is disable, checked by default
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  // on change function
  onChange?: React.ChangeEventHandler< HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement >;
  // the name of the selected file
  selectedFile?: string | null;
  // required fields in case of a form
  required?: boolean;
  // default value of the input
  value?: string | number | readonly string[];
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
}) => {
  // used to mimic the behavior of an input type file, but here with a better visual, using a ButtonComponent
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
