import React, { FC } from "react";
import HomeLogo from "../../assets/logo.svg?react";
import "../../styles/main.scss";
import "./LogoComponent.scss";

interface LogoComponentProps {
    // the size of the container of the svg element 
    containerSize?: string | number;
    // the size of the element itself
    size?: string | number;
    // function onclick
    onClick?: () => void;
    // the icon wanted
    Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    // the icon color
    customColor?: string;
    className?: string | null;
    // cursor type when :hover
    cursor?: string;
}

const LogoComponent: FC<LogoComponentProps> = ({
    size = "70px",
    onClick,
    Icon = HomeLogo,
    customColor = "var(--basic-black)",
    containerSize = size,
    className = "logo_container",
    cursor = "pointer",
}) => {
    const containerStyle: React.CSSProperties = {
        width: containerSize,
        height: containerSize,
        cursor: cursor, 
        color: "inherit",
    };
    const svgStyle: React.CSSProperties = {
        width: size,
        height: size,
    };

    // return a 'a' element if there is interaction or a 'div' if not
    return cursor != 'default' ?(
        <a className={className || "logo_container"} style={containerStyle} onClick={onClick}>
            <Icon color={`${customColor}`} style={svgStyle}/>
        </a>
    ) : (
        <div className={className || "logo_container"} style={containerStyle}>
            <Icon color={`${customColor}`} style={svgStyle}/>
        </div>
    );
};

export default LogoComponent;