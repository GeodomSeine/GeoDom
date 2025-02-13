import React, { ReactNode, useState } from "react";
import "./ToggleComponent.scss";
import Arrow from "../../assets/down_arrow.svg?react";
import LogoComponent from "../LogoComponent";

interface ToggleContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const ToggleContainer: React.FC<ToggleContainerProps> = ({
  title,
  children,
  className = "space_container",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={className}>
      <div className="space_header">
        <h2>{title}</h2>
        <LogoComponent
          className={isVisible ? "is_visible" : "set_is_visible"}
          size={"35px"}
          Icon={Arrow}
          onClick={() => setIsVisible((prev) => !prev)}/>
      </div>
      <div className={`space_body ${isVisible ? "" : "hidden"}`}>
        {children}
      </div>
    </div>
  );
};

export default ToggleContainer;
