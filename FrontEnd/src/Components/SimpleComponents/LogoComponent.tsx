import React, { FC } from "react";
import HomeLogo from "../../assets/logo.svg?react";
import "../../styles/main.scss";
import "./LogoComponent.scss";

interface LogoComponentProps {
    containerSize?: string | number;
    size?: string | number;
    onClick?: () => void;
    Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    customColor?: string;
    className?: string | null;
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