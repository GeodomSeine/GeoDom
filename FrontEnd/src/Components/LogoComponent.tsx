import React, { FC } from "react";
import HomeLogo from "../assets/logo.svg?react";
import "../styles/main.scss";
import { GeoJsonResponse, Scenario } from "../services/api";

interface LogoComponentProps {
    containerSize?: string | number;
    size?: string | number;
    link?: string | null;
    Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    customColor?: string;
    className?:string |null;
    onClick?: () => void;
    program?: string;
    selectedVariables?: string[];
    selectedScenarios?: Scenario[];
    idHydStart?: number | null;
    idHydEnd?: number | null;
	download?: boolean;
    selectedPk?: GeoJsonResponse;
    selectedStralher?: string | null;
}

const LogoComponent: FC<LogoComponentProps> = ({
    size = "70px",
    link = null,
    Icon = HomeLogo,
    customColor = "var(--basic-black)",
    containerSize = size,
    className= "logo_container",
    onClick,
    program,
    selectedVariables,
    selectedScenarios,
    idHydStart,
    idHydEnd,
	download,
    selectedPk,
    selectedStralher
}) => {

    const containerStyle: React.CSSProperties = {
        width: containerSize,
        height: containerSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };
    const svgStyle: React.CSSProperties = {
        width: size,
        height: size,
    };

    if (link) {  
        const createDownloadLink = () => {
            if (!download) return link;
        
            const data = {
                name: program,
                complete: selectedStralher !== null,
                selected_order: selectedStralher,
                pk_start: idHydStart,
                pk_end: idHydEnd,
                selected_pk: selectedPk,
                variables: selectedVariables,
                scenarios: selectedScenarios,
            };
        
            const jsonString = JSON.stringify(data, null, '\t');
            const blob = new Blob([jsonString], { type: 'application/json' });
            return URL.createObjectURL(blob); // Crée et retourne l'URL pour le blob
        };
        
        const downloadLink = createDownloadLink();
        
        return (
            <a
                className={`${className}`}
                href={downloadLink}
                target={download ? undefined : "_blank"}
                rel={download ? undefined : "noopener noreferrer"}
                style={containerStyle}
                download={download ? link : undefined}
            >
                <Icon style={svgStyle}/>
            </a>
        );        
    } else {
        return (
            <div className={`${className}`}  style={containerStyle} onClick={onClick}>
                <Icon style={svgStyle} color={customColor}/>
            </div>
        );
    }
};

export default LogoComponent;