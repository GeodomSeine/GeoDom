import React, { ReactNode, useState } from "react";
import "./ToggleComponent.scss";
import Arrow from "../../assets/down_arrow.svg?react";
import LogoComponent from "../SimpleComponents/LogoComponent";

interface ToggleContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
  containsTile?: boolean;
}

const ToggleContainer: React.FC<ToggleContainerProps> = ({
  title,
  children,
  className = "space_container",
  containsTile,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={className}>
      <div className="space_header" onClick={() => setIsVisible((prev) => !prev)}>
        <h2>{title}</h2>
        <LogoComponent
          className={isVisible ? "is_visible" : "set_is_visible"}
          size={"35px"}
          Icon={Arrow}
        />
      </div>
      <div className={`space_body ${isVisible ? "" : "hidden"}`}>
      {containsTile ? (
        <div className="space_body_tile">
          {children}
        </div>
      ) : (
        children
      )}
      </div>
    </div>
  );
};

export default ToggleContainer;
