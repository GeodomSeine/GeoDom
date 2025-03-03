import React, { ReactNode, useState } from "react";
import "./ToggleComponent.scss";
import Arrow from "../../assets/right_arrow.svg?react";
import LogoComponent from "../SimpleComponents/LogoComponent";

interface ToggleContainerProps {
  title: string;
  children: ReactNode;
  secondChild?:ReactNode;
  className?: string;
  containsTile?: boolean;
}

const ToggleContainer: React.FC<ToggleContainerProps> = ({
  title,
  children,
  secondChild,
  className,
  containsTile,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={`space_container ${className}`}>
      <div className="space_header" onClick={() => setIsVisible((prev) => !prev)}>
        <h2>{title}</h2>
        <LogoComponent
          className={isVisible ? "is_visible" : "set_is_visible"}
          size={"35px"}
          Icon={Arrow}
          customColor=""
        />
      </div>
      <div className={`space_body ${isVisible ? "" : "hidden"}`}>
        {containsTile && secondChild && (
          <>
            <div className="space_body_tile">
              {children}
            </div>
            <div className="space_body_footer">
              {secondChild}
            </div>
          </>
        )}
        {containsTile && !secondChild && (
          <div className="space_body_tile">
            {children}
          </div>
        )}
        {!containsTile && !secondChild && (
          children
        )}
        {!containsTile && secondChild &&(
          <>
            <div className="space_body_block">
              {children}
            </div>
            <div className="space_body_footer">
              {secondChild}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ToggleContainer;
